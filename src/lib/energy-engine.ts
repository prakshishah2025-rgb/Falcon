import { HOMES, WEATHER, GRID_PRICES, APPLIANCES, COMPUTE_NODES, COMPUTE_JOBS, Home, Appliance, ComputeNode, ComputeJob } from "@/constants/homes";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const rupees = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export function getHourLabel(hour: number): string {
  const normalized = hour % 24;
  if (normalized === 0) return "12 AM";
  if (normalized === 12) return "12 PM";
  return normalized < 12 ? `${normalized} AM` : `${normalized - 12} PM`;
}

export function forecastForHome(home: Home, dayOffset = 0) {
  return Array.from({ length: 24 }, (_, hour) => {
    const daylight = Math.sin(((hour - 6) / 12) * Math.PI);
    const sunCurve = clamp(daylight, 0, 1);
    const cloudCover = clamp(WEATHER[(hour + dayOffset) % WEATHER.length] / 100, 0, 0.95);
    const panelOutput = home.solarKw * sunCurve * (1 - cloudCover * 0.72);
    const eveningReserve = hour >= 17 && hour <= 21 ? 0.75 : 0;
    const homeDemand = home.baseDemand / 24 + eveningReserve;
    const batteryBuffer = home.batteryKwh * 0.08;
    const surplus = Math.max(0, panelOutput - homeDemand - batteryBuffer / 24);

    return {
      hour,
      sunScore: Math.round(sunCurve * 100),
      cloudCover: Math.round(cloudCover * 100),
      gridPrice: GRID_PRICES[hour],
      generation: Number(panelOutput.toFixed(2)),
      expectedDemand: Number(homeDemand.toFixed(2)),
      surplus: Number(surplus.toFixed(2)),
    };
  });
}

export function neighborhoodForecast(dayOffset = 0) {
  return Array.from({ length: 24 }, (_, hour) => {
    const homeForecasts = HOMES.map((home) => forecastForHome(home, dayOffset)[hour]);
    const generation = homeForecasts.reduce((sum, item) => sum + item.generation, 0);
    const surplus = homeForecasts.reduce((sum, item) => sum + item.surplus, 0);
    return {
      hour,
      sunScore: homeForecasts[0].sunScore,
      cloudCover: homeForecasts[0].cloudCover,
      gridPrice: GRID_PRICES[hour],
      generation: Number(generation.toFixed(2)),
      surplus: Number(surplus.toFixed(2)),
    };
  });
}

function getProtectionLimit(mode: string) {
  if (mode === "Max Earnings") return 0.95;
  if (mode === "Max Comfort") return 0.45;
  return 0.68;
}

export function calculateHomeStatus(dayOffset = 0, gridAlert = false) {
  return HOMES.map((home) => {
    const forecast = forecastForHome(home, dayOffset);
    const dailyGeneration = forecast.reduce((sum, hour) => sum + hour.generation, 0);
    const surplus = forecast.reduce((sum, hour) => sum + hour.surplus, 0);
    const need = Math.max(0, home.baseDemand - dailyGeneration - (home.batteryKwh * home.batteryLevel) / 100 * 0.35);
    const role = surplus >= 2.5 ? "seller" : "buyer";

    const node = COMPUTE_NODES.find((item) => item.homeId === home.id);
    return {
      ...home,
      dailyGeneration: Number(dailyGeneration.toFixed(1)),
      surplusKwh: Number(surplus.toFixed(1)),
      needKwh: Number(need.toFixed(1)),
      role,
      computeNode: node,
      computeLimitKw: node ? Number((node.maxKw * getProtectionLimit(node.comfortMode) * (gridAlert ? 0.35 : 1)).toFixed(1)) : 0,
    };
  });
}

export function matchMarket(dayOffset = 0, gridAlert = false) {
  const status = calculateHomeStatus(dayOffset, gridAlert);
  const sellers = status
    .filter((home) => home.role === "seller")
    .map((home) => ({ ...home, available: home.surplusKwh * 0.82 }));
  const buyers = status
    .filter((home) => home.role === "buyer")
    .map((home) => ({ ...home, demand: Math.max(2, home.needKwh * 0.45) }));
  const nonSolarReserve = buyers.filter((home) => home.solarKw < 1).length * 1.2;
  let fairnessReserve = gridAlert ? nonSolarReserve * 1.25 : nonSolarReserve;

  const matches = [];

  buyers.forEach((buyer) => {
    sellers
      .filter((seller) => seller.available > 0 && seller.minSellPrice <= buyer.maxBidPrice)
      .sort((a, b) => {
        const scoreA = a.minSellPrice + Math.abs(a.distanceKm - buyer.distanceKm) * 0.35 - a.available * 0.04;
        const scoreB = b.minSellPrice + Math.abs(b.distanceKm - buyer.distanceKm) * 0.35 - b.available * 0.04;
        return scoreA - scoreB;
      })
      .forEach((seller) => {
        if (buyer.demand <= 0 || seller.available <= 0) return;
        const fairnessBoost = buyer.solarKw < 1 && fairnessReserve > 0 ? 1.35 : 1;
        const traded = Number(Math.min(buyer.demand * fairnessBoost, seller.available, 4.5).toFixed(1));
        const distance = Math.abs(seller.distanceKm - buyer.distanceKm) + 0.2;
        const marketPrice = Number(((seller.minSellPrice + buyer.maxBidPrice) / 2 - Math.min(0.5, distance * 0.12)).toFixed(2));
        const gridCost = traded * GRID_PRICES[18];
        const localCost = traded * marketPrice;

        matches.push({
          seller: seller.name,
          buyer: buyer.name,
          kwh: traded,
          price: marketPrice,
          distance: Number(distance.toFixed(1)),
          buyerSavings: Number((gridCost - localCost).toFixed(1)),
          sellerEarnings: Number((traded * marketPrice).toFixed(1)),
        });

        seller.available = Number((seller.available - traded).toFixed(1));
        buyer.demand = Number((buyer.demand - traded).toFixed(1));
        if (buyer.solarKw < 1) fairnessReserve = Math.max(0, fairnessReserve - traded);
      });
  });

  return matches;
}

export function optimizeAppliances(dayOffset = 0, gridAlert = false) {
  const forecast = neighborhoodForecast(dayOffset);
  return APPLIANCES.map((load) => {
    const options = [];
    for (let start = 6; start <= load.deadline - load.durationHours; start += 1) {
      const window = forecast.slice(start, start + load.durationHours);
      const solarScore = window.reduce((sum, hour) => sum + hour.surplus, 0) / load.durationHours;
      const priceScore = window.reduce((sum, hour) => sum + hour.gridPrice, 0) / load.durationHours;
      const score = solarScore * 1.3 - priceScore;
      options.push({ start, score, solarScore, priceScore });
    }
    const best = options.sort((a, b) => b.score - a.score)[0];
    const oldStart = Math.max(17, load.deadline - load.durationHours);
    const oldCost = load.energyKwh * GRID_PRICES[oldStart];
    const newCost = load.energyKwh * best.priceScore * (gridAlert ? 0.7 : 0.78);

    return {
      ...load,
      home: HOMES.find((home) => home.id === load.homeId)?.name ?? load.homeId,
      startHour: best.start,
      endHour: best.start + load.durationHours,
      cleanEnergyShare: clamp(Math.round((best.solarScore / 8) * 100 + 38), 45, 96),
      savings: Number((oldCost - newCost).toFixed(1)),
    };
  });
}

export function scheduleCompute(dayOffset = 0, gridAlert = false) {
  const forecast = neighborhoodForecast(dayOffset);
  const status = calculateHomeStatus(dayOffset, gridAlert);
  const schedules = [];

  COMPUTE_JOBS.forEach((job) => {
    const options = [];

    COMPUTE_NODES.forEach((node) => {
      const home = status.find((item) => item.id === node.homeId);
      for (let start = 0; start <= job.deadline - job.durationHours; start += 1) {
        const window = forecast.slice(start, start + job.durationHours);
        const homeDemandPeak = start >= 17 && start <= 21;
        const allowedByHost = node.availableHours.includes(start) || node.availableHours.includes((start + 1) % 24);
        const computeKwNeeded = job.energyKwh / job.durationHours;
        const protectedCapacity = node.maxKw * getProtectionLimit(node.comfortMode);
        const gridStressPenalty = gridAlert && homeDemandPeak ? 12 : 0;
        const comfortPenalty = computeKwNeeded > protectedCapacity ? 8 : 0;
        const cleanScore = window.reduce((sum, hour) => sum + hour.surplus + Math.max(0, 9 - hour.gridPrice), 0) / job.durationHours;
        const priceScore = window.reduce((sum, hour) => sum + hour.gridPrice, 0) / job.durationHours;
        const hostFit = allowedByHost ? 4 : -4;
        const priorityBoost = job.priority === "urgent" ? 3 : 0;
        const score = cleanScore * 1.2 + hostFit + priorityBoost - priceScore - gridStressPenalty - comfortPenalty;

        options.push({ node, home, start, score, cleanScore, priceScore, computeKwNeeded, homeDemandPeak });
      }
    });

    const best = options.sort((a, b) => b.score - a.score)[0];
    const action = gridAlert && best.homeDemandPeak && job.priority !== "urgent" ? "Migrated away from peak" : gridAlert && job.priority !== "urgent" ? "Throttled safe run" : "Run on clean power";
    const hostIncome = job.energyKwh * job.bidPerKwh;
    const energyCost = job.energyKwh * best.priceScore * 0.55;

    schedules.push({
      ...job,
      nodeName: best.node.name,
      homeName: best.home.name,
      startHour: best.start,
      endHour: best.start + job.durationHours,
      action,
      cleanShare: clamp(Math.round((best.cleanScore / 9) * 100 + 30), 42, 98),
      hostIncome: Number(hostIncome.toFixed(1)),
      netReward: Number((hostIncome - energyCost).toFixed(1)),
      protectedKw: Number((best.node.maxKw * getProtectionLimit(best.node.comfortMode)).toFixed(1)),
    });
  });

  return schedules;
}

export function batteryDecisions(dayOffset = 0, gridAlert = false) {
  const status = calculateHomeStatus(dayOffset, gridAlert).filter((home) => home.solarKw > 0);
  return status.map((home) => {
    let action = "Sell clean surplus to neighbors";
    if (home.batteryLevel < 55) action = "Charge battery before trading";
    if (home.computeNode && home.surplusKwh > 8 && !gridAlert) action = "Run flexible loads after battery reserve";
    if (gridAlert && home.batteryLevel > 65) action = "Preserve battery for household peak";

    return {
      home: home.name,
      batteryLevel: home.batteryLevel,
      surplus: home.surplusKwh,
      action,
    };
  });
}

export function timelineEvents(gridAlert = false) {
  return [
    {
      time: "12 PM",
      solar: "High",
      demand: "Low",
      action: gridAlert ? "Preserve battery and serve nearby buyers first" : "Charge batteries and sell surplus locally",
      result: "Uses otherwise-wasted solar",
    },
    {
      time: "6 PM",
      solar: "Low",
      demand: "High",
      action: gridAlert ? "Delay EV charging and flexible appliances" : "Shift non-essential usage",
      result: gridAlert ? "Avoids peak-grid stress" : "Protects household comfort",
    },
    {
      time: "11 PM",
      solar: "Low",
      demand: "Low",
      action: "Run deferred appliances if grid power is cheap",
      result: "Lower household energy cost",
    },
  ];
}

export function impactSummary(dayOffset = 0, gridAlert = false) {
  const matches = matchMarket(dayOffset, gridAlert);
  const optimized = optimizeAppliances(dayOffset, gridAlert);
  const compute = scheduleCompute(dayOffset, gridAlert);
  const traded = matches.reduce((sum, match) => sum + match.kwh, 0);
  const buyerSavings = matches.reduce((sum, match) => sum + match.buyerSavings, 0);
  const sellerEarnings = matches.reduce((sum, match) => sum + match.sellerEarnings, 0);
  const optimizerSavings = optimized.reduce((sum, load) => sum + load.savings, 0);
  const computeIncome = compute.reduce((sum, job) => sum + job.netReward, 0);
  const shiftedLoad = optimized.reduce((sum, load) => sum + load.energyKwh, 0);
  const computeShifted = compute
    .filter((job) => job.action.includes("Throttled") || job.action.includes("Migrated"))
    .reduce((sum, job) => sum + job.energyKwh, 0);
  const peakBaseline = 64;
  const peakAfter = Math.max(36, peakBaseline - shiftedLoad * 0.62 - traded * 0.28 - computeShifted * 1.1 - (gridAlert ? 7 : 0));
  const nonSolarMatches = matches.filter((match) => ["Home B", "Home D", "Home H", "Home J"].includes(match.buyer));
  const fairnessScore = clamp(Math.round((nonSolarMatches.reduce((sum, match) => sum + match.kwh, 0) / Math.max(traded, 1)) * 100), 35, 88);

  return {
    matches,
    optimized,
    compute,
    battery: batteryDecisions(dayOffset, gridAlert),
    timeline: timelineEvents(gridAlert),
    money: rupees(buyerSavings + sellerEarnings + optimizerSavings + computeIncome),
    computeIncome: rupees(sellerEarnings + computeIncome),
    energySavings: rupees(buyerSavings + optimizerSavings),
    traded: `${traded.toFixed(1)} kWh`,
    co2: `${(traded * 0.72 + shiftedLoad * 0.31 + compute.reduce((sum, job) => sum + job.energyKwh * job.cleanShare / 100 * 0.48, 0)).toFixed(1)} kg`,
    peak: `${Math.round(((peakBaseline - peakAfter) / peakBaseline) * 100)}%`,
    fairness: `${fairnessScore}/100`,
  };
}
