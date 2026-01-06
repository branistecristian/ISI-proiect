import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('jef_admin_user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'ADMIN') {
                setUser(parsedUser);
            } else {
                localStorage.removeItem('jef_admin_user');
            }
        } catch (e) {
            localStorage.removeItem('jef_admin_user');
        }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('jef_admin_user');
      setUser(null);
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Se încarcă...</div>;
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <div>
      <AdminDashboard onLogout={handleLogout} currentUser={user} />
    </div>
  );
}

export default App;