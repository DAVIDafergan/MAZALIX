import React, { useState, useEffect, useMemo } from 'react';
import { Language, Prize, DrawStatus, Package } from '../types';
import { 
  Calendar, MapPin, Sparkles, Layout, Gift, ChevronLeft, ChevronRight, 
  ArrowUpRight, Award, Inbox, X, Ticket, Layers, Timer, Share2, 
  Star, ShoppingCart, ExternalLink, ArrowRight 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
    <div className="group relative rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#C2A353]/30 transition-all duration-500 animate-fade-in flex flex-col shadow-xl overflow-hidden h-full">
      {/* אפקט זוהר עדין בפינה */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#C2A353]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative h-40 md:h-52 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden mb-3 md:mb-5 shadow-inner border border-white/5">
        <img src={prize?.media?.[0]?.url || ''} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex gap-2">
          <div className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-1.5 shadow-xl">
              <Ticket size={12} className="gold-text" />
              <span className="text-[9px] md:text-xs font-black italic text-white">{ticketCount?.toLocaleString() || 0}</span>
          </div>
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
          <h3 className="text-sm md:text-lg font-black tracking-tight group-hover:gold-text transition-colors duration-500 leading-tight italic line-clamp-1">{isHE ? prize?.titleHE : prize?.titleEN}</h3>
          <p className="text-gray-400 text-[9px] md:text-[11px] leading-snug line-clamp-2 font-bold italic opacity-60">{isHE ? prize?.descriptionHE : prize?.descriptionEN}</p>
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
              <a href={donationUrl} target="_blank" rel="noreferrer" className="block w-full py-2.5 md:py-3.5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:luxury-gradient hover:text-black hover:border-transparent transition-all duration-500 text-center italic shadow-lg relative overflow-hidden group/btn">
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
          <h1 className="text-5xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent leading-tight tracking-tighter drop-shadow-2xl">
            {isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-[10px] md:text-sm opacity-80">
            {isHE ? 'בחרו קטלוג פרימיום והצטרפו להגרלה' : 'Select a premium catalog and join the raffle'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          {Array.isArray(clients) && clients.map((client: any) => (
            <div key={client.id} className="group glass-card rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/50 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col relative hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden bg-black/40">
                {client.campaign?.banner ? (
                  <img src={client.campaign.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] opacity-70" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Sparkles size={80} className="gold-text" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
                <div className="absolute top-8 left-8 w-20 h-20 bg-black/40 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-700">
                   {client.campaign?.logo ? <img src={client.campaign.logo} className="w-full h-full object-contain p-2" alt="" /> : <Gift size={32} className="gold-text" />}
                </div>
              </div>
              
              <div className="p-10 space-y-10 flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black italic gold-text mb-4 leading-none tracking-tighter">{client.campaign?.nameHE || client.name || client.displayName}</h3>
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 opacity-70">
                    <Calendar size={14} className="gold-text" />
                    {isHE ? 'תאריך הגרלה:' : 'Draw Date:'} <span className="text-white">{client.campaign?.drawDate || 'TBD'}</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate?.(`/catalog/${client._id || client.id}`)}
                    className="flex-1 py-5 luxury-gradient text-black font-black rounded-2xl md:rounded-[1.5rem] text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl"
                  >
                    <Layout size={18} /> {isHE ? 'כניסה לקטלוג' : 'View Catalog'}
                  </button>
                  <button 
                    onClick={() => handleShareCatalog(client._id || client.id)}
                    className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-[#C2A353] hover:text-black transition-all flex items-center justify-center shadow-xl group/share"
                  >
                    <Share2 size={20} className="group-hover/share:scale-110 transition-transform" />
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
    <>
      <Helmet>
        <title>{isHE ? currentCampaign?.nameHE : currentCampaign?.nameEN} | Mazalix</title>
        <meta property="og:title" content={isHE ? currentCampaign?.nameHE : currentCampaign?.nameEN} />
        <meta property="og:description" content={isHE ? `הצטרפו להגרלה היוקרתית של ${currentCampaign?.nameHE}!` : `Join the exclusive draw of ${currentCampaign?.nameEN}!`} />
        <meta property="og:image" content={currentCampaign?.banner || currentCampaign?.logo} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={isHE ? currentCampaign?.nameHE : currentCampaign?.nameEN} />
        <meta name="twitter:image" content={currentCampaign?.banner} />
      </Helmet>

      <div className="space-y-10 md:space-y-20 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 animate-fade-in">
        {/* ניווט עליון */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
          <button onClick={() => navigate?.('/')} className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] italic">
             <ArrowRight size={16} className={`${isHE ? '' : 'rotate-180'} group-hover:-translate-x-1 transition-transform`} /> 
             {isHE ? 'חזרה לכל הקמפיינים' : 'Back to all campaigns'}
          </button>
          <a href={currentCampaign?.donationUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-12 py-4 luxury-gradient text-black font-black rounded-full shadow-[0_15px_30px_-10px_rgba(194,163,83,0.5)] hover:scale-110 hover:rotate-1 active:scale-95 transition-all text-sm uppercase tracking-tighter italic">
            <ShoppingCart size={18} />
            {isHE ? 'לרכישת כרטיסים' : 'Buy Tickets Now'}
          </a>
        </div>

        {/* באנר ראשי משופר */}
        <header className="relative h-[500px] md:h-[750px] rounded-[3rem] md:rounded-[4rem] overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 mx-auto w-full">
          {currentCampaign?.videoUrl ? (
              <video src={currentCampaign.videoUrl} className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]" autoPlay muted loop playsInline />
          ) : (
              <img src={currentCampaign?.banner || ''} className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[10s]" alt="Banner" />
          )}
          
          {/* שכבות גרדיאנט לעומק */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-10 md:space-y-14">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-[#C2A353] blur-[60px] opacity-20 group-hover/logo:opacity-40 transition-opacity duration-1000"></div>
              <img src={currentCampaign?.logo || ''} className="w-24 h-24 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(194,163,83,0.3)] group-hover/logo:scale-110 transition-transform duration-700" alt="Logo" />
            </div>
            
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-3xl md:text-8xl font-black tracking-tighter luxury-gradient bg-clip-text text-transparent italic leading-tight drop-shadow-2xl px-4">
                {isHE ? currentCampaign?.nameHE || currentClient?.name : currentCampaign?.nameEN || currentClient?.name}
              </h1>
              
              {/* טיימר מעוצב מחדש */}
              <div className="flex flex-row-reverse gap-4 md:gap-12 justify-center bg-white/5 backdrop-blur-md px-10 py-6 rounded-[2.5rem] border border-white/10 shadow-inner">
                {[{ label: isHE ? 'ימים' : 'Days', val: timeLeft.days }, { label: isHE ? 'שעות' : 'Hours', val: timeLeft.hours }, { label: isHE ? 'דקות' : 'Mins', val: timeLeft.mins }, { label: isHE ? 'שניות' : 'Secs', val: timeLeft.secs }].map((t, i) => (
                  <div key={i} className="flex flex-col items-center group/timer">
                    <span className="text-3xl md:text-6xl font-black italic gold-text leading-none group-hover:scale-110 transition-transform duration-500">{t.val.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] md:text-[11px] font-black text-gray-500 uppercase mt-3 tracking-widest">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {currentCampaign?.donationUrl && (
                <a href={currentCampaign.donationUrl} target="_blank" rel="noreferrer" className="px-14 py-4 md:px-24 md:py-6 luxury-gradient text-black font-black rounded-2xl md:rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(194,163,83,0.6)] hover:scale-110 hover:-rotate-1 active:scale-95 transition-all text-xs md:text-lg uppercase tracking-[0.2em] italic">
                  {isHE ? 'להצטרפות למסע' : 'Enter The Journey'}
                </a>
              )}
              <button onClick={() => handleShareCatalog()} className="flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest text-white shadow-xl">
                <Share2 size={18} className="gold-text" />
                {isHE ? 'שתפו את הקטלוג' : 'Share Collection'}
              </button>
            </div>
          </div>
        </header>

        {/* אזור ה-Featured המשופר */}
        {featuredPrizes.length > 0 && (
          <div className="space-y-10 md:space-y-16">
            <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C2A353]/50 to-transparent"></div>
              <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-[0.4em] gold-text">Selection Royale</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C2A353]/50 to-transparent"></div>
            </div>
            
            <div className="relative h-[400px] md:h-[650px] w-full glass-card rounded-[3rem] md:rounded-[5rem] border-2 border-[#C2A353]/40 overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] group">
              {featuredPrizes.map((p, idx) => {
                const isActive = idx === featuredIndex;
                const tCount = clientTickets.filter((t: any) => t.prizeId === p.id).length;
                return (
                  <div key={p.id} className={`absolute inset-0 transition-all duration-[1.5s] cubic-bezier(0.4, 0, 0.2, 1) ${isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-10 scale-105 z-0'}`}>
                    <img src={p.media?.[0]?.url || ''} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-[10s]" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent"></div>
                    
                    <div className="absolute bottom-12 left-8 right-8 md:bottom-20 md:left-20 md:right-20 flex flex-col md:flex-row md:items-end justify-between gap-10 z-20">
                      <div className="space-y-6 md:space-y-8 max-w-4xl">
                         <h2 className="text-4xl md:text-9xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">{isHE ? p.titleHE : p.titleEN}</h2>
                         <div className="flex flex-wrap items-center gap-6 md:gap-12">
                            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-3xl px-6 py-2.5 rounded-[1.5rem] border border-white/20 shadow-2xl">
                              <Ticket size={24} className="gold-text" />
                              <span className="text-sm md:text-2xl font-black text-white">{tCount.toLocaleString()} {isHE ? 'כרטיסים' : 'Tix'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-[0.3em] mb-1">{isHE ? 'בשיווי מוערך' : 'Estimated Value'}</span>
                              <span className="text-4xl md:text-8xl font-black italic gold-text tracking-tighter drop-shadow-2xl leading-none">₪{p.value?.toLocaleString() || 0}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-6">
                          <PrizeShareButton activeClientId={activeClientId} prize={p} isHE={isHE} campaignName={currentCampaign?.nameHE || 'Mazalix'} className="w-16 h-16 md:w-28 md:h-28 rounded-[2rem] border-2 border-white/20 hover:scale-110" iconSize={36} />
                          {(currentCampaign?.donationUrl || campaign?.donationUrl) && (
                            <div className="flex flex-col gap-2">
                              <a href={currentCampaign.donationUrl || campaign.donationUrl} target="_blank" rel="noreferrer" className="px-12 md:px-24 h-16 md:h-28 luxury-gradient text-black font-black rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(194,163,83,0.4)] hover:scale-105 active:scale-95 transition-all text-sm md:text-2xl uppercase italic tracking-tighter">
                                {isHE ? 'הגש מועמדות' : 'Acquire Luck'}
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* מחווני ניווט ל-Featured */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {featuredPrizes.map((_, i) => (
                  <div key={i} className={`h-1.5 transition-all duration-700 rounded-full ${i === featuredIndex ? 'w-12 bg-[#C2A353]' : 'w-3 bg-white/20'}`}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* גריד המתנות הרגיל */}
        {!isEmpty && (
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-[0.4em] text-white opacity-40 whitespace-nowrap">{isHE ? 'האוסף המלא' : 'The Full Collection'}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
              {Array.isArray(regularPrizes) && regularPrizes.map((p: any) => (
                <PrizeCard 
                  key={p.id} 
                  activeClientId={activeClientId} 
                  prize={p} 
                  isHE={isHE} 
                  campaignName={currentCampaign?.nameHE || 'Mazalix'} 
                  donationUrl={currentCampaign?.donationUrl || campaign?.donationUrl} 
                  ticketCount={clientTickets.filter((t: any) => t.prizeId === p.id).length} 
                />
              ))}
            </div>
          </div>
        )}

        {/* מודל מסלול משופר */}
        {selectedPkg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl transition-all" onClick={() => setSelectedPkg?.(null)}></div>
            <div className="relative w-full max-w-2xl glass-card rounded-[3.5rem] border-2 overflow-hidden shadow-[0_0_100px_rgba(194,163,83,0.2)] animate-scale-up" style={{ borderColor: `${selectedPkg.color}60` }}>
               <button onClick={() => setSelectedPkg?.(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all z-10 border border-white/10"><X size={24}/></button>
               
               <div className="p-10 md:p-16 space-y-10 overflow-y-auto max-h-[85vh] hide-scrollbar">
                  <div className="text-center space-y-4">
                    <span className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.5em]">{isHE ? 'פרטי מסלול' : 'Package Privileges'}</span>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter" style={{ color: selectedPkg.color || '#C2A353' }}>{isHE ? selectedPkg.nameHE : selectedPkg.nameEN}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {Array.isArray(selectedPkg.rules) && selectedPkg.rules.map((rule: any, idx: number) => {
                       const prizeObj = Array.isArray(prizes) ? prizes.find((p: any) => p.id === rule.prizeId) : null;
                       return (
                          <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 group hover:bg-white/[0.06] transition-all duration-500">
                             <div className="flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-[#C2A353] overflow-hidden border border-white/10 shadow-2xl group-hover:scale-110 transition-transform">
                                 {rule.prizeId === 'ALL' ? <Layers size={28} /> : (prizeObj?.media?.[0]?.url ? <img src={prizeObj.media[0].url} className="w-full h-full object-cover" alt="" /> : <Gift size={28} />)}
                               </div>
                               <div>
                                 <p className="text-sm md:text-xl font-black italic leading-tight text-white/90">{rule.prizeId === 'ALL' ? (isHE ? 'כל הפרסים בקמפיין' : 'All Campaign Prizes') : (isHE ? prizeObj?.titleHE : prizeObj?.titleEN)}</p>
                                 <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{isHE ? 'כרטיסי השתתפות' : 'Entry Tokens'}</p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-3xl md:text-5xl font-black italic drop-shadow-lg" style={{ color: selectedPkg.color || '#C2A353' }}>x{rule.count}</p>
                             </div>
                          </div>
                       )
                     })}
                  </div>
                  
                  <div className="pt-6">
                    <a href={selectedPkg.joinLink || '#'} target="_blank" rel="noreferrer" className="block w-full text-center py-6 rounded-[2rem] text-black font-black text-lg md:text-xl uppercase shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] active:scale-95 italic tracking-widest hover:brightness-110" style={{ backgroundColor: selectedPkg.color || '#C2A353' }}>
                      {isHE ? 'רכישת מסלול' : 'Acquire Now'} — ₪{selectedPkg.minAmount?.toLocaleString() || 0}
                    </a>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Catalog;