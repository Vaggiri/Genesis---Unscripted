import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, AlertTriangle, TrendingUp, Cpu, Sparkles, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function UtilizationDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUtilization();
  }, []);

  const loadUtilization = async () => {
    try {
      setLoading(true);
      const res = await api.getUtilization();
      setData(res);
    } catch (err) {
      console.warn('Failed to fetch utilization analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card-amrita p-12 text-center text-gray-500 font-medium">Computing live facility utilization matrices...</div>;
  }

  const d = data || {};

  return (
    <div className="space-y-6">
      {/* Header with Sample Data Badge */}
      <div className="card-amrita p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amrita-maroon" />
            Innovation Facility & Workstation Utilization Engine
          </h3>
          <p className="text-sm text-gray-500">
            Realtime capacity tracking derived from PostgreSQL facility bookings, idle gap intervals, and check-in verifications.
          </p>
        </div>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Activity className="w-3.5 h-3.5 text-amber-600" />
          Sample Data Mode
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-amrita p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Average Utilization</span>
          <div className="text-3xl font-extrabold text-amrita-maroon">{d.utilizationRate || 74}%</div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +8.4% compared to last semester
          </span>
        </div>

        <div className="card-amrita p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Booked Hours</span>
          <div className="text-3xl font-extrabold text-gray-900">{d.totalBookings || 42} hrs</div>
          <span className="text-xs text-gray-500 font-medium">Across 5 innovation labs</span>
        </div>

        <div className="card-amrita p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">No-Show / Auto-Release</span>
          <div className="text-3xl font-extrabold text-rose-600">{d.noShowRate || 4}%</div>
          <span className="text-xs text-gray-500 font-medium">Lazy 15-min gap release</span>
        </div>

        <div className="card-amrita p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Peak Rush Window</span>
          <div className="text-3xl font-extrabold text-amber-600">02:00 - 04:30 PM</div>
          <span className="text-xs text-gray-500 font-medium">Post-lecture innovation surge</span>
        </div>
      </div>

      {/* Heatmap & Most Requested Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="card-amrita p-6 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amrita-maroon" />
            Weekly Idle-Gap & Demand Heatmap (Day × Hour)
          </h4>
          <div className="space-y-2">
            {(d.heatmap || []).map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-10 font-bold text-gray-600 shrink-0">{row.day}</span>
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {row.slots.map((s, sIdx) => {
                    const color = s.intensity > 70 ? 'bg-amrita-maroon text-white font-bold' :
                                  s.intensity > 45 ? 'bg-amrita-maroon/50 text-white' :
                                  'bg-amrita-maroon/15 text-amrita-maroon';
                    return (
                      <div
                        key={sIdx}
                        className={`p-2.5 rounded-lg text-center ${color} transition shadow-2xs`}
                      >
                        <span className="block font-semibold">{s.hour}</span>
                        <span className="text-[10px] opacity-90">{s.intensity}% Load</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Equipment Demand */}
        <div className="card-amrita p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amrita-maroon" />
            Most Requested Equipment
          </h4>
          <div className="space-y-3">
            {(d.topEquipment || []).map((eq, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span className="truncate">{eq.name}</span>
                  <span className="font-bold text-amrita-maroon">{eq.count} slots</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amrita-maroon h-full rounded-full"
                    style={{ width: `${Math.min(100, eq.count * 3.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What-If Machine Capacity Simulation Panel */}
      {d.simulation && (
        <div className="card-amrita p-6 bg-gradient-to-r from-amrita-maroon/5 via-white to-amber-500/5 border border-amrita-maroon/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              What-If Queue Simulation: Machine Capacity Scaling
            </h4>
            <span className="badge-amrita text-xs font-bold">Discrete Queue Model</span>
          </div>

          <p className="text-xs text-gray-600">
            Simulated impact of procuring 1 additional High-Speed 3D Printer (e.g. Bambu Lab X1-Carbon) based on the past 30 days of student reservation demand.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-400 font-bold uppercase block">Current Avg Wait</span>
              <span className="text-lg font-bold text-gray-800">{d.simulation.currentAvgWaitHours} hours</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-400 font-bold uppercase block">Simulated Avg Wait</span>
              <span className="text-lg font-bold text-emerald-700">{d.simulation.projectedAvgWaitHours} hours</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-400 font-bold uppercase block">Wait Time Reduction</span>
              <span className="text-lg font-bold text-emerald-600">-{d.simulation.reductionPercent}%</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-400 font-bold uppercase block">Weekly Extra Jobs</span>
              <span className="text-lg font-bold text-amrita-maroon">+{d.simulation.extraThroughputJobsWeek} orders</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
