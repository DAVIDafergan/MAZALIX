import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prize, Donor, Language, DrawStatus, Ticket } from '../types';
import { Trophy, Star, Sparkles, Share2, ArrowLeft, Users } from 'lucide-react';

interface LiveDrawProps {
  store: any;
  publicOnly?: boolean;
}

const LiveDraw: React.FC<LiveDrawProps> = ({ store, publicOnly = false }) => {
  const { prizeId } = useParams();
  const navigate = useNavigate();
  const { prizes, performDraw, lang, tickets, donors } = store;
  const isHE = lang === Language.HE;

  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Donor | null>(null);
  const [randomName, setRandomName] = useState('');
  
  // 1. זיהוי פרס חסין: בודק גם id וגם _id ומבטיח סנכרון
  const prize = useMemo(() => {
    return prizes.find((p: any) => String(p.id || p._id) === String(prizeId));
  }, [prizes, prizeId]);

  // 2. סינון כרטיסים חסין: בודק התאמה לכל סוגי המזהים האפשריים
  const prizeTickets = useMemo(() => {
    if (!prizeId) return [];
    return tickets.filter((t: any) => 
      String(t.prizeId) === String(prizeId) || 
      (prize && String(t.prizeId) === String(prize.id)) || 
      (prize && (prize as any)._id && String(t.prizeId) === String((prize as any)._id))
    );
  }, [tickets, prizeId, prize]);

  // 3. בניית "בריכת שמות" (Name Pool): כל כרטיס מייצג כניסה אחת של שם התורם
  const namePool = useMemo(() => {
    return prizeTickets.map((t: any) => {
      const donor = donors.find((d: any) => String(d.id || d._id) === String(t.donorId));
      return donor?.name || (isHE ? 'תורם' : 'Donor');
    });
  }, [prizeTickets, donors, isHE]);

  const prizeTicketsCount = prizeTickets.length;

  // Sync with winner if already drawn in DB
  useEffect(() => {
    if (prize?.status === DrawStatus.DRAWN && prize.winnerId) {
       const w = donors.find((d: any) => String(d.id || d._id) === String(prize.winnerId));
       if (w) setWinner(w);
    }
  }, [prize, donors]);

  // אפקט האנימציה של השמות הרצים
  useEffect(() => {
    let interval: any;
    if (isDrawing && namePool.length > 0) {
      interval = setInterval(() => {
        const randIndex = Math.floor(Math.random() * namePool.length);
        setRandomName(namePool[randIndex]);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isDrawing, namePool]);

  const handleStartDraw = async () => {
    if (publicOnly || isDrawing) return;
    setIsDrawing(true);
    setWinner(null);
    
    // השהיית אנימציה יוקרתית של 5 שניות
    setTimeout(async () => {
      // ביצוע ההגרלה ב-Store
      const winningDonor = await performDraw(prizeId!);
      setIsDrawing(false);
      setWinner(winningDonor);
    }, 5000);
  };

  if (!prize) return (
    <div className="p-20 text-center font-black italic text-white bg-[#020617] min-h-screen flex flex-col items-center justify-center">
      <p className="text-2xl mb-4">Prize Not Found</p>
      {!publicOnly && <button onClick={() => navigate('/admin')} className="text-[#C2A353] underline">Back to Admin</button>}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C2A353]/10 to-transparent blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-5xl space-y-10 flex flex-col items-center">
        {!publicOnly && (
          <button onClick={() => navigate('/admin')} className="absolute top-0 left-0 p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20}/>
          </button>
        )}
        
        <div className="text-center space-y-2">
          <p className="gold-text font-black uppercase tracking-[0.5em] text-xs italic">{isHE ? 'הגרלה חיה' : 'Live Draw'}</p>
          <h1 className="text-4xl md:text-7xl font-black italic luxury-gradient bg-clip-text text-transparent">MAZALIX LIVE</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full items-center">
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
               <div className="aspect-square rounded-2xl overflow-hidden relative border border-white/5">
                  <img src={prize.media?.[0]?.url || ''} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                     <h3 className="text-2xl font-black italic text-white truncate">{isHE ? prize.titleHE : prize.titleEN}</h3>
                     <p className="gold-text text-xl font-black italic">₪{prize.value?.toLocaleString() || 0}</p>
                  </div>
               </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] aspect-square flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl relative">
                {isDrawing ? (
                  <div className="space-y-6">
                    <Sparkles size={40} className="gold-text animate-spin mx-auto" />
                    <p className="text-4xl font-black italic text-white/50 animate-pulse">{randomName}</p>
                  </div>
                ) : winner ? (
                  <div className="space-y-6 animate-fade-in">
                    <Trophy size={80} className="gold-text mx-auto animate-bounce" />
                    <div className="space-y-2">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">{isHE ? 'הזוכה הוא' : 'THE WINNER IS'}</p>
                        <h2 className="text-4xl md:text-6xl font-black italic luxury-gradient bg-clip-text text-transparent drop-shadow-2xl">{winner.name}</h2>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest">{isHE ? 'ברכות לזוכה המאושר!' : 'Congratulations!'}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                       <p className="text-gray-500 font-black uppercase text-xs tracking-widest">{isHE ? 'כרטיסים בהגרלה' : 'Total Entries'}</p>
                       <p className="text-6xl font-black gold-text italic">{prizeTicketsCount}</p>
                    </div>
                    {publicOnly ? (
                      <div className="space-y-4">
                        <p className="text-gray-400 font-bold italic animate-pulse">{isHE ? 'ממתין למנהל המערכת...' : 'Waiting for Admin...'}</p>
                        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-600 font-black uppercase">
                          <Users size={12} /> {isHE ? 'ההגרלה תתבצע בשידור חי' : 'Drawing live soon'}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleStartDraw} 
                        disabled={prizeTicketsCount === 0}
                        className="px-12 py-5 luxury-gradient text-black text-xl font-black rounded-2xl shadow-[0_20px_50px_rgba(194,163,83,0.3)] hover:scale-110 active:scale-95 transition-all uppercase italic disabled:opacity-50 disabled:grayscale"
                      >
                        {isHE ? 'הפעל הגרלה' : 'Start Draw'}
                      </button>
                    )}
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDraw;