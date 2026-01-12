
import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Award, Globe } from 'lucide-react';

interface HomeProps { store: any; }

const HomePage: React.FC<HomeProps> = ({ store }) => {
  const { lang, clients } = store;
  const isHE = lang === Language.HE;

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12 md:pt-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C2A353]/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] gold-text animate-bounce">
          <Sparkles size={14} /> {isHE ? 'מערכת הגרלות היוקרה המובילה' : 'The Leading Luxury Raffle System'}
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
          MAZALIX <br />
          <span className="luxury-gradient bg-clip-text text-transparent">{isHE ? 'יוקרה של נתינה' : 'The Art of Giving'}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 font-medium text-sm md:text-lg italic px-4">
          {isHE 
            ? 'הפלטפורמה המקצועית בעולם לניהול מכירות סיניות והגרלות פומביות ברמת גימור יוקרתית, עם חוויית משתמש שטרם הכרתם.'
            : 'The worlds most professional platform for managing Chinese auctions and luxury raffles with a high-end finish and a unique user experience.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/admin" className="px-10 py-4 luxury-gradient text-black font-black rounded-2xl shadow-2xl hover:scale-110 transition-all uppercase italic">
            {isHE ? 'התחלת קמפיין חדש' : 'Start New Campaign'}
          </Link>
          <a href="#active" className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all uppercase italic">
            {isHE ? 'גלה קמפיינים פעילים' : 'Discover Active Auctions'}
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {[
          { icon: <ShieldCheck className="gold-text" />, title: isHE ? 'אבטחה מקסימלית' : 'Maximum Security', desc: isHE ? 'מערכת מבוזרת ומאובטחת לניהול כספים ונתוני תורמים.' : 'Secure and decentralized system for managing funds and donor data.' },
          { icon: <Award className="gold-text" />, title: isHE ? 'ממשק פרימיום' : 'Premium UI', desc: isHE ? 'עיצוב עוצר נשימה שמותאם אישית לכל קמפיין וקמפיין.' : 'Breathtaking design tailored specifically for each and every campaign.' },
          { icon: <Globe className="gold-text" />, title: isHE ? 'ניהול רב-לשוני' : 'Multi-lingual', desc: isHE ? 'תמיכה מלאה בעברית ובאנגלית בלחיצת כפתור אחת.' : 'Full support for Hebrew and English with a single click.' },
        ].map((f, i) => (
          <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4 hover:border-[#C2A353]/30 transition-all">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">{f.icon}</div>
            <h3 className="text-xl font-black italic">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Active Campaigns */}
      <section id="active" className="space-y-10 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic">{isHE ? 'קמפיינים פעילים' : 'Active Campaigns'}</h2>
          <div className="h-1 w-20 luxury-gradient mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-500 italic">{isHE ? 'אין קמפיינים ציבוריים כרגע' : 'No public campaigns currently active'}</p>
            </div>
          ) : (
            clients.map((client: any) => (
              <Link to={`/catalog/${client.id}`} key={client.id} className="group glass-card rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#C2A353]/30 transition-all flex flex-col h-full shadow-xl">
                <div className="h-48 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="w-20 opacity-20" alt="" />
                  </div>
                  <div className="absolute bottom-6 left-8 right-8">
                    <h4 className="text-2xl font-black italic gold-text leading-none">{client.displayName}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{isHE ? 'קמפיין פעיל' : 'Active Campaign'}</p>
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                   <p className="text-gray-400 text-sm italic">{isHE ? 'לחץ כאן לצפייה בקטלוג המתנות היוקרתי של הקמפיין והשתתפות בהגרלה.' : 'Click here to view the campaigns luxury gift catalog and participate in the draw.'}</p>
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">ID: {client.id}</span>
                     <div className="w-10 h-10 rounded-full luxury-gradient flex items-center justify-center text-black group-hover:scale-110 transition-all">
                       <ArrowRight size={20} />
                     </div>
                   </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
