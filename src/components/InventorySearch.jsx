import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Package, MapPin, Calendar, AlertTriangle, Layers, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function InventorySearch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      setItems(data || []);
    } catch (err) {
      console.warn('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Configure Fuse.js for fuzzy matching
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ['name', 'part_no', 'category', 'location', 'labs.name'],
      threshold: 0.35,
      ignoreLocation: true
    });
  }, [items]);

  // Filter & Search results
  const filteredItems = useMemo(() => {
    let result = items;

    if (searchTerm.trim()) {
      result = fuse.search(searchTerm).map(match => match.item);
    }

    if (selectedLab !== 'all') {
      result = result.filter(item => item.lab_id === selectedLab);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    return result;
  }, [items, searchTerm, selectedLab, selectedCategory, fuse]);

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category || 'General'));
    return Array.from(set);
  }, [items]);

  const checkIsStale = (dateStr) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return itemDate < thirtyDaysAgo;
  };

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="card-amrita p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amrita-maroon" />
            Component & Drawer Stock Live Radar
          </h3>
          <p className="text-sm text-gray-500">
            Fuzzy component search across campus lab drawers. Check stock, bin locations, and audit freshness before starting prototyping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              id="inventory-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search components (e.g. '10k resistor', 'ESP32', 'PLA spool', 'FR4')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amrita-maroon text-sm font-medium"
            />
          </div>

          <div>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amrita-maroon"
            >
              <option value="all">All Innovation Labs</option>
              <option value="lab-pcb-eda">PCB Prototyping & EDA Fab</option>
              <option value="lab-fablab">FabLab & Rapid Prototyping</option>
              <option value="lab-iot-robotics">IoT & Robotics Hub</option>
              <option value="lab-ai-hpc">AI & HPC Research Lab</option>
              <option value="lab-mech-workshop">Mechanical Workshop</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amrita-maroon"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Found <strong>{filteredItems.length}</strong> components matching criteria</span>
        <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Yellow badges indicate stock audits older than 30 days
        </span>
      </div>

      {/* Grid of Component Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Scanning drawer matrices...</div>
      ) : filteredItems.length === 0 ? (
        <div className="card-amrita p-12 text-center space-y-2">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="font-bold text-gray-700">No components found</h4>
          <p className="text-xs text-gray-500">
            Try a different search term or ask the AI Chatbot to notify the workshop manager.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isStale = checkIsStale(item.updated_at);
            const dateStr = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recent';

            return (
              <div key={item.id} className="card-amrita p-5 hover:shadow-md transition flex flex-col justify-between border-l-4 border-l-amrita-maroon">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge-amrita text-[10px] uppercase font-bold tracking-wider">
                      {item.category || 'General'}
                    </span>
                    {isStale ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Audited &gt;30d ago
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Live Verified
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 text-base leading-snug">
                    {item.name}
                  </h4>
                  {item.part_no && (
                    <p className="text-xs font-mono text-gray-500">Part #{item.part_no}</p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-500">Available Stock:</span>
                    <span className={`text-sm font-bold ${item.quantity > 5 ? 'text-emerald-700' : item.quantity > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {item.quantity} units
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-amrita-maroon shrink-0" />
                    <span className="truncate">{item.location || 'Central Drawer Rack'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-gray-400" />
                      {item.labs?.name || item.lab_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {dateStr}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
