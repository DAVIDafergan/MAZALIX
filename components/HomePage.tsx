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
  PlayCircle
} from 'lucide-react';

interface HomeProps { store: any; }

const HomePage: React.FC<HomeProps> = ({ store }) => {
  const { lang } = store;
  const isHE = lang === Language.HE;

  return (
    <div className="space-y-24 pb-20 animate-fade-in overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="text-center space-y-10 pt-16 md:pt-32 relative">
        {/* אלמנטים עיצוביים ברקע */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C2A353]/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500/10 border border-[#C2A353]/20 rounded-full text-[11px] font-black uppercase tracking-[0.4em] gold-text animate-fade-in">
          <Sparkles size={14} /> {isHE ? 'הדור הבא של עולם הגיוס' : 'The Evolution of Fundraising'}
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-[0.85] select-none">
          MAZALIX <br />
          <span className="luxury-gradient bg-clip-text text-transparent px-2">
            {isHE ? 'טכנולוגיה של נתינה' : 'Powering Generosity'}
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-gray-400 font-medium text-base md:text-xl italic px-6 leading-relaxed">
          {isHE 
            ? 'הופכים כל קמפיין ליצירת אמנות. מערכת חכמה לניהול מכירות סיניות, הגרלות יוקרה ודינמיקה של תורמים עם חוויית משתמש עוצרת נשימה.'
            : 'Transforming campaigns into masterpieces. A smart system for Chinese auctions, luxury raffles, and donor engagement with a breathtaking UX.'}
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-4">
          <Link to="/admin" className="group relative px-12 py-5 luxury-gradient text-black font-black rounded-2xl shadow-[0_20px_50px_rgba(194,163,83,0.3)] hover:scale-105 transition-all uppercase italic flex items-center gap-3">
            {isHE ? 'כניסה לממשק ניהול' : 'Admin Dashboard'}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#contact" className="text-gray-400 hover:text-white font-black uppercase text-sm tracking-widest transition-colors border-b border-transparent hover:border-[#C2A353]">
            {isHE ? 'לפתיחת קמפיין חדש' : 'Start Your Journey'}
          </a>
        </div>
      </section>

      {/* --- SYSTEM CAPABILITIES (GRID) --- */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: <LayoutDashboard className="gold-text" size={32} />, 
            title: isHE ? 'קטלוג מתנות דיגיטלי' : 'Digital Gift Catalog', 
            desc: isHE ? 'מערכת קטלוג יוקרתית הכוללת כתיבת תיאורים בבינה מלאכותית (AI), הצגת וידאו ותמונות ברזולוציה מקסימלית.' : 'Ultra-luxurious catalog featuring AI-generated descriptions and 4K media support.' 
          },
          { 
            icon: <BarChart3 className="gold-text" size={32} />, 
            title: isHE ? 'ניהול וניתוח נתונים' : 'Data Insights', 
            desc: isHE ? 'איזור ניהול מתקדם המציג הכנסות בזמן אמת, שיוך תורמים אוטומטי למסלולים ודוחות חכמים.' : 'Advanced dashboard with real-time revenue tracking and automated donor-package mapping.' 
          },
          { 
            icon: <PlayCircle className="gold-text" size={32} />, 
            title: isHE ? 'מערכת הגרלות לייב' : 'Live Draw Engine', 
            desc: isHE ? 'ממשק הגרלה קולנועי המיועד לשידורים חיים ואירועי ענק, עם אנימציות יוקרה ושקיפות מלאה.' : 'Cinematic drawing interface for live events, featuring high-end animations and total transparency.' 
          },
        ].map((f, i) => (
          <div key={i} className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#C2A353]/5 rounded-full blur-2xl group-hover:bg-[#C2A353]/10 transition-all"></div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
            <h3 className="text-2xl font-black italic">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed italic">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* --- CONTACT & CTA SECTION --- */}
      <section id="contact" className="px-6 max-w-5xl mx-auto">
        <div className="glass-card p-10 md:p-20 rounded-[4rem] border-2 border-[#C2A353]/20 relative overflow-hidden text-center space-y-12 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 luxury-gradient opacity-50"></div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
              {isHE ? 'מוכנים להזניק את הגיוס שלכם?' : 'Ready to Elevate Your Goal?'}
            </h2>
            <p className="text-gray-400 font-medium italic max-w-2xl mx-auto">
              {isHE 
                ? 'אנחנו כאן כדי לבנות עבורכם קמפיין מנצח. צרו קשר עם הצוות הטכני שלנו לפתיחת חשבון והקמת קמפיין מותאם אישית.' 
                : 'We are here to build your winning campaign. Contact our technical team to set up your customized luxury raffle.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
            <a href="tel:0556674329" className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-[#C2A353] transition-all group">
              <div className="w-14 h-14 rounded-full bg-[#C2A353]/10 flex items-center justify-center text-[#C2A353] group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <span className="font-black text-sm tracking-widest">055-667-4329</span>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/message/WZKLTKH4KELMD1" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-green-500/50 transition-all group">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <span className="font-black text-sm tracking-widest uppercase italic">{isHE ? 'שלח וואטסאפ' : 'WhatsApp Us'}</span>
            </a>

            {/* Email */}
            <a href="mailto:DA@101.ORG.IL" className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-blue-400/50 transition-all group">
              <div className="w-14 h-14 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="font-black text-[11px] tracking-tight truncate w-full">DA@101.ORG.IL</span>
            </a>
          </div>

          <div className="pt-8 flex justify-center items-center gap-8 opacity-40 grayscale select-none">
            <ShieldCheck size={24} />
            <Award size={24} />
            <Globe size={24} />
            <Zap size={24} />
          </div>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.5em] pb-10">
        © 2026 MAZALIX LUXURY SYSTEMS • BY DA
      </footer>
    </div>
  );
};

export default HomePage;