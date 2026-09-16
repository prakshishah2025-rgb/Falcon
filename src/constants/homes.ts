export interface Home {
  id: string;
  name: string;
  type: string;
  solarKw: number;
  batteryKwh: number;
  batteryLevel: number;
  baseDemand: number;
  distanceKm: number;
  minSellPrice: number;
  maxBidPrice: number;
  flexibleLoads: string[];
}

export interface Appliance {
  homeId: string;
  name: string;
  energyKwh: number;
  durationHours: number;
  deadline: number;
  icon: string;
}

export interface ComputeNode {
  id: string;
  homeId: string;
  name: string;
  gpu: string;
  maxKw: number;
  comfortMode: string;
  availableHours: number[];
}

export interface ComputeJob {
  id: string;
  customer: string;
  name: string;
  energyKwh: number;
  durationHours: number;
  deadline: number;
  priority: string;
  bidPerKwh: number;
}

export const HOMES: Home[] = [
  {
    id: "A",
    name: "Home A",
    type: "Solar Seller",
    solarKw: 6.2,
    batteryKwh: 10,
    batteryLevel: 74,
    baseDemand: 18,
    distanceKm: 0.2,
    minSellPrice: 5.8,
    maxBidPrice: 6.6,
    flexibleLoads: ["Battery top-up"],
  },
  {
    id: "B",
    name: "Home B",
    type: "Buyer",
    solarKw: 0,
    batteryKwh: 5,
    batteryLevel: 35,
    baseDemand: 23,
    distanceKm: 0.7,
    minSellPrice: 0,
    maxBidPrice: 7.4,
    flexibleLoads: ["EV charging", "Washing machine"],
  },
  {
    id: "C",
    name: "Home C",
    type: "Solar Seller",
    solarKw: 4.4,
    batteryKwh: 8,
    batteryLevel: 61,
    baseDemand: 16,
    distanceKm: 0.5,
    minSellPrice: 5.5,
    maxBidPrice: 6.5,
    flexibleLoads: ["Water heater"],
  },
  {
    id: "D",
    name: "Home D",
    type: "Buyer",
    solarKw: 0,
    batteryKwh: 4,
    batteryLevel: 28,
    baseDemand: 25,
    distanceKm: 1.1,
    minSellPrice: 0,
    maxBidPrice: 7.8,
    flexibleLoads: ["EV charging", "Water heater"],
  },
  {
    id: "E",
    name: "Home E",
    type: "Solar Seller",
    solarKw: 5.1,
    batteryKwh: 10,
    batteryLevel: 82,
    baseDemand: 19,
    distanceKm: 0.9,
    minSellPrice: 5.9,
    maxBidPrice: 6.8,
    flexibleLoads: ["Battery top-up"],
  },
  {
    id: "F",
    name: "Home F",
    type: "Buyer",
    solarKw: 1.6,
    batteryKwh: 6,
    batteryLevel: 44,
    baseDemand: 21,
    distanceKm: 1.4,
    minSellPrice: 0,
    maxBidPrice: 7.1,
    flexibleLoads: ["Washing machine", "Water heater"],
  },
  {
    id: "G",
    name: "Home G",
    type: "Solar Seller",
    solarKw: 3.8,
    batteryKwh: 7,
    batteryLevel: 69,
    baseDemand: 15,
    distanceKm: 1.7,
    minSellPrice: 5.3,
    maxBidPrice: 6.4,
    flexibleLoads: ["Battery top-up"],
  },
  {
    id: "H",
    name: "Home H",
    type: "Buyer",
    solarKw: 0,
    batteryKwh: 3,
    batteryLevel: 31,
    baseDemand: 18,
    distanceKm: 2.0,
    minSellPrice: 0,
    maxBidPrice: 7.2,
    flexibleLoads: ["Water heater"],
  },
  {
    id: "I",
    name: "Home I",
    type: "Solar + AI Host",
    solarKw: 7.4,
    batteryKwh: 13,
    batteryLevel: 77,
    baseDemand: 24,
    distanceKm: 1.2,
    minSellPrice: 5.7,
    maxBidPrice: 6.9,
    flexibleLoads: ["AI node", "Battery top-up", "EV charging"],
  },
  {
    id: "J",
    name: "Home J",
    type: "Community Buyer",
    solarKw: 0.8,
    batteryKwh: 4,
    batteryLevel: 39,
    baseDemand: 20,
    distanceKm: 2.4,
    minSellPrice: 0,
    maxBidPrice: 7.6,
    flexibleLoads: ["Washing machine"],
  },
];

export const WEATHER = [
  80, 82, 83, 84, 78, 65, 42, 30, 24, 18, 14, 20,
  28, 38, 48, 56, 69, 78, 86, 90, 92, 88, 84, 82,
];

export const GRID_PRICES = [
  6.3, 6.1, 5.9, 5.8, 5.9, 6.4, 7.0, 7.8, 8.5, 8.0, 7.2, 6.5,
  5.7, 5.2, 5.0, 5.4, 6.0, 7.2, 8.8, 9.4, 9.1, 8.2, 7.2, 6.7,
];

export const APPLIANCES: Appliance[] = [
  { homeId: "B", name: "EV charging", energyKwh: 8, durationHours: 3, deadline: 20, icon: "EV" },
  { homeId: "B", name: "Washing machine", energyKwh: 1.6, durationHours: 2, deadline: 18, icon: "WM" },
  { homeId: "D", name: "EV charging", energyKwh: 9, durationHours: 3, deadline: 22, icon: "EV" },
  { homeId: "D", name: "Water heater", energyKwh: 3, durationHours: 2, deadline: 21, icon: "WH" },
  { homeId: "F", name: "Washing machine", energyKwh: 1.8, durationHours: 2, deadline: 17, icon: "WM" },
  { homeId: "C", name: "Water heater", energyKwh: 2.6, durationHours: 2, deadline: 19, icon: "WH" },
  { homeId: "E", name: "Battery top-up", energyKwh: 4, durationHours: 2, deadline: 16, icon: "BT" },
  { homeId: "I", name: "EV charging", energyKwh: 7, durationHours: 3, deadline: 21, icon: "EV" },
  { homeId: "H", name: "Water heater", energyKwh: 2.4, durationHours: 2, deadline: 20, icon: "WH" },
  { homeId: "J", name: "Washing machine", energyKwh: 1.5, durationHours: 2, deadline: 18, icon: "WM" },
];

export const COMPUTE_NODES: ComputeNode[] = [
  {
    id: "node-i",
    homeId: "I",
    name: "Edge GPU Node I",
    gpu: "RTX 4070",
    maxKw: 2.4,
    comfortMode: "Balanced",
    availableHours: [10, 11, 12, 13, 14, 15, 22, 23],
  },
  {
    id: "node-a",
    homeId: "A",
    name: "Solar Inference Node A",
    gpu: "RTX 3060",
    maxKw: 1.5,
    comfortMode: "Max Earnings",
    availableHours: [11, 12, 13, 14, 15, 16, 23],
  },
  {
    id: "node-c",
    homeId: "C",
    name: "Quiet Batch Node C",
    gpu: "Apple Neural Engine",
    maxKw: 0.8,
    comfortMode: "Max Comfort",
    availableHours: [12, 13, 14, 15, 0, 1],
  },
];

export const COMPUTE_JOBS: ComputeJob[] = [
  {
    id: "job-1",
    customer: "Local Clinic",
    name: "X-ray triage inference",
    energyKwh: 3.2,
    durationHours: 2,
    deadline: 18,
    priority: "urgent",
    bidPerKwh: 18,
  },
  {
    id: "job-2",
    customer: "Retail Startup",
    name: "Product image tagging",
    energyKwh: 4.8,
    durationHours: 3,
    deadline: 22,
    priority: "flexible",
    bidPerKwh: 14,
  },
  {
    id: "job-3",
    customer: "College Lab",
    name: "Model evaluation batch",
    energyKwh: 5.4,
    durationHours: 3,
    deadline: 23,
    priority: "flexible",
    bidPerKwh: 12,
  },
  {
    id: "job-4",
    customer: "Civic App",
    name: "Traffic video summaries",
    energyKwh: 2.6,
    durationHours: 2,
    deadline: 20,
    priority: "normal",
    bidPerKwh: 15,
  },
];
