import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { Sparkles, ShieldCheck, Gift, ArrowLeft, ArrowRight, Layout, Share2, Calendar, User, LogIn } from 'lucide-react';

interface HomeProps { store: any; }

const Home: React.FC<HomeProps> = ({ store }) => {
  const { clients, lang, campaign, auth } = store;
  const navigate = useNavigate();
  const isHE = lang === Language.HE;

  return (
    <div className="min-h-screen space-y-20 pb-20 animate-fade-in overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C2A353] rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#C2A353] animate-bounce">
            <Sparkles size={14} /> {isHE ? 'ברוכים הבאים ל-Mazalix' : 'Welcome to Mazalix'}
          </div>
          
          <h1 className="text-5xl md:text-9xl font-black italic luxury-gradient bg-clip-text text-transparent leading-tight tracking-tighter reveal-text">
            {isHE ? 'מהפכה של יוקרה ונתינה' : 'Luxury Giving Reimagined'}
          </h1>
          
          <p className="text-gray-400 text-sm md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
            {isHE ? 'המערכת המתקדמת בעולם לניהול הגרלות סינית. חוויה דיגיטלית עוצרת נשימה, שקופה ומעוררת השראה עבור המוסד והתורם כאחד.' 
                 : 'The world’s most advanced Chinese auction system. A breathtaking, transparent, and inspiring digital experience for organizations and donors alike.'}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
            <button onClick={() => navigate('/admin')} className="px-12 py-5 luxury-gradient text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(194,163,83,0.3)]">
               <LogIn size={18} /> {isHE ? 'כניסת מנהלים' : 'Manager Login'}
            </button>
            <a href="#campaigns" className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
               {isHE ? 'לצפייה בקמפיינים' : 'Explore Campaigns'}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck className="gold-text" size={32} />, title: isHE ? 'שקיפות מלאה' : 'Full Transparency', desc: isHE ? 'הגרלות חיות בזמן אמת עם אלגוריתם בחירה אקראי שקוף.' : 'Live draws with a transparent random selection algorithm.' },
          { icon: <Layout className="gold-text" size={32} />, title: isHE ? 'חוויית פרימיום' : 'Premium UI', desc: isHE ? 'עיצוב יוקרתי מותאם אישית לכל מוסד עם ממשק משתמש מושלם.' : 'Luxury design tailored to each institution with perfect UX.' },
          { icon: <Gift className="gold-text" size={32} />, title: isHE ? 'ניהול קטלוג' : 'Collection Management', desc: isHE ? 'ניהול חכם של פרסים, מסלולים ותורמים בלחיצת כפתור.' : 'Smart management of prizes, routes, and donors at a click.' },
        ].map((f, i) => (
          <div key={i} className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4 hover:border-[#C2A353]/30 transition-all group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">{f.icon}</div>
            <h3 className="text-xl font-black italic">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Active Campaigns Section */}
      <section id="campaigns" className="max-w-7xl mx-auto px-4 space-y-12 pt-20">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-7xl font-black italic gold-text leading-none">{isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}</h2>
          <p className="text-gray-500 text-xs uppercase tracking-[0.5em]">{isHE ? 'הצטרפו להצלחה של המוסדות המובילים' : 'Join the success of leading organizations'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
          {clients.map((client: any) => (
            <div key={client.id} className="group glass-card rounded-[3rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/40 transition-all duration-500 shadow-2xl flex flex-col">
              <div className="relative h-56 overflow-hidden bg-black/40">
                {client.campaign?.banner ? (
                  <img src={client.campaign.banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] opacity-50" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10"><Layout size={80} className="gold-text" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                <div className="absolute top-8 left-8 w-16 h-16 bg-black rounded-[1.5rem] border border-white/10 shadow-2xl flex items-center justify-center p-2 overflow-hidden">
                   {client.campaign?.logo ? <img src={client.campaign.logo} className="w-full h-full object-contain" /> : <Star className="gold-text" size={30} />}
                </div>
              </div>
              
              <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-black italic gold-text mb-3 leading-none">{client.campaign?.nameHE || client.name}</h3>
                  <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-full">
                    <Calendar size={12} className="gold-text" />
                    {isHE ? 'הגרלה בתאריך:' : 'Draw Date:'} {client.campaign?.drawDate || 'TBD'}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => navigate(`/catalog/${client.id}`)} className="flex-1 py-5 luxury-gradient text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl">
                    <Layout size={18} /> {isHE ? 'לצפייה בקטלוג' : 'View Catalog'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="glass-card p-16 rounded-[4rem] border border-white/10 text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C2A353]/10 blur-[100px]"></div>
            <h2 className="text-3xl md:text-6xl font-black italic leading-tight">{isHE ? 'מוכנים להזניק את הקמפיין שלכם?' : 'Ready to launch your campaign?'}</h2>
            <button onClick={() => navigate('/admin')} className="px-16 py-6 luxury-gradient text-black font-black rounded-3xl text-sm md:text-xl uppercase italic tracking-tighter shadow-2xl hover:scale-105 active:scale-95 transition-all">
                {isHE ? 'צור חשבון מנהל עכשיו' : 'Create Admin Account'}
            </button>
        </div>
      </section>
    </div>
  );
};

export default Home;