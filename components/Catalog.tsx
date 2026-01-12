import React, { useState, useEffect, useMemo } from 'react';
import { Language, Prize, DrawStatus, Package } from '../types';
import { 
  Calendar, MapPin, Sparkles, Layout, Gift, ChevronLeft, ChevronRight, 
  ArrowUpRight, Award, Inbox, X, Ticket, Layers, Timer, Share2, 
  Star, ShoppingCart, ExternalLink, ArrowRight 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// --- רכיבי עזר: מוגדרים כ-function בראש הקובץ למניעת שגיאות Hoisting ב-Build ---

function PrizeShareButton({ activeClientId, prize, isHE, campaignName, className, iconSize = 12 }: any) {
  const handleSharePrize = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!activeClientId) return;

    const shareUrl = `${window.location.origin}/#/catalog/${activeClientId}`;
    const shareData = { 
      title: campaignName || 'Mazalix', 
      text: isHE ? `ראו איזה פרס מדהים ב-${campaignName}!` : `Incredible prize at ${campaignName}!`, 
      url: shareUrl 
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert(isHE ? 'הקישור הועתק!' : 'Link copied!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Share error:', err);
    }
  };

  return (
    <button 
      onClick={handleSharePrize} 
      className={`bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-[#C2A353] hover:text-black transition-all text-white flex items-center justify-center shadow-2xl ${className || 'p-1.5 md:p-2 rounded-md md:rounded-lg'}`}
    >
      <Share2 size={iconSize} />
    </button>
  );
}

function PrizeCard({ activeClientId, prize, isHE, campaignName, donationUrl, ticketCount }: any) {
  if (!prize) return null;

  return (
    <div className="group relative rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#C2A353]/20 transition-all duration-700 animate-fade-in flex flex-col shadow-xl">
      <div className="relative h-40 md:h-64 rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 md:mb-6 shadow-2xl border border-white/5">
        <img src={prize?.media?.[0]?.url || ''} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 to-transparent"></div>
        
        <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10 flex gap-3">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2 shadow-2xl">
              <Ticket size={12} className="gold-text" />
              <span className="text-[10px] md:text-xs font-black italic text-white">{ticketCount?.toLocaleString() || 0}</span>
          </div>
          <PrizeShareButton activeClientId={activeClientId} prize={prize} isHE={isHE} campaignName={campaignName} />
        </div>

        {prize?.isFeatured && (
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 px-3 py-1 bg-[#C2A353] rounded-lg text-black font-black text-[8px] md:text-[10px] uppercase italic shadow-lg">
            {isHE ? 'מומלץ' : 'FEATURED'}
          </div>
        )}

        <div className="absolute top-3 right-3 md:top-5 md:right-5 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/5 text-white font-black text-[9px] md:text-[10px] tracking-tight">
          ₪{prize?.value?.toLocaleString() || 0}
        </div>
      </div>
      <div className="px-1 md:px-3 pb-2 space-y-3 md:space-y-5 flex-1 flex flex-col justify-between text-center">
        <div className="space-y-2">
          <h3 className="text-sm md:text-xl font-black tracking-tight group-hover:gold-text transition-colors duration-700 leading-tight italic line-clamp-1">{isHE ? prize?.titleHE : prize?.titleEN}</h3>
          <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed line-clamp-2 font-medium italic hidden md:block">{isHE ? prize?.descriptionHE : prize?.descriptionEN}</p>
        </div>
        <div className="pt-2 flex flex-col items-center gap-3">
          <p className="text-sm md:text-lg font-black italic leading-none gold-text tracking-tighter">₪{prize?.value?.toLocaleString() || 0}</p>
          {donationUrl && (
            <div className="w-full flex flex-col gap-2">
              <a href={donationUrl} target="_blank" rel="noreferrer" className="w-full py-2.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] hover:luxury-gradient hover:text-black hover:border-transparent transition-all duration-700 text-center italic shadow-lg">
                {isHE ? 'פרטים והצטרפות' : 'View Opportunity'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- הרכיב הראשי Catalog ---
const Catalog: React.FC<{ store: any }> = ({ store }) => {
  // הגנה קריטית: מניעת קריסה אם ה-Store עדיין לא נטען ב-Railway
  if (!store || typeof store !== 'object') return null;

  const { prizes = [], packages = [], lang = Language.HE, campaign = {}, tickets = [], clients = [], auth = {} } = store;
  const { clientId } = useParams<{ clientId: string }>(); 
  const navigate = useNavigate();
  const isHE = lang === Language.HE;
  
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // זיהוי ID פעיל עם הגנות
  const activeClientId = useMemo(() => {
    return clientId || (auth?.isLoggedIn && !auth?.isSuperAdmin ? auth.clientId : null);
  }, [clientId, auth?.isLoggedIn, auth?.isSuperAdmin, auth?.clientId]);

  const isPublicHome = !clientId && (!auth?.isLoggedIn || auth?.isSuperAdmin);

  // סינון נתונים חסין לשגיאות
  const clientPrizes = useMemo(() => {
    if (!Array.isArray(prizes)) return [];
    return activeClientId ? prizes.filter((p: any) => p.clientId === activeClientId) : prizes;
  }, [prizes, activeClientId]);

  const clientPackages = useMemo(() => {
    if (!Array.isArray(packages)) return [];
    return activeClientId ? packages.filter((p: any) => p.clientId === activeClientId) : packages;
  }, [packages, activeClientId]);

  const clientTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return activeClientId ? tickets.filter((t: any) => t.clientId === activeClientId) : tickets;
  }, [tickets, activeClientId]);
  
  const currentClient = useMemo(() => {
    if (!Array.isArray(clients)) return null;
    return activeClientId ? clients.find((c: any) => c.id === activeClientId) : null;
  }, [clients, activeClientId]);

  // משיכת הקמפיין: סדר עדיפויות - קמפיין הלקוח, לאחר מכן הקמפיין מהסטור (שם נשמרות ההגדרות מהמנהל)
  const currentCampaign = useMemo(() => {
    return currentClient?.campaign || campaign || {};
  }, [currentClient, campaign]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = currentCampaign?.drawDate;
    if (!targetDate) return;

    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentCampaign?.drawDate]);

  const featuredPrizes = useMemo(() => 
    clientPrizes.filter((p: Prize) => p.isFeatured)
  , [clientPrizes]);

  useEffect(() => {
    if (featuredPrizes.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPrizes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredPrizes.length]);

  const handleShareCatalog = async (idFromCard?: string) => {
    const idToShare = idFromCard || activeClientId;
    const shareUrl = idToShare 
      ? `${window.location.origin}/#/catalog/${idToShare}`
      : `${window.location.origin}/`;
    
    try {
      const shareData = {
        title: isHE ? currentCampaign?.nameHE || 'Mazalix' : currentCampaign?.nameEN || 'Mazalix',
        text: isHE ? `בואו להשתתף במכירה הפומבית היוקרתית!` : `Join the luxury auction!`,
        url: shareUrl, 
      };
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert(isHE ? 'הקישור הועתק!' : 'Copied!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const regularPrizes = useMemo(() => 
    [...clientPrizes].filter((p: Prize) => !p.isFeatured).sort((a, b) => (a.order || 0) - (b.order || 0))
  , [clientPrizes]);

  const isEmpty = clientPrizes.length === 0 && clientPackages.length === 0;

  // --- תצוגת דף הבית הציבורי ---
  if (isPublicHome) {
    return (
      <div className="space-y-12 pb-20 animate-fade-in max-w-7xl mx-auto px-4">
        <header className="text-center space-y-4 py-16">
          <h1 className="text-5xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent leading-tight tracking-tighter">
            {isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs md:text-sm">
            {isHE ? 'בחרו קטלוג יוקרה והצטרפו להגרלה' : 'Select a premium catalog and join the raffle'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(clients) && clients.map((client: any) => (
            <div key={client.id} className="group glass-card rounded-[3rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/30 transition-all duration-500 shadow-2xl flex flex-col relative">
              <div className="relative h-56 overflow-hidden bg-black/40">
                {client.campaign?.banner ? (
                  <img src={client.campaign.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] opacity-60" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Sparkles size={60} className="gold-text" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl overflow-hidden">
                   {client.campaign?.logo ? <img src={client.campaign.logo} className="w-full h-full object-contain" alt="" /> : <Gift size={24} className="gold-text" />}
                </div>
              </div>
              
              <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-black italic gold-text mb-3 leading-none">{client.campaign?.nameHE || client.name || client.displayName}</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar size={12} className="gold-text" />
                    {isHE ? 'תאריך הגרלה:' : 'Draw Date:'} {client.campaign?.drawDate || 'TBD'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate?.(`/catalog/${client.id}`)}
                    className="flex-1 py-5 luxury-gradient text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-xl"
                  >
                    <Layout size={18} /> {isHE ? 'כניסה לקטלוג' : 'View Catalog'}
                  </button>
                  <button 
                    onClick={() => handleShareCatalog(client.id)}
                    className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-lg"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- תצוגת קטלוג ספציפי ---
  return (
    <div className="space-y-6 md:space-y-12 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <button onClick={() => navigate?.('/')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
           <ArrowRight size={14} className={isHE ? '' : 'rotate-180'} /> {isHE ? 'חזרה לכל הקמפיינים' : 'Back to all campaigns'}
        </button>
        <a href={currentCampaign?.donationUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-3 luxury-gradient text-black font-black rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-tighter italic">
          <ShoppingCart size={16} />
          {isHE ? 'לרכישת כרטיסים' : 'Buy Tickets Now'}
        </a>
      </div>

      <header className="relative h-[400px] md:h-[600px] rounded-3xl md:rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/5 animate-fade-in mx-1 md:mx-0 hero-h">
        {currentCampaign?.videoUrl ? (
            <video src={currentCampaign.videoUrl} className="w-full h-full object-cover opacity-30" autoPlay muted loop playsInline />
        ) : (
            <img src={currentCampaign?.banner || ''} className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[4s]" alt="Banner" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent"></div>
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20 flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-white/10 shadow-2xl animate-bounce" style={{ animationDuration: '4s' }}>
           <Ticket size={20} className="gold-text" />
           <div className="text-right">
             <p className="text-xs md:text-xl font-black tracking-tighter italic leading-none">{clientTickets.length.toLocaleString()}</p>
             <p className="text-[7px] md:text-[9px] font-black uppercase text-gray-500 tracking-widest">{isHE ? 'כרטיסי מזל' : 'Luck Tokens'}</p>
           </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-6 md:space-y-10">
          <img src={currentCampaign?.logo || ''} className="w-16 h-16 md:w-32 md:h-32 object-contain drop-shadow-[0_0_30px_rgba(194,163,83,0.5)]" alt="Logo" />
          <div className="space-y-2">
            <h1 className="text-2xl md:text-6xl font-black tracking-tighter luxury-gradient bg-clip-text text-transparent italic leading-tight">
              {isHE ? currentCampaign?.nameHE || currentClient?.name : currentCampaign?.nameEN || currentClient?.name}
            </h1>
            <div className="flex flex-row-reverse gap-4 md:gap-10 justify-center pt-4 pb-2">
              {[{ label: isHE ? 'ימים' : 'Days', val: timeLeft.days }, { label: isHE ? 'שעות' : 'Hours', val: timeLeft.hours }, { label: isHE ? 'דקות' : 'Mins', val: timeLeft.mins }, { label: isHE ? 'שניות' : 'Secs', val: timeLeft.secs }].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl md:text-5xl font-black italic gold-text leading-none">{t.val.toString().padStart(2, '0')}</span>
                  <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase mt-1">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {currentCampaign?.donationUrl && (
              <a href={currentCampaign.donationUrl} target="_blank" rel="noreferrer" className="px-10 py-3 md:px-16 md:py-4 luxury-gradient text-black font-black rounded-xl md:rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all text-xs md:text-base uppercase tracking-tighter italic">
                {isHE ? 'להצטרפות להגרלה' : 'Join Auction Now'}
              </a>
            )}
            <button onClick={() => handleShareCatalog()} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest">
              <Share2 size={16} className="gold-text" />
              {isHE ? 'שתפו את הקטלוג' : 'Share Catalog'}
            </button>
          </div>
        </div>
      </header>

      {featuredPrizes.length > 0 && (
        <div className="px-1 md:px-0 mt-8 md:mt-16">
          <div className="relative h-[320px] md:h-[520px] w-full floating glass-card rounded-[2.5rem] md:rounded-[4.5rem] border-2 border-[#C2A353]/30 overflow-hidden shadow-2xl group">
            {featuredPrizes.map((p, idx) => {
              const isActive = idx === featuredIndex;
              const tCount = clientTickets.filter((t: any) => t.prizeId === p.id).length;
              return (
                <div key={p.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-full scale-105 z-0'}`}>
                  <img src={p.media?.[0]?.url || ''} className="absolute inset-0 w-full h-full object-cover grayscale-[0.1] group-hover:scale-105 transition-transform duration-[4s]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 md:bottom-24 md:left-24 md:right-24 flex flex-col md:flex-row md:items-end justify-between gap-12 z-20">
                    <div className="space-y-4 max-w-3xl">
                       <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent leading-none">{isHE ? p.titleHE : p.titleEN}</h2>
                       <div className="flex items-center gap-8 pt-4">
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-[1.5rem] border border-white/20 shadow-xl">
                            <Ticket size={24} className="gold-text" />
                            <span className="text-sm md:text-xl font-black text-white">{tCount.toLocaleString()} {isHE ? 'כרטיסים' : 'Tix'}</span>
                          </div>
                          <span className="text-4xl md:text-7xl font-black italic gold-text tracking-tighter">₪{p.value?.toLocaleString() || 0}</span>
                       </div>
                    </div>
                    <div className="flex gap-5">
                        <PrizeShareButton activeClientId={activeClientId} prize={p} isHE={isHE} campaignName={currentCampaign?.nameHE || 'Mazalix'} className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem]" iconSize={32} />
                        {currentCampaign?.donationUrl && (
                          <div className="flex flex-col gap-2">
                            <a href={currentCampaign.donationUrl} target="_blank" rel="noreferrer" className="px-12 md:px-20 h-16 md:h-24 luxury-gradient text-black font-black rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm md:text-xl uppercase italic tracking-tighter">{isHE ? 'להשתתפות עכשיו' : 'Enter Auction'}</a>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4">
          {Array.isArray(regularPrizes) && regularPrizes.map((p: any) => (
            <PrizeCard 
              key={p.id} 
              activeClientId={activeClientId} 
              prize={p} 
              isHE={isHE} 
              campaignName={currentCampaign?.nameHE || 'Mazalix'} 
              donationUrl={currentCampaign?.donationUrl} 
              ticketCount={clientTickets.filter((t: any) => t.prizeId === p.id).length} 
            />
          ))}
        </div>
      )}

      {selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedPkg?.(null)}></div>
          <div className="relative w-full max-w-xl glass-card rounded-[2.5rem] border overflow-hidden shadow-2xl" style={{ borderColor: `${selectedPkg.color}40` }}>
             <button onClick={() => setSelectedPkg?.(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all z-10"><X size={20}/></button>
             <div className="p-8 md:p-10 space-y-6 overflow-y-auto max-h-[60vh]">
                <h2 className="text-2xl md:text-4xl font-black italic" style={{ color: selectedPkg.color || '#C2A353' }}>{isHE ? selectedPkg.nameHE : selectedPkg.nameEN}</h2>
                <div className="grid grid-cols-1 gap-3">
                   {Array.isArray(selectedPkg.rules) && selectedPkg.rules.map((rule: any, idx: number) => {
                     const prizeObj = Array.isArray(prizes) ? prizes.find((p: any) => p.id === rule.prizeId) : null;
                     return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C2A353] overflow-hidden border border-white/5">
                               {rule.prizeId === 'ALL' ? <Layers size={20} /> : (prizeObj?.media?.[0]?.url ? <img src={prizeObj.media[0].url} className="w-full h-full object-cover" alt="" /> : <Gift size={20} />)}
                             </div>
                             <div>
                               <p className="text-xs md:text-sm font-black italic leading-tight">{rule.prizeId === 'ALL' ? (isHE ? 'כל הפרסים' : 'All Prizes') : (isHE ? prizeObj?.titleHE : prizeObj?.titleEN)}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-xl md:text-2xl font-black italic" style={{ color: selectedPkg.color || '#C2A353' }}>{rule.count}</p>
                           </div>
                        </div>
                     )
                   })}
                </div>
                <a href={selectedPkg.joinLink || '#'} target="_blank" rel="noreferrer" className="block w-full text-center py-4 rounded-2xl text-black font-black text-sm uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-95 italic" style={{ backgroundColor: selectedPkg.color || '#C2A353' }}>{isHE ? 'רכישת מסלול' : 'Acquire Now'} — ₪{selectedPkg.minAmount?.toLocaleString() || 0}</a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;