import React, { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { loginUser } from './adminService';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const responseData = await loginUser(email, password);
            
            // VERIFICARE DE SIGURANȚĂ
            // Dacă responseData e gol sau nu are user, oprim execuția manual
            if (!responseData || !responseData.user) {
                throw new Error("Răspuns invalid de la server.");
            }

            const { user, token } = responseData;

            // Verificăm rolul
            if (user.role === 'ADMIN') {
                const dataToSave = { ...user, token: token };
                localStorage.setItem('jef_admin_user', JSON.stringify(dataToSave));
                onLoginSuccess(dataToSave);
            } else {
                setError("Contul tău nu are drepturi de Administrator.");
            }

        } catch (err) {
            console.error("Login Error:", err);
            // Afișăm un mesaj clar în loc să crape aplicația
            if (err.status === 403 || err.status === 401) {
                setError("Email sau parolă incorectă.");
            } else {
                setError(err.message || "Eroare la conectarea cu serverul.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">JEF Admin</h1>
                        <p className="text-slate-500 mt-2">Autentificare Panou de Control</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="admin@jef.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Parolă</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Se verifică...' : 'Accesează Dashboard'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t">
                    JEF &copy; 2025 Jet & Estate Facility
                </div>
            </div>
        </div>
    );
};

export default LoginPage;