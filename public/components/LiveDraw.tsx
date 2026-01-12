
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prize, Donor, Language, DrawStatus } from '../types';
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
  
  const prize = prizes.find((p: Prize) => p.id === prizeId);
  const prizeTickets = tickets.filter((t: any) => t.prizeId === prizeId);
  const participantIds = Array.from(new Set(prizeTickets.map((t: any) => t.donorId)));
  const participants = donors.filter((d: Donor) => participantIds.includes(d.id));

  // Sync with winner if already drawn
  useEffect(() => {
    if (prize?.status === DrawStatus.DRAWN && prize.winnerId) {
       const w = donors.find((d: Donor) => d.id === prize.winnerId);
       if (w) setWinner(w);
    }
  }, [prize, donors]);

  useEffect(() => {
    let interval: any;
    if (isDrawing) {
      interval = setInterval(() => {
        const randIndex = Math.floor(Math.random() * participants.length);
        setRandomName(participants[randIndex]?.name || '...');
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isDrawing, participants]);

  const handleStartDraw = () => {
    if (publicOnly || isDrawing) return;
    setIsDrawing(true);
    setWinner(null);
    setTimeout(() => {
      const winningDonor = performDraw(prizeId!);
      setIsDrawing(false);
      setWinner(winningDonor);
    }, 5000);
  };

  if (!prize) return <div className="p-20 text-center font-black italic">Prize Not Found</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C2A353]/10 to-transparent blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-5xl space-y-10 flex flex-col items-center">
        {!publicOnly && <button onClick={() => navigate('/admin')} className="absolute top-0 left-0 p-3 bg-white/5 rounded-full"><ArrowLeft size={20}/></button>}
        
        <div className="text-center space-y-2">
          <p className="gold-text font-black uppercase tracking-[0.5em] text-xs italic">{isHE ? 'הגרלה חיה' : 'Live Draw'}</p>
          <h1 className="text-4xl md:text-7xl font-black italic luxury-gradient bg-clip-text text-transparent">MAZALIX LIVE</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full items-center">
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/10">
               <div className="aspect-square rounded-2xl overflow-hidden relative">
                  <img src={prize.media[0]?.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6">
                     <h3 className="text-2xl font-black italic text-white">{isHE ? prize.titleHE : prize.titleEN}</h3>
                     <p className="gold-text text-xl font-black italic">₪{prize.value.toLocaleString()}</p>
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
                    <h2 className="text-4xl md:text-6xl font-black italic luxury-gradient bg-clip-text text-transparent">{winner.name}</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest">{isHE ? 'הזוכה המאושר!' : 'The Lucky Winner!'}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                       <p className="text-gray-500 font-black uppercase text-xs tracking-widest">{isHE ? 'משתתפים' : 'Entries'}</p>
                       <p className="text-6xl font-black gold-text italic">{prizeTickets.length}</p>
                    </div>
                    {publicOnly ? (
                      <p className="text-gray-400 font-bold italic animate-pulse">Waiting for Admin...</p>
                    ) : (
                      <button onClick={handleStartDraw} className="px-12 py-5 luxury-gradient text-black text-xl font-black rounded-2xl shadow-xl uppercase italic">Start Draw</button>
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
