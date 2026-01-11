import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { Sparkles, ShieldCheck, Gift, ArrowRight, Layout, Share2, Calendar, LogIn, Award, Zap, Inbox, Star } from 'lucide-react';

interface HomeProps { store: any; }

const Home: React.FC<HomeProps> = ({ store }) => {
  const { clients = [], lang, campaign, auth } = store;
  const navigate = useNavigate();
  const isHE = lang === Language.HE;

  return (
    <div className="min-h-screen space-y-24 pb-20 animate-fade-in overflow-hidden">
      
      {/* Hero Section - Luxury Intro */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C2A353]/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 space-y-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[#C2A353] animate-bounce shadow-2xl">
            <Sparkles size={16} /> {isHE ? 'ברוכים הבאים ל-Mazalix' : 'Welcome to Mazalix'}
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black italic luxury-gradient bg-clip-text text-transparent leading-none tracking-tighter drop-shadow-2xl py-2">
            Mazalix
          </h1>
          
          <p className="text-gray-400 text-sm md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed italic opacity-90">
            {isHE ? 'המערכת המובילה בעולם לניהול הגרלות וקמפיינים יוקרתיים. אנחנו הופכים כל תרומה לחוויה דיגיטלית עוצרת נשימה.' 
                 : 'The leading platform for luxury auctions and campaigns. We turn every donation into a breathtaking digital experience.'}
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-10">
            <button onClick={() => navigate('/admin')} className="px-16 py-6 luxury-gradient text-black font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-110 active:scale-95 transition-all shadow-xl">
               <LogIn size={20} /> {isHE ? 'כניסת מנהלים' : 'Manager Login'}
            </button>
            <a href="#campaigns" className="px-16 py-6 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
               {isHE ? 'צפייה בקמפיינים' : 'Explore Auctions'} <ArrowRight size={18} className={isHE ? 'rotate-180' : ''} />
            </a>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { icon: <Award className="gold-text" size={40} />, title: isHE ? 'מיתוג פרימיום' : 'Premium Branding', desc: isHE ? 'כל קמפיין מקבל דף נחיתה מעוצב אישית ברמה הגבוהה ביותר בשוק.' : 'Each campaign gets a high-end, custom-designed landing page.' },
          { icon: <Zap className="gold-text" size={40} />, title: isHE ? 'ניהול חכם' : 'Smart Admin', desc: isHE ? 'ניהול מלא של תורמים, פרסים וכרטיסים בממשק מהיר ואינטואיטיבי.' : 'Complete donor, prize, and ticket management in a fast interface.' },
          { icon: <ShieldCheck className="gold-text" size={40} />, title: isHE ? 'הגרלות בשידור חי' : 'Live Draws', desc: isHE ? 'מערכת מובנית להגרלות שקופות בזמן אמת עם תצוגה מרהיבה לקהל.' : 'Built-in real-time transparent draws with spectacular public display.' },
        ].map((f, i) => (
          <div key={i} className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-6 hover:border-[#C2A353]/40 transition-all duration-700 group shadow-2xl">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5">{f.icon}</div>
            <h3 className="text-2xl font-black italic gold-text">{f.title}</h3>
            <p className="text-gray-500 text-base leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Active Campaigns List */}
      <section id="campaigns" className="max-w-7xl mx-auto px-4 space-y-16 pt-20">
        <div className="text-center space-y-4">
          <h2 className="text-5xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent leading-none">{isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}</h2>
          <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.6em]">{isHE ? 'בחר מוסד והיה שותף להצלחה' : 'Choose an institution and join the success'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {clients && clients.length > 0 ? clients.map((client: any) => (
            <div key={client.id} className="group glass-card rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/50 transition-all duration-500 shadow-2xl flex flex-col relative">
              <div className="relative h-64 overflow-hidden bg-black">
                {client.campaign?.banner ? (
                  <img src={client.campaign.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] opacity-60" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10"><Layout size={100} className="gold-text" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                
                <div className="absolute -bottom-8 left-10 w-24 h-24 bg-black rounded-[2rem] border-2 border-white/10 shadow-2xl flex items-center justify-center p-3 overflow-hidden z-20">
                   {client.campaign?.logo ? <img src={client.campaign.logo} className="w-full h-full object-contain" alt="Logo" /> : <Star className="gold-text" size={40} />}
                </div>
              </div>
              
              <div className="p-12 pt-16 space-y-8 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black italic gold-text tracking-tighter leading-none truncate">{client.campaign?.nameHE || client.displayName || client.name}</h3>
                  <div className="flex items-center gap-3 text-gray-500 text-[11px] font-black uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5 shadow-xl">
                    <Calendar size={14} className="gold-text" />
                    {isHE ? 'תאריך הגרלה:' : 'Draw Date:'} {client.campaign?.drawDate || 'TBD'}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => navigate(`/catalog/${client.id}`)} className="flex-1 py-6 luxury-gradient text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-xl italic">
                    <Layout size={20} /> {isHE ? 'כניסה לקטלוג' : 'View Catalog'}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-40 text-center glass-card rounded-[4rem] border border-white/5 shadow-inner">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"><Inbox size={40} className="text-gray-800" /></div>
                <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-sm">{isHE ? 'ממתין לקמפיינים פעילים' : 'Waiting for active campaigns'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="glass-card p-20 rounded-[5rem] border border-white/10 text-center space-y-10 relative overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.4)]">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#C2A353]/10 blur-[120px] rounded-full"></div>
            <h2 className="text-4xl md:text-7xl font-black italic leading-tight tracking-tighter">{isHE ? 'רוצים להזניק קמפיין יוקרה משלכם?' : 'Start Your Own Premium Auction'}</h2>
            <button onClick={() => navigate('/admin')} className="px-20 py-8 luxury-gradient text-black font-black rounded-[2.5rem] text-sm md:text-2xl uppercase italic tracking-tighter shadow-2xl hover:scale-110 active:scale-95 transition-all">
                {isHE ? 'צרו חשבון מנהל עכשיו' : 'Create Admin Account Now'}
            </button>
        </div>
      </section>
    </div>
  );
};

export default Home;