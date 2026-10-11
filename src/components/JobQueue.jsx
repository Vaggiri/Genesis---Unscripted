import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Clock, CheckCircle2, XCircle, Play, Check, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';

export default function JobQueue({ onOpenPurchaseRequest }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKind, setFilterKind] = useState('all');

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getJobs();
      setJobs(data || []);
    } catch (err) {
      console.warn('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      await loadJobs();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleAdjustDuration = async (jobId, currentMins) => {
    const input = prompt('Enter revised duration in minutes:', currentMins);
    if (!input) return;
    const mins = parseInt(input, 10);
    if (isNaN(mins) || mins <= 0) return;

    try {
      await api.updateJob(jobId, { est_minutes: mins });
      await loadJobs();
    } catch (err) {
      alert(`Failed to update duration: ${err.message}`);
    }
  };

  const filteredJobs = jobs.filter(j => filterKind === 'all' || j.kind === filterKind);

  return (
    <div className="card-amrita p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amrita-maroon" />
            Digital Fabrication Job Queue & Work Orders
          </h3>
          <p className="text-sm text-gray-500">
            Workshop manager console to review CAD geometries, approve print/mill jobs, and adjust machine schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white text-gray-800"
          >
            <option value="all">All Fabrication Work Orders</option>
            <option value="print_3d">3D Additive Printing</option>
            <option value="pcb">PCB Precision Milling</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading fabrication queue...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm">No work orders currently in queue.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredJobs.map((job) => {
            const is3D = job.kind === 'print_3d';
            return (
              <div key={job.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-amrita text-[10px] uppercase font-bold">
                      {is3D ? '3D Print' : 'PCB Milling'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      job.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'approved' ? 'bg-indigo-100 text-indigo-800' :
                      job.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-gray-400">#{job.id}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-base">{job.title}</h4>
                  <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                    <span>File: <strong>{job.file_name}</strong></span>
                    <span>Student: <strong>{job.profiles?.full_name || 'Innovator'}</strong> ({job.profiles?.roll_no || 'Amrita'})</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-amrita-maroon" />
                      {job.est_minutes} min (Estimate)
                    </span>
                    {job.est_material_g > 0 && (
                      <span>Material: ~{job.est_material_g}g</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAdjustDuration(job.id, job.est_minutes)}
                    className="border border-gray-300 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 transition"
                    title="Override estimated runtime"
                  >
                    Adjust Time
                  </button>

                  {job.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'rejected')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {job.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Job
                    </button>
                  )}

                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'done')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Done
                    </button>
                  )}

                  {onOpenPurchaseRequest && (
                    <button
                      onClick={onOpenPurchaseRequest}
                      className="text-xs text-amrita-maroon hover:underline flex items-center gap-1 font-semibold ml-2"
                      title="Request filament or PCB clads from supply store"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Order Material
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
