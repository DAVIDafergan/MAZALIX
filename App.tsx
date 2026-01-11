import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Language } from './types';
import Catalog from './components/Catalog';
import AdminDashboard from './components/AdminDashboard';
import DonorPortal from './components/DonorPortal';
import LiveDraw from './components/LiveDraw';

const App: React.FC = () => {
  const store = useStore();
  const isRtl = store.lang === Language.HE;

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/10">
          <Link to="/" className="text-2xl font-bold luxury-gradient bg-clip-text text-transparent">
            Mazalix
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/" className="hover:text-[#C2A353] transition-colors">{store.lang === Language.HE ? 'קטלוג' : 'Catalog'}</Link>
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

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Catalog store={store} />} />
            {/* נתיב פומבי עם "מיספור" (clientId) - מאפשר לכל לקוח קטלוג ייחודי ונגיש לכל העולם */}
            <Route path="/catalog/:clientId" element={<Catalog store={store} />} />
            <Route path="/admin" element={<AdminDashboard store={store} />} />
            <Route path="/portal" element={<DonorPortal store={store} />} />
            <Route path="/draw/:prizeId" element={<LiveDraw store={store} />} />
            <Route path="/live/:prizeId" element={<LiveDraw store={store} publicOnly={true} />} />
          </Routes>
        </main>

        <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-gray-500">
          <p>{isRtl ? 'כל הזכויות שמורות ל-DA פרויקטים ויזמות' : 'All Rights Reserved to DA Projects & Entrepreneurship'}</p>
          <p className="mt-1 opacity-50">© 2025 Mazalix System</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;