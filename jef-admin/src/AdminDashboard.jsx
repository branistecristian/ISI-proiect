import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Palmtree, Plane, CalendarCheck, Users, 
  LogOut, CheckCircle, XCircle, Plus, Search, RefreshCw, 
  AlertCircle, Trash2, X, Save, Pencil, UserX, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

import {
    fetchDashboardStats, fetchIslands, fetchJets, fetchBookings, fetchUsers,
    createIsland, deleteIsland, updateIsland,
    createJet, deleteJet, updateJet,
    updateBooking, deleteBooking,
    updateUser, deleteUser
} from './adminService';

// ############################################################
// COMPONENTE UI / MODALE
// ############################################################

// --- NOU: MODAL CALENDAR ---
const CalendarModal = ({ onClose, bookings }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Helpers pentru calendar
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Ajustare ca săptămâna să înceapă Luni (0=Luni)
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthNames = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

    // Navigare luni
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Funcție modificată: Arată DOAR data de început
    const getBookingsForDay = (day) => {
        const checkDate = new Date(year, month, day);
        checkDate.setHours(0, 0, 0, 0);

        return bookings.filter(b => {
            const start = new Date(b.startDate);
            start.setHours(0,0,0,0);
            
            // AICI E MODIFICAREA: Comparăm strict cu data de început
            return checkDate.getTime() === start.getTime();
        });
    };

    const activeBookingsForSelectedDate = selectedDate ? getBookingsForDay(selectedDate) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] flex overflow-hidden">
                
                {/* Partea Stângă: Calendarul Vizual */}
                <div className="w-2/3 p-6 border-r border-gray-100 flex flex-col">
                    {/* Header Calendar */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight /></button>
                        </div>
                    </div>

                    {/* Grid Zile Săptămână */}
                    <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-slate-400">
                        <div>Lun</div><div>Mar</div><div>Mie</div><div>Joi</div><div>Vin</div><div>Sam</div><div>Dum</div>
                    </div>

                    {/* Grid Zile Calendar */}
                    <div className="grid grid-cols-7 gap-1 flex-1">
                        {/* Celule goale pentru zilele dinainte de 1 ale lunii */}
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

                        {/* Zilele efective */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayBookings = getBookingsForDay(day);
                            const hasPending = dayBookings.some(b => b.status === 'PENDING');
                            const hasConfirmed = dayBookings.some(b => b.status === 'CONFIRMED');
                            
                            const isSelected = selectedDate === day;

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        h-20 border border-slate-50 rounded-lg p-1 cursor-pointer transition relative
                                        ${isSelected ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'hover:bg-slate-50'}
                                    `}
                                >
                                    <span className={`text-sm ${isSelected ? 'font-bold text-blue-600' : 'text-slate-600'}`}>{day}</span>
                                    
                                    {/* Buline pentru status */}
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {hasConfirmed && <div className="w-2 h-2 rounded-full bg-green-500" title="Start Rezervare Confirmată"></div>}
                                        {hasPending && <div className="w-2 h-2 rounded-full bg-orange-500" title="Start Rezervare În Așteptare"></div>}
                                        {dayBookings.length > 0 && <span className="text-[10px] text-slate-400">({dayBookings.length})</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Partea Dreaptă: Detalii Zile */}
                <div className="w-1/3 p-6 bg-slate-50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-700">Detalii</h3>
                        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {!selectedDate ? (
                            <div className="text-center text-slate-400 mt-20">
                                <Calendar size={48} className="mx-auto mb-2 opacity-50"/>
                                <p>Selectează o zi pentru a vedea cine începe rezervarea.</p>
                            </div>
                        ) : (
                            <div>
                                <h4 className="font-semibold mb-4 pb-2 border-b border-slate-200">
                                    Start Rezervări: {selectedDate} {monthNames[month]}
                                </h4>
                                {activeBookingsForSelectedDate.length === 0 ? (
                                    <p className="text-slate-500 text-sm">Nicio rezervare nu începe azi.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {activeBookingsForSelectedDate.map(b => (
                                            <div key={b.id} className="bg-white p-3 rounded shadow-sm border border-slate-100 text-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${b.status==='CONFIRMED' ? 'bg-green-100 text-green-700' : b.status==='PENDING'?'bg-orange-100 text-orange-700':'bg-red-100 text-red-700'}`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600"><span className="font-semibold">User:</span> {b.userId?.substring(0,8)}...</p>
                                                <p className="text-slate-500 text-xs mt-1">Perioada: {b.startDate} - {b.endDate}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 1. MODAL INSULĂ
const IslandModal = ({ onClose, onSubmit, data, setData, isEditing }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Editează Insula' : 'Adaugă Insulă'}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input required placeholder="Nume" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                <input required placeholder="Locație" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.location} onChange={e => setData({...data, location: e.target.value})} />
                <input required type="number" placeholder="Preț" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.pricePerNight} onChange={e => setData({...data, pricePerNight: e.target.value})} />
                <textarea placeholder="Descriere" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                       value={data.description} onChange={e => setData({...data, description: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center gap-2 transition">
                    <Save size={20} /> Salvează
                </button>
            </form>
        </div>
    </div>
);

// 2. MODAL AVION
const JetModal = ({ onClose, onSubmit, data, setData, isEditing }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Editează Avion' : 'Adaugă Avion'}</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input required placeholder="Model" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={data.model} onChange={e => setData({...data, model: e.target.value})} />
                <div className="flex gap-2">
                    <input required type="number" placeholder="Capacitate" className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                           value={data.capacity} onChange={e => setData({...data, capacity: e.target.value})} />
                    <input required type="number" placeholder="Rază" className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                           value={data.rangeKm} onChange={e => setData({...data, rangeKm: e.target.value})} />
                </div>
                <input required type="number" placeholder="Preț/Oră" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       value={data.pricePerHour} onChange={e => setData({...data, pricePerHour: e.target.value})} />
                <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={data.status} onChange={e => setData({...data, status: e.target.value})}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="BOOKED">BOOKED</option>
                </select>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 flex justify-center gap-2 transition">
                    <Save size={20} /> Salvează
                </button>
            </form>
        </div>
    </div>
);

// 3. MODAL USER
const UserModal = ({ onClose, onSubmit, data, setData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Editează Utilizator</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <input required placeholder="Nume" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                       value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                <input required type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                       value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 flex justify-center gap-2 transition">
                    <Save size={20} /> Actualizează
                </button>
            </form>
        </div>
    </div>
);

// 4. MODAL BOOKING
const BookingModal = ({ onClose, onSubmit, data, setData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Modifică Rezervare</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                            value={data.status} onChange={e => setData({...data, status: e.target.value})}>
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data Începere</label>
                    <input required type="date" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                           value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data Finalizare</label>
                    <input required type="date" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                           value={data.endDate} onChange={e => setData({...data, endDate: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 flex justify-center gap-2 transition">
                    <Save size={20} /> Salvează
                </button>
            </form>
        </div>
    </div>
);

// ############################################################
// COMPONENTA PRINCIPALĂ
// ############################################################

const AdminDashboard = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [stats, setStats] = useState({ totalIslands: 0, totalJets: 0, pendingBookings: 0, activeUsers: 0 });
  const [islands, setIslands] = useState([]);
  const [jets, setJets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals Visibility
  const [showIslandModal, setShowIslandModal] = useState(false);
  const [showJetModal, setShowJetModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false); 

  // Forms Data
  const [islandForm, setIslandForm] = useState({ id: null, name: '', location: '', pricePerNight: '', description: '', isAvailable: true });
  const [jetForm, setJetForm] = useState({ id: null, model: '', capacity: '', rangeKm: '', pricePerHour: '', status: 'AVAILABLE' });
  const [bookingForm, setBookingForm] = useState({ id: null, status: 'PENDING', startDate: '', endDate: '' });
  const [userForm, setUserForm] = useState({ id: null, name: '', email: '' });

  // LOAD DATA
  const loadData = async () => {
      setLoading(true);
      try {
          const statsData = await fetchDashboardStats();
          setStats(statsData);
          setIslands(await fetchIslands());
          setJets(await fetchJets());
          setBookings(await fetchBookings());
          setUsers(await fetchUsers());
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
  const openEditIsland = (i) => { setIslandForm({ ...i }); setShowIslandModal(true); };
  const handleSaveIsland = async (e) => {
      e.preventDefault();
      try {
          const payload = { ...islandForm, pricePerNight: parseFloat(islandForm.pricePerNight) };
          if (islandForm.id) await updateIsland(islandForm.id, payload); else await createIsland(payload);
          setShowIslandModal(false); await loadData();
      } catch (err) { alert("Eroare!"); }
  };
  const handleDeleteIsland = async (id) => { if (window.confirm("Stergi insula?")) { await deleteIsland(id); await loadData(); } };

  const openAddJet = () => { setJetForm({ id: null, model: '', capacity: '', rangeKm: '', pricePerHour: '', status: 'AVAILABLE' }); setShowJetModal(true); };
  const openEditJet = (j) => { setJetForm({ ...j }); setShowJetModal(true); };
  const handleSaveJet = async (e) => {
      e.preventDefault();
      try {
          const payload = { ...jetForm, capacity: parseInt(jetForm.capacity), rangeKm: parseInt(jetForm.rangeKm), pricePerHour: parseFloat(jetForm.pricePerHour) };
          if (jetForm.id) await updateJet(jetForm.id, payload); else await createJet(payload);
          setShowJetModal(false); await loadData();
      } catch (err) { alert("Eroare!"); }
  };
  const handleDeleteJet = async (id) => { if (window.confirm("Stergi avionul?")) { await deleteJet(id); await loadData(); } };

  const openEditBooking = (b) => { 
      setBookingForm({ id: b.id, status: b.status, startDate: b.startDate, endDate: b.endDate }); 
      setShowBookingModal(true); 
  };
  const handleSaveBooking = async (e) => {
      e.preventDefault();
      try {
          await updateBooking(bookingForm.id, bookingForm);
          setShowBookingModal(false);
          await loadData();
      } catch (err) { alert("Eroare!"); }
  };
  const handleDeleteBooking = async (id) => {
      if (window.confirm("Stergi rezervarea?")) { try { await deleteBooking(id); await loadData(); } catch (e) { alert("Eroare!"); } }
  };

  const openEditUser = (u) => { setUserForm({ id: u.id, name: u.name, email: u.email }); setShowUserModal(true); };
  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          await updateUser(userForm.id, userForm);
          setShowUserModal(false);
          await loadData();
      } catch (e) { alert("Eroare!"); }
  };
  const handleDeleteUser = async (id) => {
      if (window.confirm("BANNEZI userul?")) { try { await deleteUser(id); await loadData(); } catch (e) { alert("Eroare!"); } }
  };

  // --- RENDER FUNCTIONS ---

  const RenderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card Insule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
            <div>
                <p className="text-sm text-gray-500 font-medium">Insule</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalIslands}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
                <Palmtree className="text-blue-500" size={28}/>
            </div>
        </div>

        {/* Card Avioane */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
            <div>
                <p className="text-sm text-gray-500 font-medium">Avioane</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalJets}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
                <Plane className="text-indigo-500" size={28}/>
            </div>
        </div>

        {/* Card Cereri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
            <div>
                <p className="text-sm text-gray-500 font-medium">Cereri</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingBookings}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
                <CalendarCheck className="text-orange-500" size={28}/>
            </div>
        </div>

        {/* Card Useri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
            <div>
                <p className="text-sm text-gray-500 font-medium">Useri</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
                <Users className="text-green-500" size={28}/>
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
          <h2 className="text-2xl font-bold text-gray-800">Rezervări</h2>
          <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs"><tr><th className="p-4">User ID</th><th className="p-4">Perioada</th><th className="p-4">Status</th><th className="p-4">Acțiuni</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                      {bookings.map(b => (
                          <tr key={b.id} className="hover:bg-gray-50 transition">
                              <td className="p-4 text-xs font-mono">{b.userId}</td>
                              <td className="p-4 text-sm">{b.startDate} ➝ {b.endDate}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${b.status==='PENDING'?'bg-orange-100 text-orange-800':b.status==='CONFIRMED'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{b.status}</span></td>
                              <td className="p-4 flex gap-2">
                                  <button onClick={() => openEditBooking(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editează datele"><Pencil size={18}/></button>
                                  <button onClick={() => handleDeleteBooking(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Șterge"><Trash2 size={18}/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const RenderUsers = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Management Utilizatori</h2>
          <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs"><tr><th className="p-4">Nume</th><th className="p-4">Email</th><th className="p-4">Rol</th><th className="p-4">Acțiuni</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition">
                              <td className="p-4 font-bold">{u.name}</td>
                              <td className="p-4 text-blue-600">{u.email}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.role==='ADMIN'?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                              <td className="p-4 flex gap-2">
                                  <button onClick={() => openEditUser(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editează"><Pencil size={18}/></button>
                                  {u.role !== 'ADMIN' && (
                                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Ban User (Șterge)"><UserX size={18}/></button>
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
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-700"><h1 className="text-2xl font-bold tracking-wider">JEF Admin</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='dashboard'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800 text-slate-300'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('islands')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='islands'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800 text-slate-300'}`}><Palmtree size={20}/> Insule</button>
          <button onClick={() => setActiveTab('jets')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='jets'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800 text-slate-300'}`}><Plane size={20}/> Avioane</button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='bookings'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800 text-slate-300'}`}><CalendarCheck size={20}/> Rezervări</button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full p-3 rounded transition-all ${activeTab==='users'?'bg-blue-600 shadow-lg shadow-blue-900':'hover:bg-slate-800 text-slate-300'}`}><Users size={20}/> Utilizatori</button>
        </nav>
        <div className="p-4 border-t border-slate-700"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white transition hover:bg-slate-800 rounded"><LogOut size={20}/> Deconectare</button></div>
      </aside>

      <main className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-700">Admin Panel</h2>
            <div className="flex items-center gap-4">
                {loading && <span className="text-blue-600 text-sm flex gap-2"><RefreshCw className="animate-spin" size={16}/> Se încarcă...</span>}
                
                {/* NOU: Butonul de Calendar */}
                <button 
                    onClick={() => setShowCalendarModal(true)}
                    className="p-2 bg-white rounded-full text-slate-600 hover:text-blue-600 shadow hover:shadow-md transition"
                    title="Calendar Rezervări"
                >
                    <Calendar size={24} />
                </button>

                <div className="h-8 w-px bg-gray-300 mx-2"></div>

                <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{currentUser ? currentUser.name : 'Admin'}</p>
                    <p className="text-xs text-gray-500">{currentUser ? currentUser.email : ''}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </div>

        {!loading && (
            <>
                {activeTab === 'dashboard' && <RenderDashboard />}
                {activeTab === 'islands' && <RenderIslands />}
                {activeTab === 'jets' && <RenderJets />}
                {activeTab === 'bookings' && <RenderBookings />}
                {activeTab === 'users' && <RenderUsers />}
            </>
        )}

        {/* MODALE */}
        {showIslandModal && <IslandModal onClose={() => setShowIslandModal(false)} onSubmit={handleSaveIsland} data={islandForm} setData={setIslandForm} isEditing={!!islandForm.id} />}
        {showJetModal && <JetModal onClose={() => setShowJetModal(false)} onSubmit={handleSaveJet} data={jetForm} setData={setJetForm} isEditing={!!jetForm.id} />}
        {showBookingModal && <BookingModal onClose={() => setShowBookingModal(false)} onSubmit={handleSaveBooking} data={bookingForm} setData={setBookingForm} />}
        {showUserModal && <UserModal onClose={() => setShowUserModal(false)} onSubmit={handleSaveUser} data={userForm} setData={setUserForm} />}
        {showCalendarModal && <CalendarModal onClose={() => setShowCalendarModal(false)} bookings={bookings} />}
      </main>
    </div>
  );
};

export default AdminDashboard;