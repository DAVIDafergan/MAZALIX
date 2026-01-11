import React, { useState, useEffect } from 'react';
import { Language, Prize, DrawStatus, Package } from '../types';
import { Calendar, MapPin, Sparkles, Layout, Gift, ChevronLeft, ChevronRight, ArrowUpRight, Award, Inbox, X, Ticket, Layers, Timer, Share2, Star } from 'lucide-react';

interface CatalogProps { store: any; }

const Catalog: React.FC<CatalogProps> = ({ store }) => {
  const { prizes, packages, lang, campaign, tickets } = store;
  const isHE = lang === Language.HE;
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Countdown logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(campaign.drawDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [campaign.drawDate]);

  const featuredPrizes = prizes.filter((p: Prize) => p.isFeatured);

  // Carousel auto-rotation logic for Main Prizes - 3 second interval
  useEffect(() => {
    if (featuredPrizes.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPrizes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredPrizes.length]);

  const handleShareCatalog = async () => {
    const shareData = {
      title: isHE ? campaign.nameHE : campaign.nameEN,
      text: isHE ? `בואו להשתתף במכירה הפומבית של ${campaign.nameHE}!` : `Join the ${campaign.nameEN} luxury auction!`,
      url: window.location.origin + window.location.pathname,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert(isHE ? 'הקישור הועתק ללוח!' : 'Link copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing catalog:', err);
      }
    }
  };

  const sortedPrizes = [...prizes].sort((a, b) => a.order - b.order);
  const regularPrizes = sortedPrizes.filter((p: Prize) => !p.isFeatured);

  const isEmpty = prizes.length === 0 && packages.length === 0;

  return (
    <div className="space-y-6 md:space-y-12 pb-10">
      <header className="relative h-[400px] md:h-[600px] rounded-3xl md:rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/5 animate-fade-in mx-1 md:mx-0 hero-h">
        {campaign.videoUrl ? (
            <video src={campaign.videoUrl} className="w-full h-full object-cover opacity-30" autoPlay muted loop playsInline />
        ) : (
            <img src={campaign.banner} className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[4s]" alt="Banner" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent"></div>
        
        {/* Total Campaign Ticket Counter - Floating Badge */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20 flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-white/10 shadow-2xl animate-bounce" style={{ animationDuration: '4s' }}>
           <Ticket size={20} className="gold-text" />
           <div className="text-right">
              <p className="text-xs md:text-xl font-black tracking-tighter italic leading-none">{tickets.length.toLocaleString()}</p>
              <p className="text-[7px] md:text-[9px] font-black uppercase text-gray-500 tracking-widest">{isHE ? 'כרטיסי מזל' : 'Luck Tokens'}</p>
           </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-6 md:space-y-10">
          <div className="relative">
             <img src={campaign.logo} className="w-16 h-16 md:w-32 md:h-32 object-contain drop-shadow-[0_0_30px_rgba(194,163,83,0.5)]" alt="Logo" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-6xl font-black tracking-tighter luxury-gradient bg-clip-text text-transparent italic leading-tight">
              {isHE ? campaign.nameHE : campaign.nameEN}
            </h1>
            
            {/* Global Countdown Timer */}
            <div className="flex gap-4 md:gap-10 justify-center pt-4 pb-2">
              {[
                { label: isHE ? 'ימים' : 'Days', val: timeLeft.days },
                { label: isHE ? 'שעות' : 'Hours', val: timeLeft.hours },
                { label: isHE ? 'דקות' : 'Mins', val: timeLeft.mins },
                { label: isHE ? 'שניות' : 'Secs', val: timeLeft.secs },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl md:text-5xl font-black italic tracking-tighter gold-text leading-none">{t.val.toString().padStart(2, '0')}</span>
                  <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">{t.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-400 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px] pt-4">
              <div className="flex items-center gap-2"><Calendar className="gold-text" size={12}/> {campaign.drawDate}</div>
              <div className="flex items-center gap-2"><MapPin className="gold-text" size={12}/> {isHE ? 'אירוע הגרלה חי' : 'Live Event'}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {campaign.donationUrl && (
              <a href={campaign.donationUrl} target="_blank" rel="noreferrer" className="px-10 py-3 md:px-16 md:py-4 luxury-gradient text-black font-black rounded-xl md:rounded-[1.5rem] shadow-[0_20px_50px_rgba(194,163,83,0.3)] hover:scale-110 active:scale-95 transition-all text-xs md:text-base uppercase tracking-tighter italic">
                {isHE ? 'להצטרפות להגרלה' : 'Join Auction Now'}
              </a>
            )}
            <button 
              onClick={handleShareCatalog}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest"
            >
              <Share2 size={16} className="gold-text" />
              {isHE ? 'שתפו את הקטלוג' : 'Share Catalog'}
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Rotating Featured Banner (The "Main Prizes" Showcase) */}
      {featuredPrizes.length > 0 && (
        <div className="px-1 md:px-0 mt-8 md:mt-16">
          <div className="relative h-[320px] md:h-[520px] w-full floating glass-card rounded-[2.5rem] md:rounded-[4.5rem] border-2 border-[#C2A353]/30 overflow-hidden shadow-[0_0_120px_rgba(194,163,83,0.2)] group">
            {featuredPrizes.map((p, idx) => {
              const isActive = idx === featuredIndex;
              const prizeTicketCount = tickets.filter((t: any) => t.prizeId === p.id).length;
              
              return (
                <div 
                  key={p.id} 
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-full scale-105 z-0'}`}
                >
                  <img src={p.media[0]?.url} className="absolute inset-0 w-full h-full object-cover grayscale-[0.1] group-hover:scale-105 transition-transform duration-[4s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                  
                  {/* Floating Main Prize Tag */}
                  <div className="absolute top-8 left-8 md:top-14 md:left-14 flex gap-4 z-20">
                    <div className="px-6 py-2.5 bg-black/60 backdrop-blur-xl rounded-[1.5rem] border border-[#C2A353]/30 flex items-center gap-3 shadow-2xl animate-pulse">
                      <Star size={24} className="gold-text fill-[#C2A353]" />
                      <span className="text-xs md:text-base font-black uppercase tracking-[0.4em] text-white italic">{isHE ? 'מתנה ראשית' : 'Main Event'}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-12 left-12 right-12 md:bottom-24 md:left-24 md:right-24 flex flex-col md:flex-row md:items-end justify-between gap-12 z-20">
                    <div className="space-y-4 max-w-3xl">
                       <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-none">
                         {isHE ? p.titleHE : p.titleEN}
                       </h2>
                       <p className="text-gray-200 text-sm md:text-2xl font-bold italic line-clamp-2 max-w-2xl leading-relaxed drop-shadow-lg">
                         {isHE ? p.descriptionHE : p.descriptionEN}
                       </p>
                       <div className="flex items-center gap-8 pt-4">
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-[1.5rem] border border-white/20 shadow-xl">
                            <Ticket size={24} className="gold-text" />
                            <span className="text-sm md:text-xl font-black text-white">{prizeTicketCount.toLocaleString()} {isHE ? 'כרטיסים' : 'Tix'}</span>
                          </div>
                          <span className="text-4xl md:text-7xl font-black italic gold-text tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">₪{p.value.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="flex gap-5">
                       <PrizeShareButton prize={p} isHE={isHE} campaignName={isHE ? campaign.nameHE : campaign.nameEN} className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem]" iconSize={32} />
                       {campaign.donationUrl && (
                        <a href={campaign.donationUrl} target="_blank" rel="noreferrer" className="px-12 md:px-20 h-16 md:h-24 luxury-gradient text-black font-black rounded-[2rem] flex items-center justify-center shadow-[0_20px_60px_rgba(194,163,83,0.4)] hover:scale-105 active:scale-95 transition-all text-sm md:text-xl uppercase italic tracking-tighter">
                          {isHE ? 'להשתתפות עכשיו' : 'Enter Auction'}
                        </a>
                       )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Pagination / Progress Indicators */}
            <div className="absolute bottom-10 right-1/2 translate-x-1/2 flex gap-4 z-30">
              {featuredPrizes.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2.5 rounded-full transition-all duration-700 shadow-xl ${idx === featuredIndex ? 'w-16 bg-[#C2A353] shadow-[0_0_20px_#C2A353]' : 'w-2.5 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className="py-24 text-center space-y-4 glass-card rounded-[2rem] border border-white/5 animate-fade-in mx-1">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
             <Inbox size={40} />
           </div>
           <div className="space-y-1">
              <h3 className="text-xl font-black italic gold-text">{isHE ? 'הקמפיין בדרך...' : 'Campaign Loading...'}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{isHE ? 'הקטלוג כרגע ריק - הישארו מעודכנים' : 'Catalog is empty - stay tuned'}</p>
           </div>
        </div>
      ) : (
        <>
          {packages.length > 0 && (
            <section className="space-y-3 md:space-y-5 px-1 md:px-0">
              <div className="flex items-center gap-2">
                 <div className="h-px flex-1 bg-white/5"></div>
                 <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#C2A353] italic whitespace-nowrap">{isHE ? 'בחרו מסלול תרומה' : 'Select a Route'}</h2>
                 <div className="h-px flex-1 bg-white/5"></div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                {packages.map((pkg: Package) => {
                  const totalTickets = pkg.rules.reduce((acc, rule) => acc + rule.count, 0);
                  return (
                    <div 
                      key={pkg.id} 
                      style={{ borderTop: `4px solid ${pkg.color || '#C2A353'}` }}
                      className="min-w-[180px] md:min-w-[260px] h-[220px] md:h-[280px] relative rounded-2xl md:rounded-[2rem] overflow-hidden glass-card shrink-0 shadow-lg group transition-all"
                    >
                      {pkg.image && <img src={pkg.image} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[2s]" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="absolute inset-0 p-4 flex flex-col justify-end space-y-2">
                        <h3 className="text-sm md:text-base font-black italic leading-tight uppercase" style={{ color: pkg.color || '#C2A353' }}>{isHE ? pkg.nameHE : pkg.nameEN}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] md:text-xs font-black px-2 py-0.5 rounded-full bg-white/10 text-white flex items-center gap-1">
                             <Ticket size={10} className="gold-text" /> {totalTickets} {isHE ? 'כרטיסים' : 'Tickets'}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pt-1">
                          <div className="space-y-1">
                             <p className="text-[10px] md:text-xl font-black tracking-tighter italic leading-none">₪{pkg.minAmount.toLocaleString()}</p>
                             <button onClick={() => setSelectedPkg(pkg)} className="text-[8px] md:text-[10px] font-bold underline text-gray-400 hover:text-white transition-colors">{isHE ? 'לפרטים נוספים' : 'More Details'}</button>
                          </div>
                          {pkg.joinLink && (
                            <a href={pkg.joinLink} target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-black hover:scale-110 transition-all shadow-lg" style={{ backgroundColor: pkg.color || '#C2A353' }}>
                              <ArrowUpRight size={14}/>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {regularPrizes.length > 0 && (
            <section className="space-y-6 md:space-y-8 px-1 md:px-0">
              <div className="flex justify-between items-end border-b border-white/5 pb-4 md:pb-6 gap-2">
                <div className="space-y-0.5">
                   <h2 className="text-base md:text-xl font-black italic tracking-tighter">{isHE ? 'קטלוג המתנות' : 'Luxury Collection'}</h2>
                   <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[7px] md:text-[8px]">{isHE ? 'מאות הזדמנויות לזכות בפרסי יוקרה' : 'Hundreds of premium items'}</p>
                </div>
                <div className="px-3 py-1 rounded-lg border border-white/10 text-[7px] md:text-[8px] font-black uppercase text-gray-600 bg-white/5 whitespace-nowrap">
                  {regularPrizes.length} {isHE ? 'פריטים' : 'Items'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {regularPrizes.map((p: Prize) => {
                  const ticketCount = tickets.filter((t: any) => t.prizeId === p.id).length;
                  
                  // Support for Full Page Layout prizes in the grid (spans all columns)
                  if (p.isFullPage) {
                    return (
                      <div key={p.id} className="col-span-full relative h-[400px] md:h-[650px] rounded-[3rem] md:rounded-[4rem] overflow-hidden glass-card shadow-2xl group border border-white/5 animate-fade-in my-6">
                        <img src={p.media[0]?.url} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
                        
                        <div className="absolute top-10 left-10 md:top-16 md:left-16 flex gap-4">
                           <div className="px-6 py-2.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                             <Layers size={24} className="gold-text" />
                             <span className="text-xs md:text-base font-black uppercase tracking-[0.4em] text-white italic">{isHE ? 'חוויה אקסקלוסיבית' : 'Full Page Exclusive'}</span>
                           </div>
                        </div>

                        <div className="absolute bottom-12 left-12 right-12 md:bottom-24 md:left-24 md:right-24 flex flex-col md:flex-row items-end justify-between gap-10">
                           <div className="space-y-6 max-w-4xl">
                              <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent drop-shadow-2xl leading-none">
                                {isHE ? p.titleHE : p.titleEN}
                              </h2>
                              <p className="text-gray-300 text-sm md:text-2xl font-bold italic line-clamp-3 leading-relaxed">
                                {isHE ? p.descriptionHE : p.descriptionEN}
                              </p>
                              <div className="flex items-center gap-8 pt-4">
                                 <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/10">
                                   <Ticket size={24} className="gold-text" />
                                   <span className="text-sm md:text-xl font-black text-white">{ticketCount.toLocaleString()} {isHE ? 'תורמים משתתפים' : 'Active Participants'}</span>
                                 </div>
                                 <span className="text-4xl md:text-7xl font-black italic gold-text tracking-tighter">₪{p.value.toLocaleString()}</span>
                              </div>
                           </div>
                           <div className="flex gap-4">
                              <PrizeShareButton prize={p} isHE={isHE} campaignName={isHE ? campaign.nameHE : campaign.nameEN} className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem]" iconSize={32} />
                              {campaign.donationUrl && (
                                <a href={campaign.donationUrl} target="_blank" rel="noreferrer" className="px-12 md:px-20 h-16 md:h-24 luxury-gradient text-black font-black rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(194,163,83,0.3)] hover:scale-105 active:scale-95 transition-all text-sm md:text-xl uppercase italic tracking-tighter">
                                  {isHE ? 'להצטרפות להגרלה' : 'Claim Tokens'}
                                </a>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  }

                  // Regular Grid Prizes
                  return (
                    <PrizeCard key={p.id} prize={p} isHE={isHE} campaignName={isHE ? campaign.nameHE : campaign.nameEN} donationUrl={campaign.donationUrl} ticketCount={ticketCount} />
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedPkg(null)}></div>
          <div className="relative w-full max-w-xl glass-card rounded-[2.5rem] border overflow-hidden shadow-2xl" style={{ borderColor: `${selectedPkg.color}40` }}>
             <button onClick={() => setSelectedPkg(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all z-10"><X size={20}/></button>
             <div className="h-32 md:h-48 relative">
               <img src={selectedPkg.image || campaign.banner} className="w-full h-full object-cover opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
               <div className="absolute bottom-6 left-8 right-8">
                 <h2 className="text-2xl md:text-4xl font-black italic leading-tight" style={{ color: selectedPkg.color || '#C2A353' }}>{isHE ? selectedPkg.nameHE : selectedPkg.nameEN}</h2>
                 <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">{isHE ? 'פירוט כרטיסי הגרלה' : 'Ticket Entitlements'}</p>
               </div>
             </div>
             <div className="p-8 md:p-10 space-y-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 gap-3">
                   {selectedPkg.rules.map((rule, idx) => {
                      const prize = rule.prizeId === 'ALL' ? null : prizes.find(p => p.id === rule.prizeId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C2A353] overflow-hidden">
                                {rule.prizeId === 'ALL' ? <Layers size={20} /> : prize?.media[0]?.url ? <img src={prize.media[0].url} className="w-full h-full object-cover" /> : <Gift size={20} />}
                             </div>
                             <div>
                               <p className="text-xs md:text-sm font-black italic">{rule.prizeId === 'ALL' ? (isHE ? 'כל המתנות בקטלוג' : 'All Collection Items') : (isHE ? prize?.titleHE : prize?.titleEN)}</p>
                               <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">{isHE ? 'מסלול בחירה' : 'Selected Entitlement'}</p>
                             </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xl md:text-2xl font-black italic leading-none" style={{ color: selectedPkg.color || '#C2A353' }}>{rule.count}</p>
                              <p className="text-[7px] md:text-[8px] font-black uppercase text-gray-600 mt-1">{isHE ? 'כרטיסים' : 'Tokens'}</p>
                           </div>
                        </div>
                      )
                   })}
                </div>
                <a href={selectedPkg.joinLink} target="_blank" className="block w-full text-center py-4 rounded-2xl text-black font-black text-sm uppercase tracking-tighter shadow-xl transition-all hover:scale-[1.02] italic" style={{ backgroundColor: selectedPkg.color || '#C2A353' }}>
                   {isHE ? 'רכישת מסלול עכשיו' : 'Acquire Route Now'} — ₪{selectedPkg.minAmount.toLocaleString()}
                </a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrizeShareButton: React.FC<{ prize: Prize; isHE: boolean; campaignName: string; className?: string; iconSize?: number }> = ({ prize, isHE, campaignName, className, iconSize = 12 }) => {
  const handleSharePrize = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareData = {
      title: isHE ? prize.titleHE : prize.titleEN,
      text: isHE ? `ראו איזה פרס מדהים ב-${campaignName}: ${prize.titleHE}!` : `Check out this amazing prize in ${campaignName}: ${prize.titleEN}!`,
      url: window.location.origin + window.location.pathname,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert(isHE ? 'הקישור הועתק!' : 'Link copied!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing prize:', err);
      }
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
};

const PrizeCard: React.FC<{ prize: Prize; isHE: boolean; campaignName: string; donationUrl?: string; ticketCount: number }> = ({ prize, isHE, campaignName, donationUrl, ticketCount }) => {
  return (
    <div className="group relative rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#C2A353]/20 transition-all duration-700 animate-fade-in flex flex-col shadow-xl">
      <div className="relative h-40 md:h-64 rounded-2xl md:rounded-[2rem] overflow-hidden mb-4 md:mb-6 shadow-2xl border border-white/5">
        <img src={prize.media[0]?.url} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 to-transparent"></div>
        
        <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10 flex gap-3">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2 shadow-2xl">
              <Ticket size={12} className="gold-text" />
              <span className="text-[10px] md:text-xs font-black italic text-white">{ticketCount.toLocaleString()}</span>
          </div>
          <PrizeShareButton prize={prize} isHE={isHE} campaignName={campaignName} />
        </div>

        <div className="absolute top-3 right-3 md:top-5 md:right-5 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/5 text-white font-black text-[9px] md:text-[10px] tracking-tight">
          ₪{prize.value.toLocaleString()}
        </div>
      </div>
      <div className="px-1 md:px-3 pb-2 space-y-3 md:space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2 text-center">
          <h3 className="text-sm md:text-xl font-black tracking-tight group-hover:gold-text transition-colors duration-700 leading-tight italic line-clamp-1">{isHE ? prize.titleHE : prize.titleEN}</h3>
          <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed line-clamp-2 font-medium italic hidden md:block">{isHE ? prize.descriptionHE : prize.descriptionEN}</p>
        </div>
        <div className="pt-2 flex flex-col items-center gap-3">
          <div className="text-center">
             <p className="text-sm md:text-lg font-black italic leading-none gold-text">₪{prize.value.toLocaleString()}</p>
          </div>
          {donationUrl && (
            <a href={donationUrl} target="_blank" rel="noreferrer" className="w-full py-2.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] hover:luxury-gradient hover:text-black hover:border-transparent transition-all duration-700 text-center italic">
              {isHE ? 'פרטים והצטרפות' : 'View & Enter'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;