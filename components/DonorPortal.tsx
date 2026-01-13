import React, { useState } from 'react';
import { Donor, Language, Ticket, Prize, Package, PackageRule, Client } from '../types';
import { Smartphone, Ticket as TicketIcon, User, LogOut, ChevronRight, Activity, Award, Gift, Sparkles, ShieldCheck, Layout } from 'lucide-react';

interface PortalProps {
  store: any;
}

const DonorPortal: React.FC<PortalProps> = ({ store }) => {
  // הוספת packages למבנה הנתונים כדי לחשב זכאות לפי מסלול
  const { donors, tickets, prizes, lang, clients = [], packages = [] } = store;
  const isHE = lang === Language.HE;
  
  const [phone, setPhone] = useState('');
  const [loggedInDonor, setLoggedInDonor] = useState<Donor | null>(null);
  const [multipleAccounts, setMultipleAccounts] = useState<Donor[]>([]); // לאחסון מספר חשבונות אם נמצאו
  const [error, setError] = useState('');

  const handleLogin = () => {
    const cleanInput = phone.replace(/\D/g, '');
    const foundMatches = donors.filter((d: Donor) => d.phone.replace(/\D/g, '') === cleanInput);
    
    if (foundMatches.length > 1) {
      // אם נמצאו מספר קמפיינים לאותו מספר
      setMultipleAccounts(foundMatches);
      setError('');
    } else if (foundMatches.length === 1) {
      // אם נמצא קמפיין אחד בלבד
      setLoggedInDonor(foundMatches[0]);
      setMultipleAccounts([]);
      setError('');
    } else {
      setError(isHE ? 'תורם לא נמצא במערכת.' : 'Donor not found.');
    }
  };

  const enterDemoMode = () => {
    if (donors.length > 0) {
      setLoggedInDonor(donors[0]);
    } else {
      const dummy: Donor = { id: 'demo-vip', clientId: '1', name: isHE ? 'תורם פלטינום' : 'VIP Donor', phone: '050-XXXXXXX', email: 'vip@luxury.com', totalDonated: 12500, packageId: 'p1' };
      setLoggedInDonor(dummy);
    }
  };

  // מסך בחירת קמפיין (מוצג רק אם יש כפל חשבונות)
  if (multipleAccounts.length > 0 && !loggedInDonor) {
    return (
      <div className="max-w-md mx-auto py-20 md:py-32 space-y-10 animate-fade-in px-4">
        <div className="glass-card p-10 rounded-[2.5rem] border-2 gold-border shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tighter italic leading-none">{isHE ? 'בחר קמפיין' : 'Select Campaign'}</h1>
            <p className="text-gray-500 font-black text-[9px] uppercase tracking-[0.3em]">{isHE ? 'נמצאו מספר חשבונות המשויכים למספר זה' : 'Multiple accounts found for this number'}</p>
          </div>
          <div className="space-y-4">
            {multipleAccounts.map((donor) => {
              const client = clients.find((c: any) => c.id === donor.clientId);
              const cName = client?.campaign?.nameHE || client?.displayName || (isHE ? 'קמפיין כללי' : 'General Campaign');
              return (
                <button 
                  key={donor.id}
                  onClick={() => setLoggedInDonor(donor)}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-[#C2A353] hover:bg-white/10 transition-all group"
                >
                  <div className="text-right">
                    <p className="text-[#C2A353] font-black text-xs uppercase tracking-tighter">{cName}</p>
                    <p className="text-white font-bold text-lg">{donor.name}</p>
                  </div>
                  <ChevronRight className="text-gray-600 group-hover:text-[#C2A353] transition-colors" />
                </button>
              );
            })}
            <button 
              onClick={() => setMultipleAccounts([])}
              className="text-gray-500 text-[10px] font-black uppercase tracking-widest pt-4 hover:text-white transition-colors"
            >
              {isHE ? 'חזרה לחיפוש' : 'Back to search'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loggedInDonor) {
    return (
      <div className="max-w-md mx-auto py-20 md:py-32 space-y-10 animate-fade-in px-4">
        <div className="glass-card p-10 rounded-[2.5rem] border-2 gold-border shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="w-20 h-20 luxury-gradient rounded-full mx-auto flex items-center justify-center text-black shadow-lg">
            <Smartphone size={32} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tighter italic leading-none">{isHE ? 'איזור אישי' : 'Donor Portal'}</h1>
            <p className="text-gray-500 font-black text-[9px] uppercase tracking-[0.3em]">{isHE ? 'גישה מאובטחת לתיק התרומות' : 'Secure access to your portfolio'}</p>
          </div>
          <div className="space-y-6">
            <input 
              type="tel" 
              placeholder="05X-XXXXXXX" 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-2xl font-black tracking-[0.1em] focus:border-[#C2A353] transition-all outline-none" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-red-500 text-[10px] font-black italic">{error}</p>}
            
            <div className="space-y-3">
              <button onClick={handleLogin} className="w-full py-4 luxury-gradient text-black font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-all uppercase">
                {isHE ? 'כניסה' : 'Login'}
              </button>
              <button onClick={enterDemoMode} className="w-full py-3 bg-white/5 border border-white/10 text-gray-500 font-black rounded-xl hover:bg-white/10 transition-all text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                 <Sparkles size={12} className="gold-text" /> {isHE ? 'מצב דמו' : 'Demo Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- לוגיקת חישוב כרטיסים לפי חבילה (Package) ---
  
  // 1. מציאת החבילה של התורם
  const donorPackage = packages.find((p: Package) => p.id === loggedInDonor.packageId);

  // 2. פונקציה לחישוב כמה כרטיסים יש לתורם עבור פרס ספציפי לפי חוקי החבילה
  const getTicketCountForPrize = (prizeId: string) => {
    if (!donorPackage) return 0;
    
    let count = 0;
    donorPackage.rules.forEach((rule: PackageRule) => {
      if (rule.prizeId === 'ALL' || rule.prizeId === prizeId) {
        count += rule.count;
      }
    });
    return count;
  };

  // 3. חישוב סה"כ כרטיסי מזל (סכום כל הכרטיסים בכל ההגרלות שהתורם משתתף בהן)
  const totalLuckTokens = prizes.reduce((sum: number, p: Prize) => {
    return sum + getTicketCountForPrize(p.id);
  }, 0);

  // 4. זיהוי שם הקמפיין הספציפי שבו התורם רשום
  const matchedClient = clients.find((c: any) => c.id === loggedInDonor.clientId);
  const campaignName = matchedClient?.campaign?.nameHE || matchedClient?.displayName || (isHE ? 'קמפיין כללי' : 'General Campaign');
  // לינק לשדרוג מהגדרות הקמפיין
  const upgradeLink = matchedClient?.campaign?.donationUrl || '#';

  return (
    <div className="space-y-8 md:space-y-12 pb-20 animate-fade-in px-2 max-w-4xl mx-auto">
      {/* Mini Profile Dashboard */}
      <div className="relative glass-card rounded-3xl md:rounded-[3rem] p-6 md:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/5">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-1 border-2 gold-border shadow-lg relative">
            <div className="w-full h-full rounded-full luxury-gradient flex items-center justify-center text-black">
              <User size={40} />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-none">{loggedInDonor.name}</h2>
            {/* הצגת שם הקמפיין שבו התורם רשום בלבד */}
            <div className="flex items-center gap-2 text-[#C2A353] py-1">
              <Layout size={12} />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-tight italic">{campaignName}</span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[8px] md:text-[10px]">{loggedInDonor.phone}</span>
              <button onClick={() => { setLoggedInDonor(null); setMultipleAccounts([]); }} className="text-red-500/50 text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-1"><LogOut size={10}/> {isHE ? 'יציאה' : 'Exit'}</button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 md:gap-16 text-center relative z-10 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
          <div className="space-y-1">
            <p className="text-gray-600 text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em]">{isHE ? 'סה"כ תרומות' : 'Portfolio'}</p>
            <p className="text-2xl md:text-4xl font-black gold-text tracking-tighter italic">₪{loggedInDonor.totalDonated.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
             <p className="text-gray-600 text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em]">{isHE ? 'כרטיסי מזל' : 'Luck Tokens'}</p>
             {/* מציג את סך כל הכרטיסים המחושבים מהחבילה שלו בלבד */}
             <p className="text-2xl md:text-4xl font-black tracking-tighter">{totalLuckTokens.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Grid of Tickets */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="text-xl md:text-2xl font-black tracking-tight italic">{isHE ? 'ההגרלות שלי' : 'My Entries'}</h3>
          <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-500">
             <ShieldCheck size={12} className="gold-text" /> {isHE ? 'חשבון מאומת' : 'Verified VIP'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* מעבר על כל הפרסים וחישוב זכאות לכל אחד בנפרד */}
          {prizes.map((p: Prize) => {
            // קבלת כמות הכרטיסים הספציפית שהחבילה מקנה לפרס זה
            const count = getTicketCountForPrize(p.id);
            
            // אם החבילה לא מקנה כרטיסים לפרס זה, הוא לא יוצג לתורם
            if (count === 0) return null;
            
            return (
              <div key={p.id} className="glass-card rounded-2xl p-3 md:p-5 flex flex-col gap-3 border-l-4 gold-border group hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/5">
                    <img src={p.media[0]?.url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[10px] md:text-xs tracking-tight leading-tight group-hover:gold-text transition-colors truncate italic">{isHE ? p.titleHE : p.titleEN}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                       <TicketIcon size={10} className="gold-text" />
                       {/* כמות הכרטיסים האישית לפרס זה */}
                       <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{count.toLocaleString()} {isHE ? 'כרטיסים' : 'Tix'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Banner - Compact */}
      <div className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] luxury-gradient text-black flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="space-y-2 relative z-10 text-center md:text-right">
           <h4 className="text-2xl md:text-4xl font-black tracking-tighter leading-none italic">{isHE ? 'רוצה להגדיל סיכויים?' : 'Want More Luck?'}</h4>
           <p className="font-bold text-black/60 max-w-lg text-[10px] md:text-xs leading-relaxed italic">{isHE ? 'שדרוג התרומה יעניק לך אלפי כרטיסי הגרלה נוספים לכל המתנות בבת אחת!' : 'Upgrading now adds thousands of tokens to your collection instantly!'}</p>
        </div>
        {/* הכפתור מוביל ללינק שהוגדר בקמפיין אליו רשום המשתמש */}
        <button 
          onClick={() => window.open(upgradeLink, '_blank')}
          className="px-8 py-3 bg-black text-[#C2A353] font-black text-sm rounded-xl shadow-xl hover:scale-105 transition-all relative z-10 uppercase italic tracking-tighter"
        >
           {isHE ? 'שדרוג עכשיו' : 'Upgrade VIP'}
        </button>
      </div>
    </div>
  );
};

export default DonorPortal;