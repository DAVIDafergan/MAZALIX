
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Language } from './types';
import Catalog from './components/Catalog';
import AdminDashboard from './components/AdminDashboard';
import DonorPortal from './components/DonorPortal';
import LiveDraw from './components/LiveDraw';
import HomePage from './components/HomePage';

const CatalogWrapper: React.FC<{ store: any }> = ({ store }) => {
  const { clientId } = useParams();
  const { loadClientData } = store;

  React.useEffect(() => {
    if (clientId) {
      loadClientData(clientId);
    }
  }, [clientId, loadClientData]);

  return <Catalog store={store} />;
};

const App: React.FC = () => {
  const store = useStore();
  const isRtl = store.lang === Language.HE;

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Luxury Persistent Header */}
        <nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-3xl border-b border-[#C2A353]/30 px-6 md:px-16 py-6 flex justify-between items-center shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-6">
            <Link to="/" className="relative group flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl luxury-gradient flex items-center justify-center text-black font-black italic shadow-[0_0_20px_rgba(194,163,83,0.4)] group-hover:rotate-12 transition-transform">
                M
              </div>
              <span className="text-3xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent transition-all group-hover:scale-105 block drop-shadow-lg">
                MAZALIX
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6 md:gap-14">
            <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Link to="/" className="text-gray-400 hover:text-[#C2A353] transition-all relative group">
                {store.lang === Language.HE ? 'ראשי' : 'Home'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C2A353] transition-all group-hover:w-full"></span>
              </Link>
              <Link to="/portal" className="text-gray-400 hover:text-[#C2A353] transition-all relative group">
                {store.lang === Language.HE ? 'איזור אישי' : 'Donor Portal'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C2A353] transition-all group-hover:w-full"></span>
              </Link>
              <Link to="/admin" className="text-gray-400 hover:text-[#C2A353] transition-all relative group">
                {store.lang === Language.HE ? 'ניהול' : 'Admin'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C2A353] transition-all group-hover:w-full"></span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={store.toggleLanguage}
                className="px-4 py-2 flex items-center justify-center rounded-xl border border-[#C2A353]/30 text-[10px] font-black gold-text hover:bg-[#C2A353]/10 transition-all uppercase italic"
              >
                {store.lang === Language.HE ? 'English' : 'עברית'}
              </button>
              
              <Link to="/admin" className="hidden md:flex relative overflow-hidden group px-8 py-3 rounded-2xl border border-[#C2A353]/50 text-black font-black text-xs uppercase tracking-widest italic transition-all hover:scale-105 active:scale-95 shadow-xl">
                <div className="absolute inset-0 luxury-gradient"></div>
                <span className="relative z-10">{store.lang === Language.HE ? 'כניסת מנהלים' : 'Admin Vault'}</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage store={store} />} />
            <Route path="/catalog/:clientId" element={<CatalogWrapper store={store} />} />
            <Route path="/admin" element={<AdminDashboard store={store} />} />
            <Route path="/portal" element={<DonorPortal store={store} />} />
            <Route path="/draw/:prizeId" element={<LiveDraw store={store} />} />
            <Route path="/live/:prizeId" element={<LiveDraw store={store} publicOnly={true} />} />
          </Routes>
        </main>

        <footer className="py-16 border-t border-white/5 bg-[#020617] text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-700 mb-6">Mazalix Luxury Systems — Excellence in Raffle Tech</div>
          <div className="flex justify-center gap-8 mb-8 opacity-40">
             <div className="w-1.5 h-1.5 rounded-full bg-[#C2A353] animate-pulse"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-[#C2A353] animate-pulse delay-75"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-[#C2A353] animate-pulse delay-150"></div>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic opacity-60">
            {isRtl ? 'כל הזכויות שמורות ל-DA פרויקטים ויזמות © 2025' : 'All Rights Reserved to DA Projects & Entrepreneurship © 2025'}
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
