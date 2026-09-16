"use client";

import React, { useState, useMemo } from "react";
import {
  impactSummary,
  matchMarket,
  optimizeAppliances,
  scheduleCompute,
  batteryDecisions,
  rupees
} from "@/lib/energy-engine";
import { HOMES } from "@/constants/homes";

export default function Dashboard() {
  const [dayOffset, setDayOffset] = useState(0);
  const [gridAlert, setGridAlert] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const summary = useMemo(() => impactSummary(dayOffset, gridAlert), [dayOffset, gridAlert]);

  const handleRunMarket = async () => {
    setIsMatching(true);
    // Simulate a small delay for the matching animation feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsMatching(false);
  };

  const handleToggleAlert = () => {
    setGridAlert(!gridAlert);
  };

  const handleReset = () => {
    setDayOffset(prev => (prev + 1) % 30);
    setGridAlert(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">GridNest</h1>
          <p className="text-slate-500">Local Solar, Shared Smarter</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            Refresh Demo Day
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel & Impact Metrics */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Control Center</h2>
            <div className="space-y-4">
              <button
                onClick={handleRunMarket}
                disabled={isMatching}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg ${
                  isMatching ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isMatching ? "Matching Market..." : "🚀 Run Market Match"}
              </button>
              <button
                onClick={handleToggleAlert}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${
                  gridAlert ? "bg-red-600 text-white" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                {gridAlert ? "⚠️ Grid Peak Alert Active" : "🔔 Trigger Grid Peak Alert"}
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Neighborhood Impact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">{summary.money}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Solar Traded</p>
                <p className="text-2xl font-bold text-blue-600">{summary.traded}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">CO2 Avoided</p>
                <p className="text-2xl font-bold text-emerald-600">{summary.co2}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Peak Reduction</p>
                <p className="text-2xl font-bold text-purple-600">{summary.peak}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 uppercase font-bold mb-1">Fairness Score</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-1000"
                    style={{ width: summary.fairness }}
                  />
                </div>
                <span className="font-bold text-blue-700">{summary.fairness}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Marketplace & Optimization */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">P2P Energy Marketplace</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                {summary.matches.length} Matches Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.matches.map((match, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-medium">{match.seller} → {match.buyer}</p>
                      <p className="text-xs text-slate-500">{match.kwh} kWh @ {match.price} /kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+{match.sellerEarnings}</p>
                    <p className="text-xs text-slate-400">{match.distance} km</p>
                  </div>
                </div>
              ))}
              {summary.matches.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-400 italic">
                  Click "Run Market Match" to simulate P2P trading
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Smart Home Optimizer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.optimized.map((load, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold">{load.name}</p>
                      <p className="text-xs text-slate-500">{load.home}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] rounded font-bold uppercase">
                      {load.icon}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Schedule:</span>
                      <span className="font-medium">{load.startHour}:00 - {load.endHour}:00</span>
                    </div>
                    <div className="text-green-600 font-bold">
                      Saved {rupees(load.savings)}
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${load.cleanEnergyShare}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{load.cleanEnergyShare}% Clean Energy</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
