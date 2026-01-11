
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prize, Donor, Language, DrawStatus } from '../types';
import { Trophy, Star, Sparkles, Award, Share2, ArrowLeft } from 'lucide-react';

interface LiveDrawProps {
  store: any;
  publicOnly?: boolean;
}

const LiveDraw: React.FC<LiveDrawProps> = ({ store, publicOnly = false }) => {
  const { prizeId } = useParams();
  const navigate = useNavigate();
  const { prizes, performDraw, lang, tickets, donors, auth } = store;
  const isHE = lang === Language.HE;

  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Donor | null>(null);
  const [randomName, setRandomName] = useState('');
  const [showPrizeInfo, setShowPrizeInfo] = useState(true);
  
  const prize = prizes.find((p: Prize) => p.id === prizeId);
  const prizeTickets = tickets.filter((t: any) => t.prizeId === prizeId);

  useEffect(() => {
    let interval: any;
    if (isDrawing) {
      interval = setInterval(() => {
        const names = donors.length > 0 ? donors : [{ name: 'Searching...' }];
        const randIndex = Math.floor(Math.random() * names.length);
        setRandomName(names[randIndex]?.name || '...');
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isDrawing, donors]);

  const handleStartDraw = () => {
    if (publicOnly) return;
    setIsDrawing(true);
    setWinner(null);
    setShowPrizeInfo(false);
    
    setTimeout(() => {
      const winningDonor = performDraw(prizeId!);
      setIsDrawing(false);
      setWinner(winningDonor);
    }, 5000);
  };

  const copyLiveLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert(isHE ? 'הלינק הועתק!' : 'Link copied!');
  };

  if (!prize) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 font-black italic">
       {isHE ? 'הפרס לא נמצא...' : 'Prize not found...'}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-10 blur-[100px] animate-pulse">
          <div className="w-full h-full bg-gradient-to-tr from-[#C2A353] via-blue-900 to-[#C2A353]"></div>
        </div>
        <div className="absolute inset-0 overflow-hidden opacity-5">
           <div className="grid grid-cols-6 gap-4 transform -rotate-12 scale-150">
             {Array.from({ length: 48 }).map((_, i) => (
               <div key={i} className="aspect-square border border-white/10 rounded-full"></div>
             ))}
           </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-10 animate-fade-in flex flex-col items-center">
        {!publicOnly && (
            <div className="absolute top-0 left-0">
               <button onClick={() => navigate('/admin')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-all"><ArrowLeft size={20}/></button>
            </div>
        )}
        <div className="absolute top-0 right-0">
           <button onClick={copyLiveLink} className="p-3 bg-[#C2A353]/10 rounded-full hover:bg-[#C2A353]/20 text-[#C2A353] transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><Share2 size={16}/> {isHE ? 'שתף לינק לצפייה' : 'Share Live Link'}</button>
        </div>

        <div className="text-center space-y-3">
          <p className="text-[#C2A353] font-black uppercase tracking-[0.5em] text-[10px] md:text-xs italic">{isHE ? 'אירוע הגרלה חי' : 'Live Draw Event'}</p>
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter luxury-gradient bg-clip-text text-transparent leading-none">MAZALIX LIVE</h1>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Prize Media Section */}
            <div className={`transition-all duration-1000 transform ${showPrizeInfo ? 'opacity-100 translate-x-0' : 'opacity-30 scale-90 blur-sm'}`}>
                <div className="glass-card p-4 rounded-[2.5rem] border-2 gold-border shadow-2xl relative">
                   <div className="aspect-[4/5] rounded-3xl overflow-hidden relative shadow-inner">
                      <img src={prize.media[0]?.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-8 right-8 space-y-2">
                         <div className="px-3 py-1 bg-[#C2A353] text-black rounded-full inline-block text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg">Premium Item</div>
                         <h3 className="text-2xl md:text-4xl font-black italic text-white leading-tight">{isHE ? prize.titleHE : prize.titleEN}</h3>
                         <p className="text-[#C2A353] text-xl md:text-2xl font-black italic">₪{prize.value.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
            </div>

            {/* Drawing Section */}
            <div className="flex flex-col items-center justify-center space-y-8">
                <div className="glass-card p-10 md:p-14 rounded-[3rem] w-full aspect-square flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(194,163,83,0.15)] border border-white/10 relative overflow-hidden group">
                   
                   {/* Decorative Shine */}
                   <div className="absolute inset-0 bg-gradient-to-br from-[#C2A353]/5 via-transparent to-transparent pointer-events-none"></div>

                   {!isDrawing && !winner && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="space-y-2">
                           <p className="text-gray-500 font-black uppercase tracking-widest text-xs">{isHE ? 'סה״כ כרטיסים להגרלה' : 'Total Participating Tokens'}</p>
                           <p className="text-6xl md:text-8xl font-black italic gold-text">{prizeTickets.length}</p>
                        </div>
                        {publicOnly ? (
                            <p className="text-gray-400 font-bold italic text-sm">{isHE ? 'ממתינים להפעלת ההגרלה ע״י המנהל...' : 'Waiting for Admin to trigger the draw...'}</p>
                        ) : (
                            <button 
                                onClick={handleStartDraw}
                                className="px-12 py-5 luxury-gradient text-black text-xl font-black rounded-2xl shadow-[0_15px_30px_rgba(194,163,83,0.3)] hover:scale-110 active:scale-95 transition-all uppercase italic"
                            >
                                {isHE ? 'הפעל הגרלה עכשיו' : 'Launch Draw Now'}
                            </button>
                        )}
                      </div>
                   )}

                   {isDrawing && (
                      <div className="space-y-10 py-8 relative">
                        <div className="flex justify-center gap-4 mb-8">
                           <Sparkles size={40} className="gold-text animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">{isHE ? 'מגריל זוכה...' : 'Spinning Destiny...'}</p>
                           <div className="text-4xl md:text-6xl font-black italic text-white/40 blur-[1px] animate-pulse">
                              {randomName}
                           </div>
                        </div>
                        <div className="flex justify-center gap-3">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="w-2 h-2 rounded-full bg-[#C2A353] animate-bounce shadow-lg" style={{ animationDelay: `${i*0.15}s` }}></div>
                           ))}
                        </div>
                      </div>
                   )}

                   {winner && !isDrawing && (
                      <div className="space-y-10 animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
                        <div className="relative group">
                           <div className="absolute inset-0 bg-[#C2A353]/40 blur-[50px] rounded-full group-hover:blur-[70px] transition-all"></div>
                           <Trophy size={100} className="gold-text relative animate-bounce" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-gray-500 font-black uppercase tracking-widest text-xs">{isHE ? 'הזוכה המאושר/ת' : 'THE LUCKY WINNER IS'}</p>
                           <h2 className="text-5xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] leading-tight p-2">
                              {winner.name}
                           </h2>
                        </div>
                        <div className="flex gap-2">
                           {[1,2,3].map(i => <Star key={i} size={16} className="gold-text fill-gold" />)}
                        </div>
                      </div>
                   )}
                </div>

                <div className="flex items-center gap-6 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-8 py-3 rounded-full border border-white/5">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div> Live</div>
                   <div className="h-4 w-px bg-white/10"></div>
                   <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   <div className="h-4 w-px bg-white/10"></div>
                   <div className="gold-text">Certified Draw</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDraw;
