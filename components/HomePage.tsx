import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Globe, 
  BarChart3, 
  LayoutDashboard, 
  Zap, 
  Phone, 
  Mail, 
  MessageSquare,
  ChevronRight,
  PlayCircle,
  Star
} from 'lucide-react';

interface HomeProps { store: any; }

const HomePage: React.FC<HomeProps> = ({ store }) => {
  const { lang } = store;
  const isHE = lang === Language.HE;

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // נתוני דמו לקטלוג המרחף
  const previewPrizes = [
    { name: isHE ? 'רכב חשמלי פרימיום' : 'Luxury EV', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400' },
    { name: isHE ? 'חופשת חלומיות ב-VIP' : 'Dream Vacation', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
    { name: isHE ? 'שעון רולקס מהדורה מוגבלת' : 'Rolex Limited', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400' },
    { name: isHE ? 'מחשב נייד מקבוק פרו' : 'MacBook Pro 16', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400' },
    { name: isHE ? 'מערכת קולנוע ביתית' : 'Home Theater System', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="space-y-32 pb-20 animate-fade-in overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="text-center space-y-12 pt-16 md:pt-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C2A353]/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-[#C2A353]/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] gold-text animate-fade-in shadow-2xl">
          <Sparkles size={14} className="animate-spin-slow" /> {isHE ? 'הדור הבא של עולם הגיוס' : 'The Evolution of Fundraising'}
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl md:text-[10rem] font-black italic tracking-tighter leading-[0.8] select-none">
            MAZALIX <br />
            <span className="luxury-gradient bg-clip-text text-transparent px-4 font-serif">
              {isHE ? 'יוקרה של נתינה' : 'Art of Giving'}
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-500 font-medium text-base md:text-xl italic px-6 leading-relaxed tracking-wide">
            {isHE 
              ? 'אנחנו לא בונים קמפיינים, אנחנו בונים אימפריות. מערכת הניהול והקטלוג המתקדמת ביותר למוסדות ועמותות שדורשים את הטופ.'
              : 'We don’t just build campaigns, we build empires. The most advanced management system for institutions that demand the absolute top.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-4">
          <button 
            onClick={scrollToContact}
            className="group relative px-14 py-6 luxury-gradient text-black font-black rounded-2xl shadow-[0_20px_60px_rgba(194,163,83,0.3)] hover:scale-105 transition-all uppercase italic flex items-center gap-3 text-lg"
          >
            {isHE ? 'התחלת קמפיין חדש' : 'Start New Campaign'}
            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <Link to="/admin" className="text-white font-black uppercase text-xs tracking-[0.3em] transition-all hover:gold-text flex items-center gap-2">
            <LayoutDashboard size={14} /> {isHE ? 'כניסת מנהלים' : 'Admin Login'}
          </Link>
        </div>
      </section>

      {/* --- AUTO-SCROLLING CATALOG PREVIEW --- */}
      <section className="relative py-10 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xs font-black gold-text uppercase tracking-[0.4em] italic">{isHE ? 'תצוגה מקדימה של הקטלוג' : 'Catalog Preview'}</h2>
        </div>
        
        <div className="flex overflow-hidden group select-none">
          <div className="flex gap-6 animate-marquee whitespace-nowrap py-4 group-hover:pause">
            {[...previewPrizes, ...previewPrizes].map((prize, i) => (
              <div key={i} className="w-64 md:w-80 glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative shrink-0">
                <div className="h-48 md:h-60 relative">
                  <img src={prize.img} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <p className="text-white font-black italic text-sm md:text-lg leading-tight truncate">{prize.name}</p>
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={8} className="gold-text fill-current" />)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          .pause {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: <Zap className="gold-text" size={32} />, 
            title: isHE ? 'ביצועים בשיא' : 'Peak Performance', 
            desc: isHE ? 'טכנולוגיית ענן מהירה המבטיחה חוויית גלישה חלקה גם בעומסי תנועה אדירים של אלפי תורמים בו זמנית.' : 'Fast cloud technology ensuring smooth browsing even under heavy traffic of thousands of donors.' 
          },
          { 
            icon: <Award className="gold-text" size={32} />, 
            title: isHE ? 'מיתוג יוקרה' : 'Luxury Branding', 
            desc: isHE ? 'אנחנו מעניקים לקמפיין שלכם פלטפורמה שנראית ומרגישה כמו מותג על, מה שמעלה משמעותית את ממוצע התרומה.' : 'We provide a platform that feels like a high-end brand, significantly increasing the average donation size.' 
          },
          { 
            icon: <ShieldCheck className="gold-text" size={32} />, 
            title: isHE ? 'אבטחה ופרטיות' : 'Secure & Private', 
            desc: isHE ? 'ניהול נתוני תורמים תחת פרוטוקולי אבטחה מחמירים, עם גיבוי מלא וסנכרון נתונים בזמן אמת.' : 'Managing donor data under strict security protocols with full backup and real-time synchronization.' 
          },
        ].map((f, i) => (
          <div key={i} className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-6 group hover:border-[#C2A353]/30 transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#C2A353]/10 transition-all duration-500 shadow-inner">{f.icon}</div>
            <h3 className="text-2xl font-black italic tracking-tighter">{f.title}</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed italic font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* --- CONTACT & CTA SECTION --- */}
      <section id="contact" className="px-6 max-w-5xl mx-auto scroll-mt-20">
        <div className="glass-card p-10 md:p-24 rounded-[5rem] border-2 border-[#C2A353]/20 relative overflow-hidden text-center space-y-16 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 luxury-gradient opacity-50"></div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
              {isHE ? 'בואו נבנה את זה יחד' : 'Let’s Build Success'}
            </h2>
            <p className="text-gray-400 font-medium italic max-w-2xl mx-auto text-lg">
              {isHE 
                ? 'המערכת מוכנה. הצוות שלנו מחכה להפוך את החזון שלכם למציאות. צרו קשר בדרך הנוחה לכם.' 
                : 'The system is ready. Our team is waiting to turn your vision into reality. Contact us anyway you like.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <a href="tel:0556674329" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-[#C2A353] hover:bg-white/10 transition-all group shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#C2A353]/10 flex items-center justify-center text-[#C2A353] group-hover:scale-110 transition-transform">
                <Phone size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'חייג עכשיו' : 'Call Now'}</p>
                <span className="font-black text-lg tracking-widest">055-667-4329</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/message/WZKLTKH4KELMD1" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-green-500/50 hover:bg-white/10 transition-all group shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <MessageSquare size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'זמינות מיידית' : 'Instant Chat'}</p>
                <span className="font-black text-lg uppercase italic">{isHE ? 'שלח וואטסאפ' : 'WhatsApp'}</span>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:DA@101.ORG.IL" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-blue-400/50 hover:bg-white/10 transition-all group shadow-xl overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <div className="space-y-1 w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'דואר אלקטרוני' : 'Email Us'}</p>
                <span className="font-black text-xs md:text-sm tracking-tight truncate block">DA@101.ORG.IL</span>
              </div>
            </a>
          </div>

          <div className="pt-10 flex justify-center items-center gap-10 opacity-30 grayscale pointer-events-none">
            <ShieldCheck size={32} />
            <Award size={32} />
            <Globe size={32} />
            <Zap size={32} />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-center space-y-4 pb-12 opacity-50">
        <div className="h-px w-20 bg-[#C2A353] mx-auto opacity-30"></div>
        <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.6em]">
          © 2026 MAZALIX LUXURY SYSTEMS • DEVELOPED BY DA
        </p>
      </footer>
    </div>
  );
};

export default HomePage;