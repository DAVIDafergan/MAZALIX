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

function PrizeCard({ activeClientId, prize, isHE, campaignName, donationUrl }: any) {
  if (!prize) return null;

  return (
    <div className="group relative rounded-[1.5rem] md:rounded-[2rem] p-2.5 md:p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-[#C2A353]/30 transition-all duration-500 animate-fade-in flex flex-col shadow-xl overflow-hidden h-full">
      {/* אפקט זוהר עדין בפינה */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#C2A353]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative h-44 md:h-52 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden mb-3 md:mb-5 shadow-inner border border-white/5">
        <img src={prize?.media?.[0]?.url || ''} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
          <PrizeShareButton activeClientId={activeClientId} prize={prize} isHE={isHE} campaignName={campaignName} iconSize={10} />
        </div>

        {prize?.isFeatured && (
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 px-3 py-1 bg-[#C2A353] rounded-lg text-black font-black text-[8px] md:text-[9px] uppercase italic tracking-tighter">
            {isHE ? 'מומלץ' : 'FEATURED'}
          </div>
        )}
      </div>

      <div className="px-1 pb-1 space-y-3 md:space-y-4 flex-1 flex flex-col justify-between text-center relative z-10">
        <div className="space-y-1.5">
          <h3 className="text-sm md:text-lg font-black tracking-tight group-hover:gold-text transition-colors duration-500 leading-tight italic line-clamp-1">
            {isHE ? prize?.titleHE : prize?.titleEN}
          </h3>
          <p className="text-gray-400 text-[9px] md:text-[11px] leading-snug line-clamp-2 font-bold italic opacity-60">
            {isHE ? prize?.descriptionHE : prize?.descriptionEN}
          </p>
        </div>

        <div className="pt-1 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[7px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">
              {isHE ? 'בשיווי' : 'Estimated Value'}
            </span>
            <p className="text-lg md:text-2xl font-black italic leading-none gold-text tracking-tighter">
              ₪{prize?.value?.toLocaleString() || 0}
            </p>
          </div>
          
          {donationUrl && (
            <div className="w-full">
              <a href={donationUrl} target="_blank" rel="noreferrer" className="block w-full py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:luxury-gradient hover:text-black hover:border-transparent transition-all duration-500 text-center italic shadow-lg relative overflow-hidden group/btn">
                <span className="relative z-10">{isHE ? 'פרטים והצטרפות' : 'View Opportunity'}</span>
                <div className="absolute inset-0 bg-[#C2A353] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
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
    // תיקון קריטי: מחפשים גם לפי 'id' וגם לפי ה-'_id' של מונגו כדי לוודא סנכרון עם השרת
    return activeClientId ? clients.find((c: any) => c.id === activeClientId || c._id === activeClientId) : null;
  }, [clients, activeClientId]);

  // משיכת הקמפיין: סדר עדיפויות - קמפיין הלקוח האמיתי מהמסד, לאחר מכן Fallback
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
          <h1 className="text-4xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent leading-tight tracking-tighter drop-shadow-2xl">
            {isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-[10px] md:text-sm opacity-80">
            {isHE ? 'בחרו קטלוג פרימיום והצטרפו להגרלה' : 'Select a premium catalog and join the raffle'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
          {Array.isArray(clients) && clients.map((client: any) => (
            <div key={client.id} className="group glass-card rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/50 transition-all duration-700 shadow-2xl flex flex-col relative hover:-translate-y-2">
              <div className="relative h-56 md:h-64 overflow-hidden bg-black/40">
                {client.campaign?.banner ? (
                  <img src={client.campaign.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] opacity-70" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Sparkles size={80} className="gold-text" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
                <div className="absolute top-6 left-6 md:top-8 md:left-8 w-16 h-16 md:w-20 md:h-20 bg-black/40 backdrop-blur-2xl rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                   {client.campaign?.logo ? <img src={client.campaign.logo} className="w-full h-full object-contain p-2" alt="" /> : <Gift size={32} className="gold-text" />}
                </div>
              </div>
              
              <div className="p-8 md:p-10 space-y-8 flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <h3 className="text-2xl md:text-4xl font-black italic gold-text mb-3 md:mb-4 leading-none tracking-tighter">{client.campaign?.nameHE || client.name || client.displayName}</h3>
                  <p className="text-gray-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 opacity-70">
                    <Calendar size={14} className="gold-text" />
                    {isHE ? 'תאריך הגרלה:' : 'Draw Date:'} <span className="text-white">{client.campaign?.drawDate || 'TBD'}</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate?.(`/catalog/${client._id || client.id}`)}
                    className="flex-1 py-4 md:py-5 luxury-gradient text-black font-black rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl"
                  >
                    <Layout size={18} /> {isHE ? 'כניסה' : 'View Catalog'}
                  </button>
                  <button 
                    onClick={() => handleShareCatalog(client._id || client.id)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-[#C2A353] hover:text-black transition-all flex items-center justify-center shadow-xl group/share"
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
    <div className="space-y-8 md:space-y-16 pb-20 max-w-[1400px] mx-auto px-3 md:px-8 animate-fade-in">
      {/* ניווט עליון */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
        <button onClick={() => navigate?.('/')} className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] italic">
           <ArrowRight size={14} className={`${isHE ? '' : 'rotate-180'} group-hover:-translate-x-1 transition-transform`} /> 
           {isHE ? 'חזרה' : 'Back to all'}
        </button>
        <a href={currentCampaign?.donationUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 md:px-12 py-3 md:py-4 luxury-gradient text-black font-black rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-[11px] md:text-sm uppercase tracking-tighter italic">
          <ShoppingCart size={18} />
          {isHE ? 'לרכישת כרטיסים' : 'Buy Tickets Now'}
        </a>
      </div>

      {/* באנר ראשי */}
      <header className="relative h-[380px] md:h-[600px] rounded-[2rem] md:rounded-[4rem] overflow-hidden group shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 mx-auto w-full">
        {currentCampaign?.videoUrl ? (
            <video src={currentCampaign.videoUrl} className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]" autoPlay muted loop playsInline />
        ) : (
            <img src={currentCampaign?.banner || ''} className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[10s]" alt="Banner" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-6 md:space-y-12">
          <div className="relative">
            <img src={currentCampaign?.logo || ''} className="w-16 h-16 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(194,163,83,0.3)]" alt="Logo" />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-xl md:text-7xl font-black tracking-tighter luxury-gradient bg-clip-text text-transparent italic leading-tight drop-shadow-2xl px-2">
              {isHE ? currentCampaign?.nameHE || currentClient?.name : currentCampaign?.nameEN || currentClient?.name}
            </h1>
            
            <div className="flex flex-row-reverse gap-3 md:gap-10 justify-center bg-white/5 backdrop-blur-md px-6 py-4 md:px-10 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
              {[{ label: isHE ? 'ימים' : 'Days', val: timeLeft.days }, { label: isHE ? 'שעות' : 'Hours', val: timeLeft.hours }, { label: isHE ? 'דקות' : 'Mins', val: timeLeft.mins }, { label: isHE ? 'שניות' : 'Secs', val: timeLeft.secs }].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xl md:text-5xl font-black italic gold-text leading-none">{t.val.toString().padStart(2, '0')}</span>
                  <span className="text-[6px] md:text-[10px] font-black text-gray-500 uppercase mt-2 tracking-widest">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {currentCampaign?.donationUrl && (
              <a href={currentCampaign.donationUrl} target="_blank" rel="noreferrer" className="px-10 py-3 md:px-20 md:py-5 luxury-gradient text-black font-black rounded-xl md:rounded-[1.8rem] shadow-xl hover:scale-110 active:scale-95 transition-all text-[10px] md:text-base uppercase tracking-[0.2em] italic">
                {isHE ? 'להצטרפות למסע' : 'Enter The Journey'}
              </a>
            )}
            <button onClick={() => handleShareCatalog()} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all font-black text-[8px] md:text-xs uppercase tracking-widest text-white shadow-xl">
              <Share2 size={14} className="gold-text" />
              {isHE ? 'שתפו' : 'Share'}
            </button>
          </div>
        </div>
      </header>

      {/* Featured Selection */}
      {featuredPrizes.length > 0 && (
        <div className="space-y-6 md:space-y-12 pt-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[9px] md:text-sm font-black italic uppercase tracking-[0.4em] gold-text">Featured Selection</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#C2A353]/30 to-transparent"></div>
          </div>
          
          <div className="relative h-[300px] md:h-[550px] w-full floating glass-card rounded-[1.8rem] md:rounded-[3rem] border-2 border-[#C2A353]/30 overflow-hidden shadow-2xl group">
            {featuredPrizes.map((p, idx) => {
              const isActive = idx === featuredIndex;
              return (
                <div key={p.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-10 scale-105 z-0'}`}>
                  <img src={p.media?.[0]?.url || ''} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-[8s]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-5 right-5 md:bottom-16 md:left-16 md:right-16 flex flex-col md:flex-row md:items-end justify-between gap-6 z-20">
                    <div className="space-y-3 md:space-y-6 max-w-3xl">
                       <h2 className="text-2xl md:text-8xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent leading-none drop-shadow-lg">{isHE ? p.titleHE : p.titleEN}</h2>
                       <div className="flex flex-wrap items-center gap-4 md:gap-8">
                          <div className="flex flex-col">
                            <span className="text-[7px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">{isHE ? 'בשיווי מוערך' : 'Estimated Value'}</span>
                            <span className="text-2xl md:text-7xl font-black italic gold-text tracking-tighter leading-none">₪{p.value?.toLocaleString() || 0}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                        <PrizeShareButton activeClientId={activeClientId} prize={p} isHE={isHE} campaignName={currentCampaign?.nameHE || 'Mazalix'} className="w-12 h-12 md:w-24 md:h-24 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/20 hover:scale-110" iconSize={24} />
                        {(currentCampaign?.donationUrl || campaign?.donationUrl) && (
                          <a href={currentCampaign.donationUrl || campaign.donationUrl} target="_blank" rel="noreferrer" className="px-8 py-3.5 md:px-20 h-12 md:h-24 luxury-gradient text-black font-black rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-xl hover:scale-105 transition-all text-[10px] md:text-xl uppercase italic tracking-tighter">
                            {isHE ? 'השתתפות' : 'Enter'}
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid of Prizes */}
      {!isEmpty && (
        <div className="space-y-8 md:space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-[8px] md:text-[10px] font-black italic uppercase tracking-[0.4em] text-white opacity-40 whitespace-nowrap">{isHE ? 'האוסף המלא' : 'The Full Collection'}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {Array.isArray(regularPrizes) && regularPrizes.map((p: any) => (
              <PrizeCard 
                key={p.id} 
                activeClientId={activeClientId} 
                prize={p} 
                isHE={isHE} 
                campaignName={currentCampaign?.nameHE || 'Mazalix'} 
                donationUrl={currentCampaign?.donationUrl || campaign?.donationUrl} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Package Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl transition-all" onClick={() => setSelectedPkg?.(null)}></div>
          <div className="relative w-full max-w-xl glass-card rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden shadow-2xl" style={{ borderColor: `${selectedPkg.color}50` }}>
             <button onClick={() => setSelectedPkg?.(null)} className="absolute top-5 right-5 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all z-10"><X size={18}/></button>
             
             <div className="p-6 md:p-12 space-y-6 md:space-y-8 overflow-y-auto max-h-[80vh] hide-scrollbar">
                <div className="text-center space-y-1 md:space-y-2">
                  <span className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">{isHE ? 'פרטי מסלול' : 'Package Details'}</span>
                  <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter" style={{ color: selectedPkg.color || '#C2A353' }}>{isHE ? selectedPkg.nameHE : selectedPkg.nameEN}</h2>
                </div>

                <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                   {Array.isArray(selectedPkg.rules) && selectedPkg.rules.map((rule: any, idx: number) => {
                     const prizeObj = Array.isArray(prizes) ? prizes.find((p: any) => p.id === rule.prizeId) : null;
                     return (
                        <div key={idx} className="flex items-center justify-between p-4 md:p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                           <div className="flex items-center gap-4 md:gap-5">
                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/40 flex items-center justify-center text-[#C2A353] overflow-hidden border border-white/10 shadow-xl">
                               {rule.prizeId === 'ALL' ? <Layers size={20} /> : (prizeObj?.media?.[0]?.url ? <img src={prizeObj.media[0].url} className="w-full h-full object-cover" alt="" /> : <Gift size={20} />)}
                             </div>
                             <div>
                               <p className="text-[11px] md:text-base font-black italic leading-tight text-white/90">{rule.prizeId === 'ALL' ? (isHE ? 'כל הפרסים' : 'All Prizes') : (isHE ? prizeObj?.titleHE : prizeObj?.titleEN)}</p>
                               <p className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">{isHE ? 'כרטיסים' : 'Tickets'}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-xl md:text-4xl font-black italic" style={{ color: selectedPkg.color || '#C2A353' }}>x{rule.count}</p>
                           </div>
                        </div>
                     )
                   })}
                </div>
                
                <a href={selectedPkg.joinLink || '#'} target="_blank" rel="noreferrer" className="block w-full text-center py-4 md:py-5 rounded-[1.5rem] md:rounded-[1.8rem] text-black font-black text-sm md:text-lg uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-95 italic tracking-wider" style={{ backgroundColor: selectedPkg.color || '#C2A353' }}>
                  {isHE ? 'רכישה' : 'Acquire'} — ₪{selectedPkg.minAmount?.toLocaleString() || 0}
                </a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;