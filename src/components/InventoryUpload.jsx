import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { api } from '../services/api';

export default function InventoryUpload({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [diffs, setDiffs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('lab-fablab');
  const [existingItems, setExistingItems] = useState([]);
  const [importing, setImporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadExistingItems = useCallback(async () => {
    try {
      const items = await api.getInventory({ lab: selectedLab });
      setExistingItems(items || []);
    } catch (err) {
      console.warn('Could not load inventory for diffing:', err);
    }
  }, [selectedLab]);

  useEffect(() => {
    loadExistingItems();
  }, [loadExistingItems]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setStatusMsg(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateAndDiff(results.data);
      },
      error: (err) => {
        setErrors([`Failed to parse CSV: ${err.message}`]);
      }
    });
  };

  const validateAndDiff = (rows) => {
    const rowErrors = [];
    const validData = [];
    const diffList = [];

    rows.forEach((row, idx) => {
      const lineNum = idx + 2; // header is line 1
      const name = (row.name || row.component || '').trim();
      const partNo = (row.part_no || row.partno || '').trim();
      const qtyStr = row.quantity || row.qty || '0';
      const qty = parseInt(qtyStr, 10);
      const category = (row.category || 'General').trim();
      const location = (row.location || '').trim();

      if (!name) {
        rowErrors.push(`Row ${lineNum}: Component name is required.`);
        return;
      }
      if (isNaN(qty) || qty < 0) {
        rowErrors.push(`Row ${lineNum} (${name}): Quantity must be a non-negative integer.`);
        return;
      }

      // Check diff against current stock
      const existing = existingItems.find(item => 
        item.name.toLowerCase() === name.toLowerCase() || 
        (partNo && item.part_no && item.part_no.toLowerCase() === partNo.toLowerCase())
      );

      const diff = {
        name,
        partNo,
        category,
        newQty: qty,
        oldQty: existing ? existing.quantity : null,
        change: existing ? qty - existing.quantity : null,
        location
      };
      diffList.push(diff);

      validData.push({
        name,
        part_no: partNo,
        category,
        quantity: qty,
        location
      });
    });

    setErrors(rowErrors);
    setParsedRows(validData);
    setDiffs(diffList);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setStatusMsg(null);

    try {
      const res = await api.importInventory({
        lab_id: selectedLab,
        filename: file?.name || 'inventory.csv',
        items: parsedRows
      });

      setStatusMsg({
        type: 'success',
        text: `Successfully imported ${res.count || parsedRows.length} items into ${selectedLab}!`
      });
      setFile(null);
      setParsedRows([]);
      setDiffs([]);
      loadExistingItems();
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Import failed. Check role authorization.'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="card-amrita p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-amrita-maroon" />
            Bulk Inventory CSV Intake & Reconciliation
          </h3>
          <p className="text-sm text-gray-500">
            Upload drawer stock audits (CSV/Excel). The engine validates quantities and computes live inventory diffs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Target Lab:</label>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white text-gray-800"
          >
            <option value="lab-fablab">FabLab & Rapid Prototyping</option>
            <option value="lab-pcb-eda">PCB Prototyping & EDA Fab</option>
            <option value="lab-iot-robotics">IoT & Robotics Sandbox</option>
            <option value="lab-ai-hpc">AI & HPC Research Lab</option>
            <option value="lab-mech-workshop">Mechanical Workshop</option>
          </select>
        </div>
      </div>

      {/* File Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amrita-maroon transition bg-gray-50/50">
        <input
          type="file"
          id="inventory-csv-input"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="inventory-csv-input" className="cursor-pointer flex flex-col items-center gap-2">
          <FileText className="w-10 h-10 text-amrita-maroon/80" />
          <span className="font-semibold text-gray-800">
            {file ? file.name : 'Click to select CSV inventory file'}
          </span>
          <span className="text-xs text-gray-500">
            Required columns: component/name, part_no, category, quantity, location
          </span>
        </label>
        <div className="mt-3">
          <a
            href="/sample-inventory.csv"
            download="sample-inventory.csv"
            className="text-xs text-amrita-maroon font-semibold hover:underline inline-flex items-center gap-1"
          >
            Download sample CSV template
          </a>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Row Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          <div className="font-semibold text-amber-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            CSV Formatting Errors Detected ({errors.length}):
          </div>
          <ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Diffs & Reconciliation Preview */}
      {diffs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-amrita-maroon" />
              Reconciliation Preview ({diffs.length} Valid Rows)
            </h4>
            <button
              onClick={handleConfirmImport}
              disabled={importing || errors.length > 0}
              className="btn-amrita px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm & Upsert to Cloud Database
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Part No</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">New CSV Stock</th>
                  <th className="p-3">Diff</th>
                  <th className="p-3">Drawer Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {diffs.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{d.name}</td>
                    <td className="p-3 text-gray-500">{d.partNo || '—'}</td>
                    <td className="p-3"><span className="badge-amrita text-[10px]">{d.category}</span></td>
                    <td className="p-3 font-mono">{d.oldQty !== null ? d.oldQty : 'New Item'}</td>
                    <td className="p-3 font-mono font-bold text-gray-900">{d.newQty}</td>
                    <td className="p-3">
                      {d.change === null ? (
                        <span className="text-emerald-600 font-bold">+New</span>
                      ) : d.change > 0 ? (
                        <span className="text-emerald-600 font-bold">+{d.change}</span>
                      ) : d.change < 0 ? (
                        <span className="text-rose-600 font-bold">{d.change}</span>
                      ) : (
                        <span className="text-gray-400">0 (Unchanged)</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">{d.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
