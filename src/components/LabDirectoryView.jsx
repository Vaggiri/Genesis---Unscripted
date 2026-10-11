import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Search, 
  Calendar,
  Package
} from 'lucide-react';
import { api } from '../services/api';

export default function LabDirectoryView({ onBookSlot }) {
  const [resources, setResources] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resData, invData] = await Promise.all([
        api.getResources(),
        api.getInventory()
      ]);
      setResources(resData || []);
      setInventory(invData || []);
    } catch (err) {
      console.warn('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const labs = [
    { id: 'lab-fablab', name: 'Digital Fabrication & Prototyping Hub', block: 'AB-1', floor: 1, category: 'Fabrication & 3D Print' },
    { id: 'lab-pcb-eda', name: 'PCB Prototyping & Microelectronics Fab', block: 'AB-1', floor: 2, category: 'Electronics & EDA' },
    { id: 'lab-iot-robotics', name: 'IoT, Robotics & Automation Centre', block: 'AB-2', floor: 2, category: 'Robotics & Hardware' },
    { id: 'lab-ai-hpc', name: 'AI & High Performance Computing Lab', block: 'AB-3', floor: 3, category: 'Computing & AI' },
    { id: 'lab-mech-workshop', name: 'Mechanical Workshop & Machining Bay', block: 'AB-2', floor: 0, category: 'Heavy Machining' }
  ];

  const filteredLabs = labs.filter(lab => {
    const matchesLab = selectedLab === 'all' || lab.id === selectedLab;
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resources.some(r => r.lab_id === lab.id && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          inventory.some(i => i.lab_id === lab.id && i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Category Filter Bar */}
      <div className="card-amrita p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment (Bambu Lab, RTX 4090) or drawer components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
          {['all', 'lab-fablab', 'lab-pcb-eda', 'lab-iot-robotics', 'lab-ai-hpc', 'lab-mech-workshop'].map(lId => (
            <button
              key={lId}
              type="button"
              onClick={() => setSelectedLab(lId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedLab === lId
                  ? 'bg-amrita-maroon text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {lId === 'all' ? 'All Hubs' : lId.replace('lab-', '').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Cards Grid */}
      {loading ? (
        <div className="card-amrita p-12 text-center text-gray-500 font-medium">Scanning innovation labs and verified hardware...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLabs.map(lab => {
            const labResources = resources.filter(r => r.lab_id === lab.id);
            const labInventory = inventory.filter(i => i.lab_id === lab.id);

            return (
              <div key={lab.id} className="card-amrita p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="badge-amrita text-[10px] font-bold uppercase tracking-wider">
                      {lab.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> Open: 08:30 - 17:30
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">{lab.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-amrita-maroon" /> Block {lab.block}, Floor {lab.floor}
                    </p>
                  </div>

                  {/* Registered Machines & Resources */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-amrita-maroon" /> Active Machines & Benches ({labResources.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {labResources.map(r => (
                        <span key={r.id} className="bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {r.name}
                          {r.requires_cert && <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-1 rounded">Cert Req</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Drawer Inventory */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amrita-maroon" /> Drawer Component Stock ({labInventory.length} items):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {labInventory.map(item => (
                        <span key={item.id} className="bg-amrita-maroon/5 border border-amrita-maroon/15 text-amrita-maroon text-[11px] px-2 py-0.5 rounded font-semibold">
                          {item.name} ({item.quantity} in {item.location || 'drawer'})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (onBookSlot) onBookSlot(lab);
                    }}
                    className="btn-amrita px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Machine Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
