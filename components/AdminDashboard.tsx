
import React, { useState, useRef, useMemo } from 'react';
import { Prize, Package, DrawStatus, Language, Donor, CampaignSettings, Client } from '../types';
import { Plus, Upload, Users, Gift, Settings, Trash2, Download, RefreshCcw, ImageIcon, Video, Star, Layers, X, LogOut, Play, ExternalLink, Sparkles, Save, Share2, Eye, FileSpreadsheet, Edit3, ChevronUp, ChevronDown, Search, Filter, ShieldAlert, UserPlus, Key, Activity, Power, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

interface AdminProps { store: any; }

const AdminDashboard: React.FC<AdminProps> = ({ store }) => {
  const { prizes, packages, donors, campaign, updateCampaign, addPrize, deletePrize, updatePrize, addPackage, deletePackage, updatePackage, addDonor, tickets, lang, auth, login, logout, triggerSave, clients, addClient, updateClientStatus, deleteClient, setImpersonation } = store;
  const isHE = lang === Language.HE;
  const navigate = useNavigate();
  
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [activeTab, setActiveTab] = useState<'prizes' | 'routes' | 'donors' | 'live' | 'campaign' | 'clients'>('prizes');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Super Admin Client Form
  const [newClient, setNewClient] = useState({ displayName: '', user: '', pass: '' });

  // Prize Forms States
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    titleHE: '', titleEN: '', descriptionHE: '', descriptionEN: '', value: 0, media: [], status: DrawStatus.OPEN, order: prizes.length, isFeatured: false, isFullPage: false
  });
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);

  const [pkgForm, setPkgForm] = useState<Partial<Package>>({
    nameHE: '', nameEN: '', minAmount: 0, rules: [], image: '', joinLink: '', color: '#C2A353'
  });

  const [manualDonor, setManualDonor] = useState({ name: '', phone: '', amount: 0, pkgId: '' });
  const [donorSearch, setDonorSearch] = useState('');
  const [donorFilterPkg, setDonorFilterPkg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{type: 'prize' | 'package' | 'campaign_logo' | 'campaign_banner', id?: string} | null>(null);

  const filteredDonors = useMemo(() => {
    return donors.filter((d: Donor) => {
      const matchesSearch = d.name.toLowerCase().includes(donorSearch.toLowerCase()) || d.phone.includes(donorSearch);
      const matchesPkg = donorFilterPkg === '' || d.packageId === donorFilterPkg;
      return matchesSearch && matchesPkg;
    });
  }, [donors, donorSearch, donorFilterPkg]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('video') ? 'video' : 'image';
      if (uploadTarget?.type === 'prize') {
        setNewPrize(prev => ({ ...prev, media: [...(prev.media || []), { id: Math.random().toString(36).substr(2, 9), type, url: base64 }] }));
      } else if (uploadTarget?.type === 'package') {
        setPkgForm(prev => ({ ...prev, image: base64 }));
      } else if (uploadTarget?.type === 'campaign_logo') {
        updateCampaign({ logo: base64 });
      } else if (uploadTarget?.type === 'campaign_banner') {
        updateCampaign({ banner: base64 });
      }
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      let count = 0;
      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('שם'))) return;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 3) {
          const [name, phone, amountStr] = parts;
          const amount = parseFloat(amountStr) || 0;
          if (name && phone) {
            const donor: Donor = { id: Math.random().toString(36).substr(2, 9), name, phone, email: '', totalDonated: amount };
            addDonor(donor);
            count++;
          }
        }
      });
      alert(isHE ? `ייבוא הושלם! ${count} תורמים נוספו ושויכו אוטומטית למסלולים.` : `Import complete! ${count} donors added.`);
    };
    reader.readAsText(file);
  };

  const triggerUpload = (type: any, id?: string) => {
    setUploadTarget({ type, id });
    fileInputRef.current?.click();
  };

  const generateAIDescription = async () => {
    if (!newPrize.titleHE) return alert(isHE ? 'אנא הזן שם מתנה תחילה' : 'Enter name');
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `צור תיאור שיווקי יוקרתי ב-1-2 שורות למתנת הגרלה בשם: "${newPrize.titleHE}". החזר אובייקט JSON עם מפתחות "he" ו-"en".`,
        config: { responseMimeType: "application/json" }
      });
      const result = JSON.parse(response.text);
      setNewPrize(prev => ({ ...prev, descriptionHE: result.he, descriptionEN: result.en }));
    } catch (err) {
      alert(isHE ? 'שגיאה ביצירת תיאור AI' : 'AI error');
    } finally { setIsGeneratingAI(false); }
  };

  const handlePrizeAction = () => {
    if (editingPrizeId) {
      updatePrize(editingPrizeId, newPrize);
      setEditingPrizeId(null);
    } else {
      addPrize(newPrize as Prize);
    }
    setNewPrize({ titleHE: '', titleEN: '', descriptionHE: '', descriptionEN: '', value: 0, media: [], status: DrawStatus.OPEN, isFeatured: false, isFullPage: false });
  };

  const editPrize = (p: Prize) => {
    setNewPrize(p);
    setEditingPrizeId(p.id);
    setActiveTab('prizes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const movePrize = (id: string, dir: 'up' | 'down') => {
    const idx = prizes.findIndex((p: Prize) => p.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= prizes.length) return;
    const items = [...prizes];
    const [moved] = items.splice(idx, 1);
    items.splice(newIdx, 0, moved);
    items.forEach((p, i) => updatePrize(p.id, { order: i }));
  };

  const handleAddManualDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDonor.name || !manualDonor.phone) return alert(isHE ? 'נא למלא שם וטלפון' : 'Please fill name and phone');
    const donor: Donor = { id: Math.random().toString(36).substr(2, 9), name: manualDonor.name, phone: manualDonor.phone, email: '', totalDonated: manualDonor.amount, packageId: manualDonor.pkgId || undefined };
    addDonor(donor);
    setManualDonor({ name: '', phone: '', amount: 0, pkgId: '' });
    alert(isHE ? 'תורם נוסף בהצלחה!' : 'Donor added!');
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.displayName || !newClient.user || !newClient.pass) return alert(isHE ? 'נא למלא את כל השדות' : 'Please fill all fields');
    addClient(newClient.displayName, newClient.user, newClient.pass);
    setNewClient({ displayName: '', user: '', pass: '' });
    alert(isHE ? 'לקוח חדש נוסף למערכת!' : 'Client added!');
  };

  const getCatalogUrl = () => `${window.location.origin}/#/catalog/${auth.clientId}`;
  const copyCatalogLink = () => { navigator.clipboard.writeText(getCatalogUrl()); alert(isHE ? 'לינק הקטלוג הועתק!' : 'Copied!'); };
  const copyLiveLink = (id: string) => { navigator.clipboard.writeText(`${window.location.origin}/#/live/${id}`); alert(isHE ? 'לינק הגרלה חיה לצפייה הועתק!' : 'Copied!'); };

  if (!auth.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="glass-card p-10 rounded-[2.5rem] border-t-4 border-[#C2A353] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 luxury-gradient"></div>
          
          <div className="text-center space-y-4 mb-10">
            <div className="w-20 h-20 luxury-gradient rounded-full mx-auto flex items-center justify-center text-black shadow-xl animate-pulse">
              <Key size={32} />
            </div>
            <h2 className="text-3xl font-black italic gold-text uppercase tracking-tighter">
              {isHE ? 'כניסת מנהלים' : 'Admin Vault'}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              {isHE ? 'גישה מאובטחת למערכת Mazalix' : 'Secure Mazalix Terminal'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); login(loginForm.user, loginForm.pass); }} className="space-y-6">
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder={isHE ? "שם משתמש" : "Username"}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C2A353] transition-all font-bold tracking-widest text-center" 
                value={loginForm.user} 
                onChange={e => setLoginForm({...loginForm, user: e.target.value})} 
              />
              <input 
                type="password" 
                placeholder={isHE ? "סיסמה" : "Password"}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C2A353] transition-all font-bold tracking-widest text-center" 
                value={loginForm.pass} 
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})} 
              />
            </div>
            <button type="submit" className="w-full py-5 luxury-gradient text-black font-black uppercase italic rounded-2xl shadow-xl hover:scale-105 transition-all">
              {isHE ? 'התחברות למערכת' : 'Access System'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SUPER ADMIN VIEW
  if (auth.isSuperAdmin && auth.clientId === 'super') {
    return (
      <div className="space-y-10 max-w-6xl mx-auto pb-20 px-4 animate-fade-in">
        <div className="flex justify-between items-center glass-card p-8 rounded-3xl border-l-4 border-[#C2A353]">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic">{isHE ? 'פאנל מנהל על (DA1234)' : 'Super Admin Terminal'}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{isHE ? 'ניהול מלא של לקוחות ומערכות' : 'Complete Client Control'}</p>
              </div>
           </div>
           <button onClick={logout} className="p-3 bg-white/5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
             <LogOut size={24} />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-1 glass-card p-8 rounded-[2.5rem] space-y-8 h-fit">
              <h3 className="text-xl font-black italic gold-text flex items-center gap-2">
                <UserPlus size={20}/> {isHE ? 'הוספת לקוח חדש' : 'Register Client'}
              </h3>
              <form onSubmit={handleAddClient} className="space-y-4">
                <input placeholder={isHE ? "שם התצוגה של הלקוח" : "Display Name"} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#C2A353]" value={newClient.displayName} onChange={e => setNewClient({...newClient, displayName: e.target.value})} />
                <input placeholder={isHE ? "שם משתמש" : "Username"} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#C2A353]" value={newClient.user} onChange={e => setNewClient({...newClient, user: e.target.value})} />
                <input placeholder={isHE ? "סיסמה" : "Password"} type="password" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-[#C2A353]" value={newClient.pass} onChange={e => setNewClient({...newClient, pass: e.target.value})} />
                <button className="w-full py-4 luxury-gradient text-black font-black uppercase italic rounded-xl shadow-lg">
                   {isHE ? 'צור לקוח במערכת' : 'Create Account'}
                </button>
              </form>
           </div>

           <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-xl font-black italic">{isHE ? 'ניהול לקוחות רשומים' : 'Manage Clients'}</h3>
                 <div className="text-[10px] font-black text-gray-500 uppercase">{clients.length} Accounts</div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {clients.map((c: Client) => (
                  <div key={c.id || c._id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between group gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#C2A353]">
                        <Users size={24} />
                      </div>
                      <div>
                        <h4 className="font-black italic text-lg">{c.displayName}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">User: {c.username} | ID: {c.id || c._id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setImpersonation(c.id || c._id)} className="p-3 bg-[#C2A353]/10 rounded-xl hover:bg-[#C2A353] hover:text-black transition-all text-[#C2A353] flex items-center gap-2 font-black text-[10px] uppercase">
                         <LogIn size={16}/> {isHE ? 'נהל קמפיין' : 'Manage'}
                       </button>
                       <button onClick={() => updateClientStatus((c.id || c._id)!, !c.isActive)} className={`p-3 rounded-xl transition-all ${c.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                         <Power size={16} />
                       </button>
                       <button onClick={() => { if(confirm(isHE ? 'בטוח שברצונך למחוק לקוח זה ואת כל נתוניו?' : 'Delete client and all data?')) deleteClient((c.id || c._id)!) }} className="p-3 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-gray-500">
                         <Trash2 size={16} />
                       </button>
                       <Link to={`/catalog/${c.id || c._id}`} className="p-3 bg-white/5 rounded-xl hover:gold-text transition-all text-gray-500"><Eye size={16}/></Link>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 italic">{isHE ? 'אין לקוחות רשומים' : 'No clients yet'}</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // CAMPAIGN ADMIN VIEW (Visible to Client or Impersonating Super Admin)
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 px-4">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
      <input type="file" ref={importInputRef} className="hidden" onChange={handleImportCSV} accept=".csv" />
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-3xl border-l-4 border-[#C2A353] gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full luxury-gradient flex items-center justify-center text-black font-black shadow-lg">M</div>
          <div>
            <h2 className="font-black text-lg italic">{isHE ? 'ניהול קמפיין' : 'Campaign Manager'}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{campaign.nameHE}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {auth.isSuperAdmin && (
             <button onClick={() => setImpersonation(undefined)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase">
               חזרה לפאנל מנהל על
             </button>
          )}
          <button onClick={() => navigate(`/catalog/${auth.clientId}`)} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-xs font-bold shadow-lg">
            <Eye size={16} /> צפה בקטלוג
          </button>
          <button onClick={copyCatalogLink} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl gold-text border border-white/10 hover:bg-white/10 transition-all text-xs font-bold">
            <Share2 size={16} /> שיתוף לינק
          </button>
          <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500 transition-all"><LogOut size={20}/></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'prizes', label: 'מתנות', icon: <Gift size={16}/> },
          { id: 'routes', label: 'מסלולים', icon: <Layers size={16}/> },
          { id: 'donors', label: 'תורמים', icon: <Users size={16}/> },
          { id: 'live', label: 'הגרלה חיה', icon: <Play size={16}/> },
          { id: 'campaign', label: 'הגדרות', icon: <Settings size={16}/> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-black text-sm italic ${activeTab === tab.id ? 'luxury-gradient text-black shadow-lg scale-105' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 min-h-[600px] animate-fade-in">
        
        {/* PRIZES TAB */}
        {activeTab === 'prizes' && (
          <div className="space-y-10">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-xl font-black italic gold-text">{editingPrizeId ? 'עריכת מתנה קיימת' : 'הוספת מתנה חדשה לקטלוג'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="שם המתנה (עברית)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-[#C2A353]" value={newPrize.titleHE} onChange={e => setNewPrize({...newPrize, titleHE: e.target.value})} />
                <input type="number" placeholder="ערך כספי (₪)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-[#C2A353]" value={newPrize.value || ''} onChange={e => setNewPrize({...newPrize, value: Number(e.target.value)})} />
                <textarea placeholder="תיאור שיווקי (עברית)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none h-20" value={newPrize.descriptionHE} onChange={e => setNewPrize({...newPrize, descriptionHE: e.target.value})} />
                <textarea placeholder="Bio (English Description)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none h-20" value={newPrize.descriptionEN} onChange={e => setNewPrize({...newPrize, descriptionEN: e.target.value})} />
                <div className="md:col-span-2 flex gap-3">
                  <button onClick={() => triggerUpload('prize')} className="flex-1 bg-white/5 border border-dashed border-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all">
                    <Upload size={20} className="gold-text" />
                    <span className="text-[10px] font-black uppercase">העלה מדיה מהמכשיר ({newPrize.media?.length || 0})</span>
                  </button>
                  <button onClick={generateAIDescription} disabled={isGeneratingAI} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#C2A353] transition-all flex items-center justify-center gap-2 min-w-[140px]">
                    {isGeneratingAI ? <RefreshCcw className="animate-spin" size={20}/> : <Sparkles className="gold-text" size={20}/>}
                    <span className="text-[10px] font-black uppercase">יצירת תיאור AI (1-2 שורות)</span>
                  </button>
                </div>
                <div className="md:col-span-2 flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#C2A353]" checked={newPrize.isFeatured} onChange={e => setNewPrize({...newPrize, isFeatured: e.target.checked})} />
                    <span className="text-xs font-bold italic">מתנה ראשית (באנר עליון)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-[#C2A353]" checked={newPrize.isFullPage} onChange={e => setNewPrize({...newPrize, isFullPage: e.target.checked})} />
                    <span className="text-xs font-bold italic">עמוד מלא (פריסה רחבה)</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handlePrizeAction} className="flex-1 luxury-gradient py-4 rounded-2xl text-black font-black uppercase italic shadow-xl hover:scale-[1.01] transition-all">
                  {editingPrizeId ? 'שמור שינויים במתנה' : 'הוסף מתנה לקטלוג'}
                </button>
                {editingPrizeId && (
                  <button onClick={() => { setEditingPrizeId(null); setNewPrize({titleHE:''}); }} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase italic">ביטול</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizes.map((p: Prize) => (
                <div key={p.id || p._id} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col gap-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                        {p.media[0] ? <img src={p.media[0].url} className="w-full h-full object-cover" /> : <ImageIcon size={20}/>}
                      </div>
                      <div>
                        <h4 className="font-black text-sm italic">{p.titleHE}</h4>
                        <p className="text-[10px] gold-text font-bold">₪{p.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => movePrize((p.id || p._id)!, 'up')} className="p-1 hover:gold-text transition-colors"><ChevronUp size={14}/></button>
                      <button onClick={() => movePrize((p.id || p._id)!, 'down')} className="p-1 hover:gold-text transition-colors"><ChevronDown size={14}/></button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="flex gap-2">
                       <button onClick={() => editPrize(p)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:gold-text transition-all"><Edit3 size={14}/></button>
                       <button onClick={() => deletePrize((p.id || p._id)!)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase">מיקום: {p.order + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTES TAB */}
        {activeTab === 'routes' && (
          <div className="space-y-10">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-xl font-black italic gold-text">יצירת מסלול תרומה חדש</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="שם המסלול" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-[#C2A353]" value={pkgForm.nameHE} onChange={e => setPkgForm({...pkgForm, nameHE: e.target.value})} />
                <input type="number" placeholder="סכום מינימום (₪)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-[#C2A353]" value={pkgForm.minAmount || ''} onChange={e => setPkgForm({...pkgForm, minAmount: Number(e.target.value)})} />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button onClick={() => triggerUpload('package')} className="bg-white/5 border border-dashed border-white/20 p-4 rounded-2xl flex flex-col items-center gap-2">
                     {pkgForm.image ? <img src={pkgForm.image} className="h-10 object-contain" /> : <Upload size={20} className="gold-text" />}
                     <span className="text-[10px] font-black uppercase">העלה תמונה למסלול</span>
                   </button>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-center items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-gray-500">צבע מזהה למסלול</span>
                      <input type="color" className="w-full h-10 rounded-xl bg-transparent border-none cursor-pointer" value={pkgForm.color} onChange={e => setPkgForm({...pkgForm, color: e.target.value})} />
                   </div>
                </div>
              </div>
              <button onClick={() => { addPackage({...pkgForm} as Package); setPkgForm({nameHE:'', rules:[], minAmount:0, color: '#C2A353'}); }} className="w-full luxury-gradient py-4 rounded-2xl text-black font-black uppercase italic shadow-xl">צור מסלול חדש</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg: Package) => (
                <div key={pkg.id || pkg._id} className="glass-card p-6 rounded-3xl border border-white/5 flex items-center justify-between group" style={{borderRight: `4px solid ${pkg.color}`}}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#C2A353]">{pkg.image ? <img src={pkg.image} className="w-full h-full object-cover rounded-xl"/> : <Layers size={24}/>}</div>
                    <h4 className="font-black text-sm italic">{pkg.nameHE}</h4>
                  </div>
                  <button onClick={() => deletePackage((pkg.id || pkg._id)!)} className="p-2 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONORS TAB */}
        {activeTab === 'donors' && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xl font-black italic gold-text">הוספת תורם ידנית</h3>
                <form onSubmit={handleAddManualDonor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="שם מלא" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={manualDonor.name} onChange={e => setManualDonor({...manualDonor, name: e.target.value})} />
                  <input placeholder="טלפון" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={manualDonor.phone} onChange={e => setManualDonor({...manualDonor, phone: e.target.value})} />
                  <input type="number" placeholder="סכום תרומה (₪)" className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={manualDonor.amount || ''} onChange={e => setManualDonor({...manualDonor, amount: Number(e.target.value)})} />
                  <select className="bg-white/5 p-4 rounded-2xl border border-white/10 outline-none text-gray-400" value={manualDonor.pkgId} onChange={e => setManualDonor({...manualDonor, pkgId: e.target.value})}>
                    <option value="">שיוך אוטומטי (לפי סכום)</option>
                    {packages.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.nameHE} - ₪{p.minAmount}</option>)}
                  </select>
                  <button type="submit" className="md:col-span-2 luxury-gradient py-4 rounded-2xl text-black font-black uppercase italic shadow-xl">הוסף תורם למערכת</button>
                </form>
              </div>
              <button onClick={() => importInputRef.current?.click()} className="md:w-64 glass-card p-8 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:gold-text transition-all">
                 <FileSpreadsheet size={48} />
                 <span className="text-[10px] font-black uppercase">ייבוא מאקסל (CSV)</span>
                 <p className="text-[8px] text-gray-500 italic">פורמט: שם, טלפון, סכום</p>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" placeholder="חיפוש לפי שם או טלפון..." className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none" value={donorSearch} onChange={e => setDonorSearch(e.target.value)} />
                 </div>
                 <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select className="bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none min-w-[200px]" value={donorFilterPkg} onChange={e => setDonorFilterPkg(e.target.value)}>
                       <option value="">כל המסלולים</option>
                       {packages.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.nameHE}</option>)}
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {filteredDonors.map((d: Donor) => {
                  const pkg = packages.find(p => (p.id || p._id) === d.packageId);
                  return (
                    <div key={d.id || d._id} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-400">{d.name.charAt(0)}</div>
                        <div>
                          <h5 className="text-xs font-black italic">{d.name} <span className="text-[9px] text-gray-500 ml-2">{d.phone}</span></h5>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pkg?.color || '#333' }}></div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{pkg?.nameHE || 'ללא מסלול'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black gold-text">₪{d.totalDonated.toLocaleString()}</p>
                         <p className="text-[8px] text-gray-500 uppercase">{tickets.filter((t: any) => t.donorId === (d.id || d._id)).length} כרטיסים</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LIVE DRAW TAB */}
        {activeTab === 'live' && (
          <div className="space-y-10">
            <h3 className="text-3xl font-black italic text-center gold-text">ניהול הגרלות חיות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-10">
              {prizes.map(p => (
                <div key={p.id || p._id} className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                         <img src={p.media[0]?.url} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black italic text-sm">{p.titleHE}</h4>
                        <p className="text-[10px] gold-text">{tickets.filter((t: any) => t.prizeId === (p.id || p._id)).length} כרטיסים</p>
                      </div>
                    </div>
                    <Link to={`/draw/${p.id || p._id}`} className="px-6 py-2 rounded-full text-[10px] font-black uppercase luxury-gradient text-black shadow-lg">התחל הגרלה</Link>
                  </div>
                  <button onClick={() => copyLiveLink((p.id || p._id)!)} className="w-full py-2 bg-white/5 rounded-xl border border-white/10 text-[8px] font-black uppercase tracking-widest hover:gold-text flex items-center justify-center gap-2 transition-all">
                    <Share2 size={12}/> העתק לינק צפייה לקהל
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMPAIGN TAB */}
        {activeTab === 'campaign' && (
          <div className="space-y-10">
            <h3 className="text-2xl font-black italic gold-text">הגדרות קמפיין כלליות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <input className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={campaign.nameHE} onChange={e => updateCampaign({nameHE: e.target.value})} placeholder="שם הקמפיין" />
                <input type="date" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={campaign.drawDate} onChange={e => updateCampaign({drawDate: e.target.value})} />
                <input className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none" value={campaign.donationUrl} onChange={e => updateCampaign({donationUrl: e.target.value})} placeholder="לינק חיצוני להצטרפות" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => triggerUpload('campaign_logo')} className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/20 hover:border-[#C2A353] transition-all flex flex-col items-center gap-2">
                   {campaign.logo ? <img src={campaign.logo} className="h-12 object-contain" /> : <ImageIcon className="text-gray-600" size={32}/>}
                   <span className="text-[8px] font-black uppercase">לוגו קמפיין</span>
                </button>
                <button onClick={() => triggerUpload('campaign_banner')} className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/20 hover:border-[#C2A353] transition-all flex flex-col items-center gap-2">
                   {campaign.banner ? <img src={campaign.banner} className="h-12 object-cover rounded opacity-50" /> : <ImageIcon className="text-gray-600" size={32}/>}
                   <span className="text-[8px] font-black uppercase">באנר קמפיין</span>
                </button>
              </div>
            </div>
            <button onClick={() => { triggerSave(); alert(isHE ? 'הגדרות נשמרו בהצלחה!' : 'Saved!'); }} className="w-full py-5 luxury-gradient text-black font-black text-xl rounded-3xl italic flex items-center justify-center gap-4 shadow-xl hover:scale-105 transition-all">
              <Save size={24} /> שמור הגדרות מערכת
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
