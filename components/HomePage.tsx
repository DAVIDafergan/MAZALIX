import React, { useEffect, useState } from 'react';
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
  Menu,
  ArrowDownCircle
} from 'lucide-react';

interface HomeProps { store: any; }

const HomePage: React.FC<HomeProps> = ({ store }) => {
  const { lang } = store;
  const isHE = lang === Language.HE;
  const [scrolled, setScrolled] = useState(false);

  // מעקב אחרי גלילה לטובת עיצוב ההדר
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#C2A353]/30 selection:text-white">
      
      {/* --- MODERN FLOATING HEADER --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${scrolled ? 'mt-0' : 'mt-4'}`}>
        <div className={`max-w-7xl mx-auto backdrop-blur-xl border transition-all duration-500 rounded-[2rem] px-8 py-3 flex items-center justify-between ${scrolled ? 'bg-black/40 border-white/10 shadow-2xl' : 'bg-transparent border-transparent'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 luxury-gradient rounded-lg rotate-12 flex items-center justify-center text-black shadow-lg">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-black italic tracking-tighter">MAZALIX</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <button onClick={scrollToContact} className="hover:text-white transition-colors">{isHE ? 'צור קשר' : 'Contact'}</button>
            <Link to="/admin" className="hover:text-white transition-colors">{isHE ? 'ניהול' : 'Admin'}</Link>
          </div>

          <button 
            onClick={scrollToContact}
            className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-full hover:bg-[#C2A353] hover:text-white transition-all shadow-lg active:scale-95"
          >
            {isHE ? 'קמפיין חדש' : 'New Campaign'}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION WITH INTERACTIVE ANIMATION --- */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center">
        
        {/* Animated Background Rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C2A353]/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[2px] bg-gradient-to-r from-transparent via-[#C2A353]/20 to-transparent rotate-45 animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[2px] bg-gradient-to-r from-transparent via-[#C2A353]/20 to-transparent -rotate-45 animate-spin-slow"></div>
        </div>

        {/* Eye-Catching Movement Animation: The Floating Fortune Card */}
        <div className="relative mb-12 group cursor-pointer perspective-1000">
          <div className="w-48 h-64 md:w-56 md:h-72 rounded-[2rem] luxury-gradient p-[2px] animate-float shadow-[0_0_50px_rgba(194,163,83,0.2)] group-hover:shadow-[0_0_80px_rgba(194,163,83,0.4)] transition-all duration-700">
            <div className="w-full h-full bg-[#020617] rounded-[1.9rem] flex flex-col items-center justify-center p-6 space-y-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
               <Sparkles className="gold-text animate-pulse" size={48} />
               <div className="space-y-1">
                 <div className="h-1 w-12 luxury-gradient mx-auto rounded-full"></div>
                 <p className="text-[10px] font-black tracking-[0.3em] gold-text uppercase">Exclusive Entry</p>
               </div>
               <div className="pt-4 flex flex-col gap-2 w-full">
                  <div className="h-2 w-full bg-white/5 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
               </div>
            </div>
          </div>
          {/* Particles around the card */}
          <div className="absolute -top-4 -left-4 w-4 h-4 bg-[#C2A353] rounded-full blur-md animate-ping"></div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#C2A353]/50 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] gold-text shadow-2xl">
            <Star size={12} className="animate-spin-slow" /> {isHE ? 'הסטנדרט החדש של עולם ההגרלות' : 'The New Standard of Raffles'}
          </div>

          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-[0.8] select-none">
            MAZALIX <br />
            <span className="luxury-gradient bg-clip-text text-transparent px-4 font-serif">
              {isHE ? 'יוקרה של נתינה' : 'Luxury Tech'}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-500 font-medium text-base md:text-xl italic px-6 leading-relaxed tracking-wide">
            {isHE 
              ? 'הפלטפורמה המתקדמת ביותר למנהלי קמפיינים, עמותות ומוסדות שדורשים שלמות בכל פרט. קטלוג יוקרתי, ניהול חכם והגרלות לייב בלתי נשכחות.'
              : 'The world’s most elite platform for institutions and non-profits. Seamless management, high-end catalogs, and cinematic live drawings.'}
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-8">
            <button 
              onClick={scrollToContact}
              className="group relative px-16 py-6 luxury-gradient text-black font-black rounded-[2rem] shadow-[0_20px_60px_rgba(194,163,83,0.3)] hover:scale-105 active:scale-95 transition-all uppercase italic flex items-center gap-3 text-lg"
            >
              {isHE ? 'התחלת קמפיין חדש' : 'Start New Campaign'}
              <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
            >
              <ArrowDownCircle size={18} className="animate-bounce" /> {isHE ? 'גלה עוד' : 'Discover More'}
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 py-20">
        {[
          { 
            icon: <LayoutDashboard className="gold-text" size={32} />, 
            title: isHE ? 'ממשק מנהלים חכם' : 'Smart Admin UI', 
            desc: isHE ? 'שליטה מלאה על תורמים, מסלולים ופרסים בדאשבורד מעוצב שמנתח נתונים בזמן אמת ומייצר תיאורי AI למתנות.' : 'Complete control over donors and prizes with a designer dashboard that features AI-generated descriptions.' 
          },
          { 
            icon: <PlayCircle className="gold-text" size={32} />, 
            title: isHE ? 'חוויית הגרלה בלייב' : 'Live Draw Experience', 
            desc: isHE ? 'מערכת הגרלה קולנועית שנועדה למסכי ענק ולשידורים חיים, עם אנימציות יוקרה שיוצרות מתח וריגוש אצל התורמים.' : 'A cinematic drawing engine built for large screens and live streams, creating peak excitement for your audience.' 
          },
          { 
            icon: <ShieldCheck className="gold-text" size={32} />, 
            title: isHE ? 'ביטחון ויוקרה' : 'Security & Prestige', 
            desc: isHE ? 'פרוטוקולי אבטחה מחמירים לצד חוויית משתמש של מותג על, המעניקים ביטחון מלא לתורמים ומעלים את ממוצע התרומה.' : 'Strict security protocols alongside a top-tier brand experience that builds trust and increases average donations.' 
          },
        ].map((f, i) => (
          <div key={i} className="glass-card p-12 rounded-[4rem] border border-white/5 space-y-6 group hover:bg-white/[0.03] transition-all duration-700">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">{f.icon}</div>
            <h3 className="text-2xl font-black italic tracking-tighter leading-tight">{f.title}</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed italic font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* --- CONTACT & CTA SECTION --- */}
      <section id="contact" className="px-6 max-w-5xl mx-auto py-20 scroll-mt-32">
        <div className="glass-card p-12 md:p-24 rounded-[5rem] border-2 border-[#C2A353]/20 relative overflow-hidden text-center space-y-16 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 luxury-gradient opacity-30"></div>
          
          <div className="space-y-6">
            <div className="w-20 h-1 luxury-gradient mx-auto rounded-full"></div>
            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none font-serif">
              {isHE ? 'מוכנים להצלחה?' : 'Ready to Win?'}
            </h2>
            <p className="text-gray-400 font-medium italic max-w-2xl mx-auto text-xl">
              {isHE 
                ? 'אנחנו כאן כדי לבנות עבורכם את הקמפיין המושלם. צרו קשר בדרך הנוחה לכם והצוות המקצועי שלנו ידאג לכל השאר.' 
                : 'We are here to craft your perfect campaign. Reach out in your preferred way and let us handle the rest.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <a href="tel:0556674329" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3.5rem] border border-white/5 hover:border-[#C2A353] hover:bg-white/10 transition-all group shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#C2A353]/10 flex items-center justify-center text-[#C2A353] group-hover:scale-110 group-hover:rotate-12 transition-all">
                <Phone size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'חיוג ישיר' : 'Call'}</p>
                <span className="font-black text-lg tracking-widest">055-667-4329</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/message/WZKLTKH4KELMD1" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3.5rem] border border-white/5 hover:border-green-500/50 hover:bg-white/10 transition-all group shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 group-hover:-rotate-12 transition-all">
                <MessageSquare size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'מענה מהיר' : 'Instant'}</p>
                <span className="font-black text-lg uppercase italic">{isHE ? 'וואטסאפ' : 'WhatsApp'}</span>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:DA@101.ORG.IL" className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[3.5rem] border border-white/5 hover:border-blue-400/50 hover:bg-white/10 transition-all group shadow-xl overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-12 transition-all">
                <Mail size={28} />
              </div>
              <div className="space-y-1 w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'אימייל' : 'Email'}</p>
                <span className="font-black text-xs md:text-sm tracking-tight truncate block">DA@101.ORG.IL</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-center space-y-4 pb-16 opacity-50 px-6">
        <div className="h-px w-20 bg-[#C2A353] mx-auto opacity-30"></div>
        <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.6em] leading-loose">
          © 2026 MAZALIX LUXURY SYSTEMS <br className="md:hidden" /> • DEVELOPED AND DESIGNED BY DA
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
};

export default HomePage;