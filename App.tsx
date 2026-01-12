import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Language } from './types';

// תיקון ייבואים לפי צילום המסך שלך:
import Catalog from './components/Catalog';
import AdminDashboard from './components/AdminDashboard'; // וודא שזה השם המלא של הקובץ
import DonorPortal from './components/DonorPortal';
import LiveDraw from './components/LiveDraw';
import Home from './components/HomePage'; // שים לב לתוספת ה-Page!

const App: React.FC = () => {
  const store = useStore();
  
  if (!store || !store.auth) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="text-[#C2A353] text-4xl font-black italic tracking-tighter">Mazalix</div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full luxury-gradient animate-shimmer" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const isRtl = store.lang === Language.HE;

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/10">
          <Link to="/" className="text-2xl font-bold luxury-gradient bg-clip-text text-transparent">
            Mazalix
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/" className="hover:text-[#C2A353] transition-colors">{store.lang === Language.HE ? 'דף הבית' : 'Home'}</Link>
            <Link to="/portal" className="hover:text-[#C2A353] transition-colors">{store.lang === Language.HE ? 'איזור אישי' : 'Portal'}</Link>
            <Link to="/admin" className="hover:text-[#C2A353] transition-colors gold-text">{store.lang === Language.HE ? 'ניהול' : 'Admin'}</Link>
            <button 
              onClick={store.toggleLanguage}
              className="px-3 py-1 border border-[#C2A353]/30 rounded-full hover:bg-[#C2A353]/10 transition-colors text-xs"
            >
              {store.lang === Language.HE ? 'EN' : 'HE'}
            </button>
          </div>
        </nav>

        <main className="flex-grow container mx-auto px-1 md:px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={store.auth.isLoggedIn && !store.auth.isSuperAdmin ? <Catalog store={store} /> : <Home store={store} />} 
            />
            <Route path="/catalog/:clientId" element={<Catalog store={store} />} />
            <Route path="/admin" element={<AdminDashboard store={store} />} />
            <Route path="/portal" element={<DonorPortal store={store} />} />
            <Route path="/draw/:prizeId" element={<LiveDraw store={store} />} />
            <Route path="/live/:prizeId" element={<LiveDraw store={store} publicOnly={true} />} />
          </Routes>
        </main>

        <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-gray-500">
          <p>{isRtl ? 'כל הזכויות שמורות ל-DA פרויקטים ויזמות' : 'All Rights Reserved to DA Projects & Entrepreneurship'}</p>
          <p className="mt-1 opacity-50">© 2026 Mazalix System</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;