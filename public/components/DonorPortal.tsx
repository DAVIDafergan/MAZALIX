
import React, { useState } from 'react';
import { Donor, Language, Ticket, Prize } from '../types';
import { Smartphone, Ticket as TicketIcon, User, LogOut, ChevronRight, Activity, Award, Gift, Sparkles, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PortalProps {
  store: any;
}

const DonorPortal: React.FC<PortalProps> = ({ store }) => {
  const { tickets, prizes, lang, searchDonorCampaigns, loadClientData } = store;
  const isHE = lang === Language.HE;
  const navigate = useNavigate();
  
  const [phone, setPhone] = useState('');
  const [foundCampaigns, setFoundCampaigns] = useState<any[]>([]);
  const [loggedInDonor, setLoggedInDonor] = useState<Donor | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!phone) return;
    setIsSearching(true);
    setError('');
    const results = await searchDonorCampaigns(phone);
    setIsSearching(false);
    
    if (results && results.length > 0) {
      setFoundCampaigns(results);
    } else {
      setError(isHE ? 'לא נמצאו תרומות המשויכות למספר זה.' : 'No donations found for this number.');
    }
  };

  const selectCampaign = async (campaignId: string, donorData: Donor) => {
    setSelectedCampaignId(campaignId);
    setLoggedInDonor(donorData);
    // Load full campaign data for the dashboard (prizes, tickets, etc)
    await loadClientData(campaignId);
  };

  const handleLogout = () => {
    setLoggedInDonor(null);
    setFoundCampaigns([]);
    setSelectedCampaignId(null);
    setPhone('');
  };

  // 1. Phone Input View
  if (!loggedInDonor && foundCampaigns.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <div className="glass-card p-12 rounded-[3rem] border-2 border-[#C2A353]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 luxury-gradient"></div>
          <div className="w-24 h-24 luxury-gradient rounded-3xl mx-auto flex items-center justify-center text-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
            <Smartphone size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter italic leading-none">{isHE ? 'איזור אישי לתורם' : 'Donor Sanctuary'}</h1>
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.4em]">{isHE ? 'הכנס מספר טלפון לצפייה בתרומות' : 'Unlock your contribution history'}</p>
          </div>
          <div className="space-y-6">
            <input 
              type="tel" 
              placeholder="05X-XXXXXXX" 
              className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-center text-3xl font-black tracking-[0.2em] focus:border-[#C2A353] transition-all outline-none gold-text placeholder:opacity-20" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
            {error && <p className="text-red-500 text-[10px] font-black italic animate-pulse">{error}</p>}
            
            <button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="w-full py-5 luxury-gradient text-black font-black text-xl rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic"
            >
              {isSearching ? (isHE ? 'מתחבר למאגר...' : 'Connecting...') : (isHE ? 'צפייה בתרומות שלי' : 'Reveal My Luck')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Multi-Campaign Selection View
  if (!loggedInDonor && foundCampaigns.length > 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
           <h2 className="text-4xl font-black italic luxury-gradient bg-clip-text text-transparent">{isHE ? 'הקמפיינים הפעילים שלך' : 'Your Active Legacies'}</h2>
           <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">{isHE ? 'מצאנו מספר קמפיינים המשויכים אליך' : 'Multiple campaigns found linked to your identity'}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {foundCampaigns.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => selectCampaign(item.campaign.id, item.donor)}
              className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-[#C2A353]/60 flex items-center justify-between group transition-all hover:scale-[1.01] hover:shadow-2xl"
            >
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-white/5 p-3 overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-[#C2A353]/40 transition-all">
                  <img src={item.campaign.logo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="text-right ltr:text-left">
                  <h4 className="text-2xl font-black italic gold-text tracking-tighter">{isHE ? item.campaign.nameHE : item.campaign.nameEN}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">₪{item.donor.totalDonated.toLocaleString()} {isHE ? 'נתרמו' : 'Donated'}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="gold-text group-hover:translate-x-3 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-3" size={32} />
            </button>
          ))}
          <button onClick={() => { setFoundCampaigns([]); setPhone(''); }} className="pt-8 flex items-center justify-center gap-3 text-gray-600 hover:text-[#C2A353] transition-all text-[10px] font-black uppercase italic tracking-widest">
            <ArrowLeft size={16} /> {isHE ? 'החלפת מספר טלפון' : 'Change Phone Identity'}
          </button>
        </div>
      </div>
    );
  }

  // 3. Campaign Dashboard View
  const donorTickets = tickets.filter((t: Ticket) => t.donorId === loggedInDonor?._id || t.donorId === loggedInDonor?.id);

  return (
    <div className="space-y-12 py-16 pb-32 animate-fade-in px-4 max-w-5xl mx-auto">
      {/* Premium Profile HUD */}
      <div className="relative glass-card rounded-[3.5rem] p-10 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_30px_80px_rgba(0,0,0,0.9)] border-2 border-[#C2A353]/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C2A353]/5 blur-[100px] rounded-full"></div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] p-1.5 border-4 border-[#C2A353]/20 shadow-2xl relative rotate-3">
            <div className="w-full h-full rounded-[2rem] luxury-gradient flex items-center justify-center text-black">
              <User size={60} />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none">{loggedInDonor?.name}</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs bg-white/5 px-4 py-2 rounded-xl border border-white/5">{loggedInDonor?.phone}</span>
              <button onClick={handleLogout} className="text-red-500/70 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-2 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10 italic"><LogOut size={14}/> {isHE ? 'ניתוק' : 'Logout'}</button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-12 md:gap-24 text-center relative z-10 md:border-l border-white/10 md:pl-16 w-full md:w-auto pt-10 md:pt-0">
          <div className="flex-1 md:flex-none space-y-2">
            <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.5em]">{isHE ? 'סך תרומותיך' : 'Total Impact'}</p>
            <p className="text-4xl md:text-6xl font-black gold-text tracking-tighter italic drop-shadow-lg">₪{loggedInDonor?.totalDonated.toLocaleString()}</p>
          </div>
          <div className="flex-1 md:flex-none space-y-2">
             <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.5em]">{isHE ? 'כרטיסים' : 'Luck Score'}</p>
             <p className="text-4xl md:text-6xl font-black tracking-tighter italic">{donorTickets.length}</p>
          </div>
        </div>
      </div>

      {/* Ticket Collection Display */}
      <div className="space-y-10">
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tighter italic">{isHE ? 'כרטיסי ההגרלה שלך' : 'Your Luck Tokens'}</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{isHE ? 'כל הכרטיסים ממופים אוטומטית לפי המסלול שבחרת' : 'All tokens mapped via your contribution tier'}</p>
          </div>
          <div className="hidden md:flex px-6 py-3 bg-[#C2A353]/5 rounded-2xl border border-[#C2A353]/20 items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] gold-text shadow-xl">
             <ShieldCheck size={18} /> {isHE ? 'תורם מאומת VIP' : 'Verified VIP Legacy'}
          </div>
        </div>

        {donorTickets.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[3rem] border-2 border-dashed border-white/5">
            <TicketIcon size={60} className="mx-auto text-gray-800 mb-6 opacity-20" />
            <p className="text-gray-600 font-black italic uppercase tracking-widest">{isHE ? 'טרם הונפקו כרטיסים בקמפיין זה' : 'No tokens minted for this campaign yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {prizes.map((p: Prize) => {
              const count = donorTickets.filter((t: any) => t.prizeId === (p as any)._id || t.prizeId === p.id).length;
              if (count === 0) return null;
              return (
                <div key={p.id} className="glass-card rounded-3xl p-5 md:p-6 flex flex-col gap-4 border-l-4 border-[#C2A353] group hover:scale-[1.03] transition-all relative overflow-hidden shadow-xl">
                  <div className="absolute inset-0 luxury-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
                      <img src={p.media[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs md:text-sm tracking-tight leading-tight group-hover:gold-text transition-colors truncate italic">{isHE ? p.titleHE : p.titleEN}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="bg-[#C2A353]/10 px-3 py-1 rounded-full border border-[#C2A353]/20 flex items-center gap-2">
                           <TicketIcon size={12} className="gold-text" />
                           <span className="text-[10px] font-black text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* High-Octane Upgrade CTA */}
      <div className="p-10 md:p-20 rounded-[4rem] luxury-gradient text-black flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_40px_100px_rgba(194,163,83,0.3)] relative overflow-hidden group border-4 border-white/10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="space-y-4 relative z-10 text-center lg:text-right">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 italic">
             <Sparkles size={16} /> {isHE ? 'חשיפה בלעדית' : 'Exclusive Access'}
           </div>
           <h4 className="text-4xl md:text-7xl font-black tracking-tighter leading-none italic drop-shadow-lg">{isHE ? 'הזדמנות להכפיל סיכויים' : 'The Path to Victory'}</h4>
           <p className="font-bold text-black/80 max-w-xl text-xs md:text-lg leading-relaxed italic">{isHE ? 'שדרג את תרומתך עכשיו ותיהנה מתוספת מיידית של כרטיסים לכל המתנות בקטלוג.' : 'Ascend to the next tier and watch your token count explode across every luxury item.'}</p>
        </div>
        <button 
          onClick={() => navigate(`/catalog/${selectedCampaignId}`)}
          className="px-14 py-6 bg-black text-[#C2A353] font-black text-xl rounded-[2rem] shadow-2xl hover:scale-110 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all relative z-10 uppercase italic tracking-tighter"
        >
           {isHE ? 'חזרה לקטלוג ושדרוג' : 'Return & Dominate'}
        </button>
      </div>

      <button onClick={() => { setLoggedInDonor(null); setSelectedCampaignId(null); }} className="w-full py-8 text-gray-700 hover:text-white transition-all text-[10px] font-black uppercase italic tracking-[0.5em]">
        {isHE ? 'חזרה לרשימת הקמפיינים שלי' : 'View All My Legacies'}
      </button>
    </div>
  );
};

export default DonorPortal;
