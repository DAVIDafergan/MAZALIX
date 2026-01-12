
import React, { useState, useEffect } from 'react';
import { Language, Prize, Package } from '../types';
import { ArrowUpRight, X, Ticket, Layers, Share2, Star, Gift } from 'lucide-react';

interface CatalogProps { store: any; }

const Catalog: React.FC<CatalogProps> = ({ store }) => {
  const { prizes, packages, lang, campaign, auth } = store;
  const isHE = lang === Language.HE;
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featuredPrizes = prizes.filter((p: Prize) => p.isFeatured);

  useEffect(() => {
    if (featuredPrizes.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPrizes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredPrizes.length]);

  const handleShareCatalog = async () => {
    const clientId = window.location.hash.split('/').pop() || auth.clientId || 'demo';
    const shareData = {
      title: isHE ? campaign.nameHE : campaign.nameEN,
      url: `${window.location.origin}/#/catalog/${clientId}`,
    };
    if (navigator.share) await navigator.share(shareData);
    else { navigator.clipboard.writeText(shareData.url); alert(isHE ? 'לינק הקטלוג הועתק!' : 'Link copied!'); }
  };

  const handleSharePrize = async (p: Prize) => {
    const clientId = window.location.hash.split('/').pop() || auth.clientId || 'demo';
    const url = `${window.location.origin}/#/catalog/${clientId}`;
    if (navigator.share) await navigator.share({ title: isHE ? p.titleHE : p.titleEN, url });
    else { navigator.clipboard.writeText(url); alert(isHE ? 'לינק הועתק!' : 'Link copied!'); }
  };

  const sortedPrizes = [...prizes].sort((a, b) => (a.order || 0) - (b.order || 0));
  const regularPrizes = sortedPrizes.filter((p: Prize) => !p.isFeatured);

  return (
    <div className="space-y-6 md:space-y-12 pb-20 animate-fade-in">
      <header className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden group border border-white/5">
        <img src={campaign.banner} className="w-full h-full object-cover opacity-20" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-8">
          <img src={campaign.logo} className="w-16 md:w-32 drop-shadow-2xl" alt="Logo" />
          <h1 className="text-3xl md:text-7xl font-black italic luxury-gradient bg-clip-text text-transparent">
            {isHE ? campaign.nameHE : campaign.nameEN}
          </h1>
          <div className="flex gap-4">
            <button onClick={handleShareCatalog} className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl gold-text font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              <Share2 size={18} /> {isHE ? 'שתף קטלוג' : 'Share Catalog'}
            </button>
            {campaign.donationUrl && (
              <a href={campaign.donationUrl} target="_blank" rel="noreferrer" className="px-8 py-3 luxury-gradient text-black font-black rounded-2xl shadow-xl text-xs uppercase italic hover:scale-105 transition-all">
                {isHE ? 'להצטרפות' : 'Enter'}
              </a>
            )}
          </div>
        </div>
      </header>

      {featuredPrizes.length > 0 && (
        <div className="px-1 md:px-0 relative h-[320px] md:h-[520px] w-full floating glass-card rounded-[2.5rem] border-2 border-[#C2A353]/40 overflow-hidden shadow-2xl">
          {featuredPrizes.map((p, idx) => (
            <div key={p.id} className={`absolute inset-0 transition-all duration-[1.5s] ${idx === featuredIndex ? 'opacity-100' : 'opacity-0'}`}>
              <img src={p.media[0]?.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-8 right-8 md:left-20 md:right-20">
                 <h2 className="text-4xl md:text-8xl font-black italic luxury-gradient bg-clip-text text-transparent leading-none drop-shadow-2xl">
                   {isHE ? p.titleHE : p.titleEN}
                 </h2>
                 <p className="text-gray-300 text-sm md:text-2xl font-bold italic line-clamp-2 max-w-2xl mt-4">
                   {isHE ? p.descriptionHE : p.descriptionEN}
                 </p>
                 <div className="flex items-center gap-6 pt-6">
                    <span className="text-3xl md:text-6xl font-black italic gold-text">₪{p.value?.toLocaleString()}</span>
                    <button onClick={() => handleSharePrize(p)} className="p-4 bg-white/5 rounded-2xl border border-white/10 gold-text hover:bg-white/10 transition-all"><Share2 size={24}/></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-1 md:px-0">
         {regularPrizes.map((p: Prize) => (
            <div key={p.id} className={`glass-card rounded-[2rem] p-4 border border-white/5 flex flex-col group ${p.isFullPage ? 'col-span-full' : ''}`}>
              <div className="relative h-48 md:h-72 rounded-[1.5rem] overflow-hidden mb-6">
                <img src={p.media[0]?.url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt="" />
                <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-xl text-[10px] font-black italic gold-text border border-white/10">₪{p.value?.toLocaleString()}</div>
                <button onClick={() => handleSharePrize(p)} className="absolute top-4 left-4 p-2 bg-black/60 rounded-xl gold-text opacity-0 group-hover:opacity-100 transition-opacity"><Share2 size={16}/></button>
              </div>
              <div className="px-2 pb-2 space-y-4 flex-grow flex flex-col justify-between">
                <div className="text-center">
                  <h3 className="text-base md:text-xl font-black italic leading-tight group-hover:gold-text transition-colors">{isHE ? p.titleHE : p.titleEN}</h3>
                  <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 italic">{isHE ? p.descriptionHE : p.descriptionEN}</p>
                </div>
                <a href={campaign.donationUrl} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:luxury-gradient hover:text-black transition-all text-center italic">
                  {isHE ? 'פרטים והצטרפות' : 'Enter Now'}
                </a>
              </div>
            </div>
         ))}
      </section>

      {packages.length > 0 && (
        <section className="flex gap-4 overflow-x-auto pb-10 scrollbar-hide px-1">
          {packages.map((pkg: Package) => (
            <div key={pkg.id} className="min-w-[200px] md:min-w-[280px] h-[240px] relative rounded-[2.5rem] overflow-hidden glass-card shrink-0" style={{ borderTop: `4px solid ${pkg.color}` }}>
              {pkg.image && <img src={pkg.image} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-3">
                <h3 className="text-base md:text-xl font-black italic gold-text">{isHE ? pkg.nameHE : pkg.nameEN}</h3>
                <p className="text-xl md:text-2xl font-black italic">₪{pkg.minAmount?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Catalog;
