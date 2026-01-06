import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Palmtree, Plane, CalendarCheck, Users, 
  LogOut, CheckCircle, XCircle, Plus, Search, RefreshCw, 
  AlertCircle, Trash2, X, Save, Pencil
} from 'lucide-react';

import {
    fetchDashboardStats, fetchIslands, fetchJets, fetchBookings, 
    updateBookingStatus, createIsland, deleteIsland, updateIsland,
    createJet, deleteJet, updateJet
} from './adminService';

// ############################################################
// MODALE (ADD / EDIT) - DEFINITE ÎN EXTERIOR
// ############################################################

// 1. MODAL INSULĂ
const IslandModal = ({ onClose, onSubmit, data, setData, isEditing }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isEditing ? 'Editează Insula' : 'Adaugă Insulă Nouă'}</h3>
                <button type="button" onClick={onClose} className="text-gray-500 hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input required placeholder="Nume Insulă" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                <input required placeholder="Locație" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.location} onChange={e => setData({...data, location: e.target.value})} />
                <input required type="number" placeholder="Preț / Noapte (€)" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.pricePerNight} onChange={e => setData({...data, pricePerNight: e.target.value})} />
                <textarea placeholder="Descriere scurtă" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.description} onChange={e => setData({...data, description: e.target.value})} />
                
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center gap-2 transition">
                    <Save size={20} /> {isEditing ? 'Actualizează' : 'Salvează'}
                </button>
            </form>
        </div>
    </div>
);

// 2. MODAL AVION
const JetModal = ({ onClose, onSubmit, data, setData, isEditing }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isEditing ? 'Editează Avionul' : 'Adaugă Avion Nou'}</h3>
                <button type="button" onClick={onClose} className="text-gray-500 hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input required placeholder="Model Avion" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={data.model} onChange={e => setData({...data, model: e.target.value})} />
                <div className="flex gap-2">
                  <input required type="number" placeholder="Capacitate" className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                         value={data.capacity} onChange={e => setData({...data, capacity: e.target.value})} />
                  <input required type="number" placeholder="Rază (km)" className="w-1/2 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                         value={data.rangeKm} onChange={e => setData({...data, rangeKm: e.target.value})} />
                </div>
                <input required type="number" placeholder="Preț / Oră (€)" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={data.pricePerHour} onChange={e => setData({...data, pricePerHour: e.target.value})} />
                
                <select className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={data.status} onChange={e => setData({...data, status: e.target.value})}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="BOOKED">BOOKED</option>
                </select>

                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 flex justify-center gap-2 transition">
                    <Save size={20} /> {isEditing ? 'Actualizează' : 'Salvează'}
                </button>
            </form>
        </div>
    </div>
);

// ############################################################
// COMPONENTA PRINCIPALĂ
// ############################################################

// AICI ESTE PRIMA SCHIMBARE: Acceptăm props-urile onLogout și currentUser
const AdminDashboard = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // DATE
  const [stats, setStats] = useState({ totalIslands: 0, totalJets: 0, pendingBookings: 0, activeUsers: 0 });
  const [islands, setIslands] = useState([]);
  const [jets, setJets] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // UI STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIslandModal, setShowIslandModal] = useState(false);
  const [showJetModal, setShowJetModal] = useState(false);

  // FORM STATE
  const [islandForm, setIslandForm] = useState({ id: null, name: '', location: '', pricePerNight: '', description: '', isAvailable: true });
  const [jetForm, setJetForm] = useState({ id: null, model: '', capacity: '', rangeKm: '', pricePerHour: '', status: 'AVAILABLE' });

  // --- INCARCARE DATE ---
  const loadData = async () => {
      setLoading(true);
      try {
          const statsData = await fetchDashboardStats();
          setStats(statsData);
          setIslands(await fetchIslands());
          setJets(await fetchJets());
          setBookings(await fetchBookings());
          setError(null);
      } catch (err) {
          console.error(err);
          setError("Nu s-a putut conecta la server.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLERS ---
  const openAddIsland = () => { setIslandForm({ id: null, name: '', location: '', pricePerNight: '', description: '', isAvailable: true }); setShowIslandModal(true); };
  const openAddJet = () => { setJetForm({ id: null, model: '', capacity: '', rangeKm: '', pricePerHour: '', status: 'AVAILABLE' }); setShowJetModal(true); };
  
  const openEditIsland = (island) => { setIslandForm({ ...island }); setShowIslandModal(true); };
  const openEditJet = (jet) => { setJetForm({ ...jet }); setShowJetModal(true); };

  const handleSaveIsland = async (e) => {
      e.preventDefault();
      try {
          const payload = { ...islandForm, pricePerNight: parseFloat(islandForm.pricePerNight) };
          if (islandForm.id) await updateIsland(islandForm.id, payload);
          else await createIsland(payload);
          setShowIslandModal(false); await loadData();
      } catch (err) { alert("Eroare la salvare!"); }
  };

  const handleSaveJet = async (e) => {
      e.preventDefault();
      try {
          const payload = { ...jetForm, capacity: parseInt(jetForm.capacity), rangeKm: parseInt(jetForm.rangeKm), pricePerHour: parseFloat(jetForm.pricePerHour) };
          if (jetForm.id) await updateJet(jetForm.id, payload);
          else await createJet(payload);
          setShowJetModal(false); await loadData();
      } catch (err) { alert("Eroare la salvare!"); }
  };

  const handleDeleteIsland = async (id) => { if (window.confirm("Ești sigur?")) { try { await deleteIsland(id); await loadData(); } catch (e) { alert("Eroare!"); } } };
  const handleDeleteJet = async (id) => { if (window.confirm("Ești sigur?")) { try { await deleteJet(id); await loadData(); } catch (e) { alert("Eroare!"); } } };
  const handleUpdateBooking = async (id, status) => { try { await updateBookingStatus(id, status); await loadData(); } catch (e) { alert("Eroare!"); } };

  // --- RENDER SECTIUNI ---

  const RenderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panou de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Insule</p><p className="text-2xl font-bold text-blue-600">{stats.totalIslands}</p></div>
            <div className="p-3 bg-blue-50 rounded-full"><Palmtree className="text-blue-500" size={28}/></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Avioane</p><p className="text-2xl font-bold text-indigo-600">{stats.totalJets}</p></div>
            <div className="p-3 bg-indigo-50 rounded-full"><Plane className="text-indigo-500" size={28}/></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Cereri</p><p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p></div>
            <div className="p-3 bg-orange-50 rounded-full"><CalendarCheck className="text-orange-500" size={28}/></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Useri</p><p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p></div>
            <div className="p-3 bg-green-50 rounded-full"><Users className="text-green-500" size={28}/></div>
        </div>
      </div>
    </div>
  );

  const RenderIslands = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Management Insule</h2>
        <button onClick={openAddIsland} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          <Plus size={18} /> Adaugă Insulă
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr><th className="p-4">Nume</th><th className="p-4">Locație</th><th className="p-4">Preț</th><th className="p-4">Acțiuni</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {islands.map((island) => (
              <tr key={island.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{island.name}</td>
                <td className="p-4">{island.location}</td>
                <td className="p-4 text-green-600 font-bold">{island.pricePerNight} €</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEditIsland(island)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 transition p-1 rounded hover:bg-yellow-50"><Pencil size={18}/> Edit</button>
                  <button onClick={() => handleDeleteIsland(island.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 transition p-1 rounded hover:bg-red-50"><Trash2 size={18}/> Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RenderJets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Management Flotă</h2>
        <button onClick={openAddJet} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          <Plus size={18} /> Adaugă Avion
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr><th className="p-4">Model</th><th className="p-4">Capacitate</th><th className="p-4">Status</th><th className="p-4">Acțiuni</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jets.map((jet) => (
              <tr key={jet.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{jet.model}</td>
                <td className="p-4">{jet.capacity} pers.</td>
                <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">{jet.status}</span></td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEditJet(jet)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 transition p-1 rounded hover:bg-yellow-50"><Pencil size={18}/> Edit</button>
                  <button onClick={() => handleDeleteJet(jet.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 transition p-1 rounded hover:bg-red-50"><Trash2 size={18}/> Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RenderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Validare Rezervări</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr><th className="p-4">User</th><th className="p-4">Perioada</th><th className="p-4">Status</th><th className="p-4 text-center">Acțiuni</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-sm font-bold">{b.userId?.substring(0,8)}...</td>
                <td className="p-4 text-sm">{b.startDate} - {b.endDate}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${b.status==='PENDING'?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700'}`}>{b.status}</span></td>
                <td className="p-4 flex justify-center gap-3">
                  {b.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateBooking(b.id, 'CONFIRMED')} className="text-green-600 hover:bg-green-50 p-2 rounded-full transition"><CheckCircle size={20}/></button>
                      <button onClick={() => handleUpdateBooking(b.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition"><XCircle size={20}/></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl">
        <div className="p-6 border-b border-slate-700"><h1 className="text-2xl font-bold">JEF Admin</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='dashboard'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('islands')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='islands'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800'}`}><Palmtree size={20}/> Insule</button>
          <button onClick={() => setActiveTab('jets')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='jets'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800'}`}><Plane size={20}/> Avioane</button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='bookings'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800'}`}><CalendarCheck size={20}/> Rezervări</button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='users'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800'}`}><Users size={20}/> Utilizatori</button>
        </nav>
        <div className="p-4 border-t border-slate-700">
            {/* AICI ESTE A DOUA SCHIMBARE: Butonul de Logout conectat */}
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white transition hover:bg-slate-800 rounded">
                <LogOut size={20}/> Deconectare
            </button>
        </div>
      </aside>

      <main className="flex-1 p-8 ml-64">
        {/* Header Search & Admin Profile */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Căutare..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          <div className="flex items-center gap-4">
             {loading && <span className="text-blue-600 flex items-center text-sm"><RefreshCw className="animate-spin mr-2" size={16}/> Se încarcă...</span>}
             {error && <span className="text-red-500 flex items-center text-sm"><AlertCircle className="mr-2" size={16}/> Offline</span>}

            <div className="h-8 w-px bg-gray-300 mx-2"></div>
            
            {/* AICI ESTE A TREIA SCHIMBARE: Afișare nume dinamic */}
            <span className="text-sm font-medium text-gray-700">
                {currentUser ? currentUser.name : 'Admin User'}
            </span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        {/* Content dinamic */}
        {!loading && (
            <>
                {activeTab === 'dashboard' && <RenderDashboard />}
                {activeTab === 'islands' && <RenderIslands />}
                {activeTab === 'jets' && <RenderJets />}
                {activeTab === 'bookings' && <RenderBookings />}
                {activeTab === 'users' && <div className="p-10 text-center text-gray-500 bg-white rounded shadow">Modulul de Utilizatori este în lucru...</div>}
            </>
        )}

        {showIslandModal && (
            <IslandModal 
                onClose={() => setShowIslandModal(false)}
                onSubmit={handleSaveIsland}
                data={islandForm}
                setData={setIslandForm}
                isEditing={!!islandForm.id}
            />
        )}
        
        {showJetModal && (
            <JetModal 
                onClose={() => setShowJetModal(false)}
                onSubmit={handleSaveJet}
                data={jetForm}
                setData={setJetForm}
                isEditing={!!jetForm.id}
            />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;