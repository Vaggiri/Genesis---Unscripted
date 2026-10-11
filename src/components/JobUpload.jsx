import React, { useState } from 'react';
import { Upload, Box, Cpu, AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { detectFileKind } from '../utils/fileRouter';
import { analyzeStlFile } from '../utils/stlAnalysis';
import { api } from '../services/api';

export default function JobUpload({ onJobSubmitted }) {
  const [file, setFile] = useState(null);
  const [selectedKind, setSelectedKind] = useState('print_3d');
  const [detectedKindInfo, setDetectedKindInfo] = useState(null);
  const [mismatchPrompt, setMismatchPrompt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [infill, setInfill] = useState(20);
  const [materialType, setMaterialType] = useState('PLA');
  const [pcbLayers, setPcbLayers] = useState(2);
  const [pcbFinish, setPcbFinish] = useState('HASL Lead-Free');

  // Booking suggestions
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setErrorMsg(null);
    setMismatchPrompt(null);
    setAnalysisResult(null);
    setSuccessResult(null);
    setAnalyzing(true);

    try {
      // 1. Detect file type
      const detection = await detectFileKind(selected);
      setDetectedKindInfo(detection);

      if (detection.kind === 'rejected') {
        setErrorMsg(detection.reason);
        setAnalyzing(false);
        return;
      }

      // Check mismatch against user selection
      if (detection.kind !== 'ambiguous' && detection.kind !== selectedKind) {
        setMismatchPrompt({
          detected: detection.kind,
          text: `This file appears to be a ${detection.kind === 'print_3d' ? '3D Print CAD model' : 'PCB Gerber archive'}, but you selected ${selectedKind === 'print_3d' ? '3D Printing' : 'PCB Milling'}. Would you like to switch?`
        });
      }

      const activeKind = detection.kind !== 'ambiguous' ? detection.kind : selectedKind;

      // 2. Analyze if 3D print
      let durationMin = 60;
      if (activeKind === 'print_3d') {
        const analysis = await analyzeStlFile(selected, infill);
        setAnalysisResult(analysis);
        durationMin = analysis.estimatedMinutes;
      } else if (activeKind === 'pcb') {
        durationMin = 45;
        if (detection.gerberLayers) {
          setPcbLayers(detection.gerberLayers);
        }
      }

      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }

      // 3. Fetch earliest available machine slot suggestions
      const slotResp = await api.suggestBooking({
        kind: activeKind === 'print_3d' ? 'printer_3d' : 'pcb_mill',
        durationMin
      });

      const slots = [];
      if (slotResp.best) slots.push(slotResp.best);
      if (slotResp.alternatives) slots.push(...slotResp.alternatives);
      setSuggestedSlots(slots);
      if (slots.length > 0) setSelectedSlot(slots[0]);

    } catch (err) {
      setErrorMsg(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSwitchKind = () => {
    if (mismatchPrompt?.detected) {
      setSelectedKind(mismatchPrompt.detected);
      setMismatchPrompt(null);
    }
  };

  const handleSubmitJobAndBooking = async (e) => {
    e.preventDefault();
    if (!file || !selectedSlot) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create Job Row
      const jobResp = await api.createJob({
        kind: selectedKind,
        title: title || file.name,
        file_name: file.name,
        file_ext: file.name.split('.').pop() || '',
        detected_by: detectedKindInfo?.detectedBy || 'client_inspection',
        est_minutes: analysisResult?.estimatedMinutes || 60,
        est_material_g: analysisResult?.estimatedGrams || 0,
        params: {
          infill: selectedKind === 'print_3d' ? infill : undefined,
          material: selectedKind === 'print_3d' ? materialType : undefined,
          layers: selectedKind === 'pcb' ? pcbLayers : undefined,
          finish: selectedKind === 'pcb' ? pcbFinish : undefined
        }
      });

      const createdJob = jobResp.job;

      // 2. Commit linked machine booking with exclusion constraint check
      const bookingResp = await api.createBooking({
        resource_id: selectedSlot.resourceId,
        start_ts: selectedSlot.start,
        end_ts: selectedSlot.end,
        purpose: `Fabrication Work Order: ${title}`,
        job_id: createdJob?.id
      });

      setSuccessResult({
        job: createdJob,
        booking: bookingResp.booking
      });

      if (onJobSubmitted) onJobSubmitted(createdJob);
    } catch (err) {
      if (err.status === 409) {
        setErrorMsg('Selected slot was just booked by someone else! Please choose an alternative slot below.');
        if (err.data?.alternatives) {
          setSuggestedSlots(err.data.alternatives);
          setSelectedSlot(err.data.alternatives[0] || null);
        }
      } else {
        setErrorMsg(err.message || 'Job submission failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-amrita p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Upload size={22} className="text-amrita-maroon" />
          Digital Fabrication Intake & Automated Machine Routing
        </h3>
        <p className="text-sm text-gray-500">
          Upload 3D print (STL/3MF/OBJ) or PCB Gerber archives. The system automatically inspects headers, calculates volume/layers, and schedules the earliest available machine slot.
        </p>
      </div>

      {/* Target Fabrication Mode Picker */}
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <button
          type="button"
          onClick={() => setSelectedKind('print_3d')}
          className={`p-3 rounded-xl border flex items-center gap-3 transition font-semibold text-sm ${
            selectedKind === 'print_3d'
              ? 'border-amrita-maroon bg-amrita-maroon/5 text-amrita-maroon shadow-sm'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <Box size={20} className="text-amrita-maroon" />
          <span>3D Additive Printing</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedKind('pcb')}
          className={`p-3 rounded-xl border flex items-center gap-3 transition font-semibold text-sm ${
            selectedKind === 'pcb'
              ? 'border-amrita-maroon bg-amrita-maroon/5 text-amrita-maroon shadow-sm'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <Cpu size={20} className="text-amrita-maroon" />
          <span>PCB Precision Milling</span>
        </button>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amrita-maroon transition bg-gray-50/50" style={{ cursor: 'pointer' }}>
        <input
          type="file"
          id="job-file-input"
          accept=".stl,.obj,.3mf,.step,.stp,.zip,.kicad_pcb,.brd"
          onChange={handleFileSelect}
          className="hidden"
          style={{ display: 'none' }}
        />
        <label htmlFor="job-file-input" className="cursor-pointer flex flex-col items-center gap-2" style={{ cursor: 'pointer', width: '100%' }}>
          <Upload size={38} className="text-amrita-maroon" style={{ opacity: 0.85 }} />
          <span className="font-bold text-gray-800 text-base">
            {file ? file.name : 'Click or drag CAD / CAM fabrication file here'}
          </span>
          <span className="text-xs text-gray-500">
            Accepts STL, OBJ, 3MF (3D print) or ZIP archives containing Gerber layers (.gtl, .gbl, drill)
          </span>
        </label>
      </div>

      {/* Error or Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-sm text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mismatch Switch Prompt */}
      {mismatchPrompt && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-4 text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{mismatchPrompt.text}</span>
          </div>
          <button
            type="button"
            onClick={handleSwitchKind}
            className="btn-amrita px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
          >
            Switch to {mismatchPrompt.detected === 'print_3d' ? '3D Print' : 'PCB'}
          </button>
        </div>
      )}

      {/* Analysis Details Panel */}
      {analyzing && (
        <div className="p-6 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amrita-maroon" />
          Inspecting file geometry and computing signed tetrahedra volume...
        </div>
      )}

      {analysisResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Automated Geometry & Material Slicing
            </h4>
            <span className="badge-amrita text-xs font-bold">
              {detectedKindInfo?.detectedBy || 'Validated'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 block uppercase">Bounding Box</span>
              <span className="font-mono font-bold text-gray-800 text-sm">
                {analysisResult.dimensions.x} × {analysisResult.dimensions.y} × {analysisResult.dimensions.z} mm
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 block uppercase">Mesh Volume</span>
              <span className="font-mono font-bold text-gray-800 text-sm">
                {analysisResult.volumeCm3} cm³
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 block uppercase">Est. Material (Grams)</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                ~{analysisResult.estimatedGrams} g (Estimate)
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 block uppercase">Est. Print Time</span>
              <span className="font-mono font-bold text-amrita-maroon text-sm flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{analysisResult.estimatedMinutes} min (Estimate)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form & Available Slot Selection */}
      {file && !analyzing && (
        <form onSubmit={handleSubmitJobAndBooking} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project / Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Quadcopter Arm Bracket v2"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
              />
            </div>

            {selectedKind === 'print_3d' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Filament Type</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
                  >
                    <option value="PLA">PLA High-Speed</option>
                    <option value="PETG">PETG High-Tensile</option>
                    <option value="ABS">ABS / ASA</option>
                    <option value="TPU">TPU 95A Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Infill Density</label>
                  <select
                    value={infill}
                    onChange={(e) => setInfill(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
                  >
                    <option value={15}>15% (Lightweight)</option>
                    <option value={20}>20% (Standard Prototype)</option>
                    <option value={40}>40% (Structural Arm)</option>
                    <option value={100}>100% (Solid Rig)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Layer Count</label>
                  <select
                    value={pcbLayers}
                    onChange={(e) => setPcbLayers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
                  >
                    <option value={1}>1-Layer Single Sided</option>
                    <option value={2}>2-Layer Double Sided</option>
                    <option value={4}>4-Layer Multilayer FR4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Surface Finish</label>
                  <select
                    value={pcbFinish}
                    onChange={(e) => setPcbFinish(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold bg-white"
                  >
                    <option value="HASL Lead-Free">HASL Lead-Free</option>
                    <option value="ENIG Gold">ENIG Immersion Gold</option>
                    <option value="Bare Copper">Bare Copper (Rapid test)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Machine & Earliest Slot Suggestion Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              Earliest Compatible Machine Slots (Algorithm Matched)
            </label>
            {suggestedSlots.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                Searching available machines...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.resourceId === slot.resourceId && selectedSlot?.start === slot.start;
                  const startTime = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateStr = new Date(slot.start).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-amrita-maroon bg-amrita-maroon/5 ring-2 ring-amrita-maroon/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-amrita-maroon' : 'text-gray-300'}`} />
                          {slot.resourceName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {startTime} – {endTime}</span>
                        </div>
                      </div>
                      {idx === 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Earliest Match
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="btn-amrita px-6 py-2.5 text-sm flex items-center gap-2 font-bold shadow-md disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Submit Job & Reserve Machine Slot
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Card */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Work Order & Machine Slot Reserved Successfully!
          </div>
          <div className="text-xs text-emerald-700 space-y-1">
            <p>• <strong>Work Order ID:</strong> {successResult.job?.id}</p>
            <p>• <strong>Machine:</strong> {selectedSlot?.resourceName}</p>
            <p>• <strong>Scheduled Window:</strong> {new Date(selectedSlot?.start).toLocaleString()}</p>
            <p>• <strong>Status:</strong> Pending Lab In-Charge review (Realtime synced with workshop desk)</p>
          </div>
        </div>
      )}
    </div>
  );
}
