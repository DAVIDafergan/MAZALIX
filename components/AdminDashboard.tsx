import React, { useState, useMemo, useRef } from 'react';
import { Prize, Package, DrawStatus, Language, Donor, CampaignSettings, PackageRule, PrizeMedia, Client } from '../types';
import { Plus, Upload, Users, Gift, Settings, Activity, Trash2, Download, AlertCircle, RefreshCcw, DollarSign, Ticket as TicketIcon, Image as ImageIcon, Video, Star, Layout, ListOrdered, Calendar, ArrowUp, ArrowDown, ChevronRight, X, Layers, Link as LinkIcon, CheckCircle, Shield, LogOut, Key, Play, ExternalLink, Copy, Sparkles, Wand2, Bell, BarChart3, PieChart, ChevronDown, Paperclip, Mail, Phone, UserPlus, UserCheck, Save, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx'; // ייבוא הספרייה לקריאת אקסל

interface AdminProps {
  store: any;
}

const AdminDashboard: React.FC<AdminProps> = ({ store }) => {
  const { prizes, packages, donors, campaign, updateCampaign, addPrize, deletePrize, updatePrize, addPackage, deletePackage, updatePackage, addDonor, tickets, lang, resetData, auth, login, logout, clients, addClient, unmappedDonors, assignPackageToDonor } = store;
  const isHE = lang === Language.HE;
  
  // --- סינון נתונים לפי לקוח מחובר ---
  const clientPrizes = auth.isSuperAdmin ? prizes : prizes.filter((p: any) => p.clientId === auth.clientId);
  const clientPackages = auth.isSuperAdmin ? packages : packages.filter((p: any) => p.clientId === auth.clientId);
  const clientDonors = auth.isSuperAdmin ? donors : donors.filter((d: any) => d.clientId === auth.clientId);
  const clientTickets = auth.isSuperAdmin ? tickets : tickets.filter((t: any) => t.clientId === auth.clientId);
  const clientUnmapped = auth.isSuperAdmin ? unmappedDonors : unmappedDonors.filter((d: any) => d.clientId === auth.clientId);

  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [activeTab, setActiveTab] = useState<'prizes' | 'routes' | 'donors' | 'live' | 'campaign' | 'super' | 'alerts' | 'summary'>('prizes');
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedManualPkg, setSelectedManualPkg] = useState<Record<string, string>>({});

  // סטייט חדש לניהול מצב השמירה של הקמפיין
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // סטייט לטופס הוספת תורם ידני
  const [manualDonorForm, setManualDonorForm] = useState({ name: '', phone: '', email: '', amount: '', packageId: '' });

  // עדכון סטייט לקוח לכלול את כל השדות שביקשת - הוספתי טלפון ומייל
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', user: '', pass: '' });
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    titleHE: '', titleEN: '', descriptionHE: '', descriptionEN: '', value: 0, media: [], status: DrawStatus.OPEN, order: clientPrizes.length, isFeatured: false, isFullPage: false
  });
  const [pkgForm, setPkgForm] = useState<Partial<Package>>({
    nameHE: '', minAmount: 0, rules: [], image: '', joinLink: '', color: '#C2A353'
  });

  // פונקציה לשמירת הגדרות הקמפיין למסד הנתונים
  const handleSaveCampaignSettings = async () => {
    setIsSavingCampaign(true);
    try {
      // שליחת אובייקט הקמפיין המעודכן לסטור שמעדכן את ה-DB
      // אנו מוודאים שמעבירים את ה-clientId כדי שהקטלוג ידע לשייך את הנתונים
      await updateCampaign({
        ...campaign,
        id: auth.clientId,
        clientId: auth.clientId 
      });
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert(isHE ? "שגיאה בשמירת הנתונים למסד" : "Error saving data to database");
    } finally {
      setIsSavingCampaign(false);
    }
  };

  // פונקציית עזר להמרת קובץ ל-Base64 (בשביל תמונות ווידאו)
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'prize' | 'package', mediaType?: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await toBase64(file);
      if (type === 'prize' && mediaType) {
        const mediaItem: PrizeMedia = { id: Math.random().toString(36).substr(2, 9), type: mediaType, url: base64 };
        setNewPrize(prev => ({
          ...prev,
          media: [...(prev.media || []), mediaItem]
        }));
      } else if (type === 'package') {
        setPkgForm(prev => ({ ...prev, image: base64 }));
      }
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  // פונקציה לייבוא אקסל אמיתי והתאמה למסלולים
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      //jsonData מצפה לעמודות: Name, Phone, Email, Amount (או בעברית בהתאם לאקסל)
      jsonData.forEach((row: any) => {
        const donorName = row.Name || row['שם'] || 'תורם ללא שם';
        const donationAmount = Number(row.Amount || row['סכום'] || 0);
        const donorPhone = String(row.Phone || row['טלפון'] || '');
        const donorEmail = String(row.Email || row['אימייל'] || '');

        const donorId = Math.random().toString(36).substr(2, 9);
        
        // מציאת מסלול תואם בדיוק לפי הסכום
        const matchedPackage = clientPackages.find((p: Package) => p.minAmount === donationAmount);
        
        const newDonor: Donor = {
          id: donorId,
          clientId: auth.clientId,
          name: donorName,
          phone: donorPhone,
          email: donorEmail,
          totalDonated: donationAmount,
          packageId: matchedPackage ? matchedPackage.id : undefined
        };
        
        addDonor(newDonor);
        
        // שיוך אוטומטי למסלול ויצירת כרטיסים
        if (matchedPackage) {
            assignPackageToDonor(donorId, matchedPackage.id);
        }
      });

      setIsImporting(false);
      alert(isHE ? `ייבוא הושלם! עובדו ${jsonData.length} תורמים.` : `Import complete! Processed ${jsonData.length} donors.`);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateAIDescription = async () => {
    if (!newPrize.titleHE) {
      alert(isHE ? "נא להזין כותרת תחילה" : "Please enter a title first");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a breathtaking, ultra-luxurious, and seductive marketing description for a high-end auction prize titled "${newPrize.titleHE}". 
        The target audience is wealthy philanthropists. 
        Provide the response in JSON format with two keys: "he" (Hebrew) and "en" (English). 
        The tone should be extremely premium, enticing, and persuasive. 
        In Hebrew use evocative terms like "יוצא דופן", "מופת של יוקרה", "חוויה שאין שניה לה".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              he: { type: Type.STRING },
              en: { type: Type.STRING }
            },
            required: ["he", "en"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setNewPrize(prev => ({
        ...prev,
        descriptionHE: result.he,
        descriptionEN: result.en
      }));
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert(isHE ? "כשלו בניסיון לייצר תיאור. בדוק את חיבור ה-API שלך." : "Failed to generate description. Check API connection.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.user, loginForm.pass);
    if (!success) {
      alert(isHE ? 'שם משתמש או סיסמא שגויים' : 'Invalid credentials');
    } else {
      setLoginForm({ user: '', pass: '' });
      // אם זה מנהל על, נעביר אותו לטאב הלקוחות מיד
      if (loginForm.user === 'admin') setActiveTab('super');
    }
  };

  const handleDemoLogin = () => {
    login('demo', 'demo');
  };

  // פונקציית הוספת לקוח משופרת הכוללת את כל השדות
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.user || !newClient.pass) return;
    
    // שליחת כל הנתונים לסטור (כולל טלפון ומייל)
    addClient(newClient.name, newClient.user, newClient.pass, newClient.phone, newClient.email);
    
    setNewClient({ name: '', phone: '', email: '', user: '', pass: '' });
    alert(isHE ? 'הלקוח נוסף בהצלחה!' : 'Client added successfully!');
  };

  // פונקציית הוספת תורם ידנית
  const handleManualDonorAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDonorForm.name || !manualDonorForm.amount) {
        alert(isHE ? 'נא למלא שם וסכום' : 'Please fill name and amount');
        return;
    }

    const donorId = Math.random().toString(36).substr(2, 9);
    const newDonor: Donor = {
        id: donorId,
        clientId: auth.clientId,
        name: manualDonorForm.name,
        phone: manualDonorForm.phone,
        email: manualDonorForm.email,
        totalDonated: Number(manualDonorForm.amount),
        packageId: manualDonorForm.packageId || undefined
    };

    addDonor(newDonor);
    if (manualDonorForm.packageId) {
        assignPackageToDonor(donorId, manualDonorForm.packageId);
    }

    setManualDonorForm({ name: '', phone: '', email: '', amount: '', packageId: '' });
    alert(isHE ? 'התורם נוסף בהצלחה!' : 'Donor added successfully!');
  };

  // פונקציה להעתקת לינק הקטלוג הציבורי של הלקוח
  const copyClientPublicLink = (clientId: string) => {
    const url = `${window.location.origin}/#/catalog/${clientId}`;
    navigator.clipboard.writeText(url);
    alert(isHE ? 'קישור הקטלוג הועתק!' : 'Catalog link copied!');
  };

  // פונקציה לפתיחת הקטלוג הציבורי
  const openClientPublicLink = (clientId: string) => {
    const url = `${window.location.origin}/#/catalog/${clientId}`;
    window.open(url, '_blank');
  };

  const downloadExcelTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Phone,Email,Amount\nIsrael Israeli,0501234567,israel@example.com,1800\nSarah Levy,0547778899,sarah@test.com,3600";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mazalix_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAssign = (donorId: string) => {
    const pkgId = selectedManualPkg[donorId];
    if (!pkgId) {
        alert(isHE ? 'נא לבחור מסלול' : 'Please select a route');
        return;
    }
    assignPackageToDonor(donorId, pkgId);
    alert(isHE ? 'התורם שויך בהצלחה!' : 'Donor assigned successfully!');
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-3xl border-t-2 border-[#C2A353] space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black italic">{isHE ? 'כניסת ניהול Mazalix' : 'Mazalix Admin Login'}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{isHE ? 'הזן פרטי גישה למערכת' : 'Secure Access Only'}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">{isHE ? 'שם משתמש' : 'Username'}</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-[#C2A353] text-sm"
                value={loginForm.user}
                onChange={e => setLoginForm({...loginForm, user: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">{isHE ? 'סיסמה' : 'Password'}</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-[#C2A353] text-sm"
                value={loginForm.pass}
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-3">
            <button type="submit" className="w-full luxury-gradient p-4 rounded-xl text-black font-black uppercase tracking-tight shadow-lg hover:scale-[1.02] transition-transform">
                {isHE ? 'כניסה למערכת' : 'Login Now'}
            </button>
            <button type="button" onClick={handleDemoLogin} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                {isHE ? 'כניסת דמו לניהול' : 'Demo Admin Login'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleAddMedia = (type: 'image' | 'video') => {
    const url = prompt(isHE ? 'הזן קישור (URL) למדיה' : 'Enter Media URL');
    if (url) {
      const mediaItem: PrizeMedia = { id: Math.random().toString(36).substr(2, 9), type, url };
      setNewPrize(prev => ({
        ...prev,
        media: [...(prev.media || []), mediaItem]
      }));
    }
  };

  const handleTogglePrizeInPkg = (prizeId: string | 'ALL') => {
    const rules = pkgForm.rules || [];
    const existing = rules.find(r => r.prizeId === prizeId);
    if (existing) {
      setPkgForm(prev => ({ ...prev, rules: rules.filter(r => r.prizeId !== prizeId) }));
    } else {
      setPkgForm(prev => ({ ...prev, rules: [...rules, { prizeId, count: 1 }] }));
    }
  };

  const handleUpdateRuleCount = (prizeId: string | 'ALL', count: number) => {
    setPkgForm(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r => r.prizeId === prizeId ? { ...r, count: Math.max(1, count) } : r)
    }));
  };

  const movePrize = (id: string, direction: 'up' | 'down') => {
    const idx = clientPrizes.findIndex((p: Prize) => p.id === id);
    const newPrizes = [...clientPrizes];
    if (direction === 'up' && idx > 0) {
      [newPrizes[idx], newPrizes[idx - 1]] = [newPrizes[idx - 1], newPrizes[idx]];
    } else if (direction === 'down' && idx < clientPrizes.length - 1) {
      [newPrizes[idx], newPrizes[idx + 1]] = [newPrizes[idx + 1], newPrizes[idx]];
    }
    newPrizes.forEach((p, i) => updatePrize(p.id, { order: i }));
  };

  const onCreatePrize = () => {
    if (!newPrize.titleHE) return;
    addPrize({ ...newPrize, id: 'p' + Math.random().toString(36).substr(2, 9), clientId: auth.clientId, titleEN: newPrize.titleEN || newPrize.titleHE, descriptionEN: newPrize.descriptionEN || '', descriptionHE: newPrize.descriptionHE || '', order: clientPrizes.length } as Prize);
    setNewPrize({ titleHE: '', titleEN: '', descriptionEN: '', descriptionHE: '', value: 0, media: [], status: DrawStatus.OPEN, order: clientPrizes.length, isFeatured: false, isFullPage: false });
  };

  const onCreatePackage = () => {
    if (!pkgForm.nameHE || !pkgForm.minAmount) return;
    addPackage({ ...pkgForm, id: 'pkg' + Math.random().toString(36).substr(2, 9), clientId: auth.clientId, nameEN: pkgForm.nameHE } as Package);
    setPkgForm({ nameHE: '', minAmount: 0, rules: [], image: '', joinLink: '', color: '#C2A353' });
  };

  const copyPublicLink = (prizeId: string) => {
    const url = `${window.location.origin}/#/live/${prizeId}`;
    navigator.clipboard.writeText(url);
    alert(isHE ? 'הלינק הועתק!' : 'Link copied!');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto px-1 md:px-4">
      <div className="flex justify-between items-center glass-card p-3 px-6 rounded-2xl border-l-4 border-[#C2A353]">
        <div className="flex items-center gap-3">
          <Shield size={18} className="gold-text" />
          <h2 className="font-black text-sm italic">{auth.isSuperAdmin ? (isHE ? 'מנהל על - Mazalix' : 'Mazalix Super Admin') : (isHE ? `ניהול: ${auth.user}` : `Admin: ${auth.user}`)}</h2>
        </div>
        <div className="flex items-center gap-4">
          {clientUnmapped.length > 0 && (
            <button onClick={() => setActiveTab('alerts')} className="relative p-2 bg-red-500/10 rounded-full text-red-500 animate-pulse">
               <Bell size={18} />
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">{clientUnmapped.length}</span>
            </button>
          )}
          <button onClick={logout} className="text-gray-500 hover:text-red-500 flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors">
            <LogOut size={12} /> {isHE ? 'התנתקות' : 'Logout'}
          </button>
        </div>
      </div>

      {!auth.isSuperAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { label: isHE ? 'הכנסות' : 'Revenue', val: `₪${clientDonors.reduce((a:any, b:any) => a+b.totalDonated, 0).toLocaleString()}`, icon: <DollarSign size={14} className="text-green-500" /> },
            { label: isHE ? 'כרטיסים' : 'Tickets', val: clientTickets.length.toLocaleString(), icon: <TicketIcon size={14} className="text-blue-500" /> },
            { label: isHE ? 'תורמים' : 'Donors', val: clientDonors.length, icon: <Users size={14} className="text-amber-500" /> },
            { label: isHE ? 'פרסים' : 'Prizes', val: clientPrizes.length, icon: <Gift size={14} className="text-pink-500" /> },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[8px] font-black uppercase mb-0.5">{stat.label}</p>
                <p className="text-sm md:text-base font-black tracking-tight">{stat.val}</p>
              </div>
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">{stat.icon}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <aside className="lg:w-48 w-full glass-card p-1.5 rounded-xl space-y-1 shrink-0 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1 lg:gap-1 scrollbar-hide">
          {auth.isSuperAdmin ? (
            <button onClick={() => setActiveTab('super')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-[10px] md:text-xs font-bold whitespace-nowrap lg:w-full ${activeTab === 'super' ? 'luxury-gradient text-black shadow-md' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}>
              <Shield size={12} /> <span>{isHE ? 'ניהול לקוחות' : 'Manage Clients'}</span>
            </button>
          ) : (
            <>
              {[
                { id: 'prizes', label: isHE ? 'פרסים' : 'Prizes', icon: <Gift size={12} /> },
                { id: 'summary', label: isHE ? 'סיכום' : 'Summary', icon: <BarChart3 size={12} /> },
                { id: 'routes', label: isHE ? 'מסלולים' : 'Routes', icon: <Activity size={12} /> },
                { id: 'donors', label: isHE ? 'תורמים' : 'Donors', icon: <Users size={12} /> },
                { id: 'campaign', label: isHE ? 'הגדרות' : 'Settings', icon: <Settings size={12} /> },
                { id: 'live', label: isHE ? 'לייב' : 'Live', icon: <Video size={12} /> },
                { id: 'alerts', label: isHE ? 'חריגות' : 'Alerts', icon: <AlertCircle size={12} /> },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-[10px] md:text-xs font-bold whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'luxury-gradient text-black shadow-md' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}>
                  {tab.icon} <span>{tab.label}</span>
                </button>
              ))}
            </>
          )}
        </aside>

        <div className="flex-1 w-full glass-card rounded-xl p-4 md:p-6 min-h-[400px] border border-white/5">
          
          {auth.isSuperAdmin && activeTab === 'super' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-base font-black italic flex items-center gap-2">
                  <UserPlus className="gold-text" size={18} /> {isHE ? 'הוספת לקוח חדש' : 'Add New Client'}
                </h2>
              </div>
              
              <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'שם הלקוח / מוסד' : 'Client Name'}</label>
                  <input required className="w-full bg-white/10 p-2.5 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'טלפון' : 'Phone'}</label>
                  <input className="w-full bg-white/10 p-2.5 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'אימייל' : 'Email'}</label>
                  <input type="email" className="w-full bg-white/10 p-2.5 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'שם משתמש לכניסה' : 'Username'}</label>
                  <input required className="w-full bg-white/10 p-2.5 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newClient.user} onChange={e => setNewClient({...newClient, user: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'סיסמת גישה' : 'Password'}</label>
                  <input required type="text" className="w-full bg-white/10 p-2.5 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newClient.pass} onChange={e => setNewClient({...newClient, pass: e.target.value})} />
                </div>
                <button type="submit" className="md:col-span-2 luxury-gradient p-3 rounded-xl text-black font-black text-xs uppercase shadow-lg hover:scale-[1.01] transition-all">
                  {isHE ? 'צור חשבון לקוח' : 'Create Client Account'}
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{isHE ? 'רשימת לקוחות פעילים' : 'Active Clients List'}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {clients && clients.map((client: any) => (
                    <div key={client.id} className="p-3 glass-card rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black gold-text">{client.name?.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-bold">{client.name}</p>
                          <div className="flex gap-2 text-[8px] text-gray-500 italic">
                            <span><Phone size={8} className="inline mr-0.5" />{client.phone}</span>
                            <span><Mail size={8} className="inline mr-0.5" />{client.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => openClientPublicLink(client.id)} className="flex-1 md:flex-none p-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 hover:bg-white/10">
                          <Eye size={12} className="gold-text" /> {isHE ? 'צפה' : 'View'}
                        </button>
                        <button onClick={() => copyClientPublicLink(client.id)} className="flex-1 md:flex-none p-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 hover:bg-white/10">
                          <Copy size={12} className="gold-text" /> {isHE ? 'העתק לינק' : 'Share'}
                        </button>
                        <button className="p-2 text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'summary' && (
             <div className="space-y-6">
                <h2 className="text-base font-black italic flex items-center gap-2"><BarChart3 size={18} className="gold-text"/> {isHE ? 'סיכום כרטיסים והפצה' : 'Gift Ticket Summary'}</h2>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs border-collapse">
                     <thead>
                        <tr className="border-b border-white/10 text-gray-500 font-black uppercase text-[8px] tracking-widest">
                           <th className="py-3 pr-4">{isHE ? 'מתנה' : 'Prize'}</th>
                           <th className="py-3 px-4">{isHE ? 'שווי' : 'Value'}</th>
                           <th className="py-3 px-4 text-center">{isHE ? 'כרטיסים' : 'Tickets'}</th>
                           <th className="py-3 pl-4 text-right">{isHE ? 'סיכוי יחסי' : 'Ratio'}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {clientPrizes.map((p: Prize) => {
                          const count = clientTickets.filter((t: any) => t.prizeId === p.id).length;
                          const ratio = clientTickets.length > 0 ? ((count / clientTickets.length) * 100).toFixed(1) : '0';
                          return (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                               <td className="py-4 pr-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                        <img src={p.media[0]?.url} className="w-full h-full object-cover" />
                                     </div>
                                     <span className="font-bold truncate max-w-[150px]">{isHE ? p.titleHE : p.titleEN}</span>
                                  </div>
                               </td>
                               <td className="py-4 px-4 gold-text font-black italic">₪{p.value.toLocaleString()}</td>
                               <td className="py-4 px-4 text-center">
                                  <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10 font-black">{count.toLocaleString()}</span>
                               </td>
                               <td className="py-4 pl-4 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="text-[10px] font-black">{ratio}%</span>
                                     <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full luxury-gradient" style={{ width: `${ratio}%` }}></div>
                                     </div>
                                  </div>
                               </td>
                            </tr>
                          )
                        })}
                     </tbody>
                   </table>
                </div>
                {clientPrizes.length === 0 && (
                   <p className="text-center py-10 text-gray-600 italic text-xs">{isHE ? 'אין נתונים להצגה' : 'No summary data available'}</p>
                )}
             </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'prizes' && (
             <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <h2 className="text-base font-black italic">{isHE ? 'ניהול קטלוג פרסים' : 'Manage Prize Collection'}</h2>
                  <div className="text-[8px] font-black text-gray-500 uppercase flex items-center gap-1">
                    <Wand2 size={10} className="gold-text" /> Luxury AI Engine Active
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="md:col-span-2 relative">
                      <input 
                        placeholder={isHE ? 'שם המתנה (לדוגמה: רכב חשמלי פרימיום)' : 'Prize Title (e.g. Premium Electric Car)'} 
                        className="w-full bg-white/10 p-3 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353] transition-all" 
                        value={newPrize.titleHE} 
                        onChange={e => setNewPrize({...newPrize, titleHE: e.target.value})} 
                      />
                      <button 
                        onClick={generateAIDescription}
                        disabled={isGeneratingAI}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#C2A353] text-black rounded-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
                        title={isHE ? "ייצר תיאור יוקרתי עם AI" : "Generate Luxury Description with AI"}
                      >
                        {isGeneratingAI ? <RefreshCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      </button>
                    </div>
                    <input placeholder={isHE ? 'שווי מוערך ₪' : 'Market Value ₪'} type="number" className="bg-white/10 p-2 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={newPrize.value || ''} onChange={e => setNewPrize({...newPrize, value: Number(e.target.value)})} />
                    
                    <div className="flex gap-1.5">
                      <div className="flex-1 relative">
                        <button onClick={() => handleAddMedia('image')} className="w-full bg-white/5 p-1.5 rounded-lg text-[9px] font-bold border border-white/10 flex items-center justify-center gap-1 hover:bg-white/10 transition-all"><ImageIcon size={10}/> {isHE ? 'לינק' : 'Link'}</button>
                      </div>
                      <div className="flex-1 relative group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'prize', 'image')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button className="w-full bg-white/5 p-1.5 rounded-lg text-[9px] font-bold border border-white/10 flex items-center justify-center gap-1 group-hover:bg-white/10 transition-all"><Paperclip size={10}/> {isHE ? 'תמונה' : 'Upload'}</button>
                      </div>
                      <div className="flex-1 relative group">
                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'prize', 'video')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button className="w-full bg-white/5 p-1.5 rounded-lg text-[9px] font-bold border border-white/10 flex items-center justify-center gap-1 group-hover:bg-white/10 transition-all"><Video size={10}/> {isHE ? 'וידאו' : 'Video'}</button>
                      </div>
                    </div>

                    <textarea placeholder={isHE ? 'תיאור שיווקי יוקרתי (עברית)' : 'Luxury Description (HE)'} className="md:col-span-2 bg-white/10 p-2 rounded-lg text-xs min-h-[60px] outline-none border border-white/5 focus:border-[#C2A353]" value={newPrize.descriptionHE} onChange={e => setNewPrize({...newPrize, descriptionHE: e.target.value})} />
                    <textarea placeholder={isHE ? 'Luxury Description (English)' : 'Luxury Description (EN)'} className="md:col-span-2 bg-white/10 p-2 rounded-lg text-xs min-h-[60px] outline-none border border-white/5 focus:border-[#C2A353]" value={newPrize.descriptionEN} onChange={e => setNewPrize({...newPrize, descriptionEN: e.target.value})} />
                    
                    <div className="flex gap-1.5">
                      <button onClick={() => setNewPrize(p => ({...p, isFeatured: !p.isFeatured}))} className={`flex-1 p-1.5 rounded-lg text-[9px] font-bold border transition-all ${newPrize.isFeatured ? 'luxury-gradient text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>{isHE ? 'מומלץ' : 'Featured'}</button>
                      <button onClick={() => setNewPrize(p => ({...p, isFullPage: !p.isFullPage}))} className={`flex-1 p-1.5 rounded-lg text-[9px] font-bold border transition-all ${newPrize.isFullPage ? 'luxury-gradient text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>{isHE ? 'דף מלא' : 'Full Page'}</button>
                    </div>
                  </div>
                  <button onClick={onCreatePrize} className="w-full luxury-gradient p-2.5 rounded-xl text-black font-black text-xs uppercase tracking-tight shadow-lg hover:scale-[1.01] transition-transform">{isHE ? 'הוסף לקטלוג' : 'Add to Collection'}</button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {clientPrizes.length === 0 ? (
                    <p className="text-center text-xs text-gray-600 py-10 italic">{isHE ? 'אין פרסים בקטלוג עדיין' : 'No prizes in catalog yet'}</p>
                  ) : (
                    clientPrizes.sort((a:any, b:any) => a.order - b.order).map((p: any, idx: number) => {
                      const prizeTicketCount = clientTickets.filter((t: any) => t.prizeId === p.id).length;
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2 glass-card rounded-xl border border-white/5 group">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col text-gray-600 scale-75">
                              <button onClick={() => movePrize(p.id, 'up')} disabled={idx === 0} className="hover:text-white disabled:opacity-10"><ArrowUp size={12}/></button>
                              <button onClick={() => movePrize(p.id, 'down')} disabled={idx === clientPrizes.length - 1} className="hover:text-white disabled:opacity-10"><ArrowDown size={12}/></button>
                            </div>
                            <img src={p.media[0]?.url} className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                            <div>
                              <p className="text-[10px] font-bold leading-none mb-0.5">{isHE ? p.titleHE : p.titleEN}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[9px] gold-text font-black italic leading-none">₪{p.value.toLocaleString()}</p>
                                <span className="text-[7px] text-gray-500 font-black uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{prizeTicketCount.toLocaleString()} TIX</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => deletePrize(p.id)} className="text-gray-700 hover:text-red-500 p-1.5 transition-colors"><Trash2 size={12}/></button>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black italic text-red-500 flex items-center gap-2"><AlertCircle size={18}/> {isHE ? 'תורמים לטיפול ידני' : 'Donors Needing Attention'}</h2>
                <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[8px] font-black">{clientUnmapped.length} {isHE ? 'מקרים' : 'Issues'}</div>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed italic">{isHE ? 'להלן תורמים שסכום תרומתם לא הגיע לרף המינימלי של אף מסלול. יש לשייך להם כרטיסים באופן ידני.' : 'These donors did not reach any package threshold. Manual ticket assignment is required.'}</p>
              
              <div className="space-y-2">
                {clientUnmapped.length === 0 ? (
                  <div className="text-center py-20 text-gray-700">
                    <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs italic">{isHE ? 'אין חריגות במערכת' : 'No unmapped donors'}</p>
                  </div>
                ) : (
                  clientUnmapped.map((d: Donor) => (
                    <div key={d.id} className="p-4 glass-card border border-red-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:bg-red-500/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center font-black text-red-500">{d.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-black">{d.name}</p>
                          <p className="text-[9px] text-gray-500 tracking-tighter italic">₪{d.totalDonated.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select 
                            className="bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] font-bold outline-none flex-1 md:w-32 focus:border-[#C2A353]"
                            value={selectedManualPkg[d.id] || ''}
                            onChange={(e) => setSelectedManualPkg({...selectedManualPkg, [d.id]: e.target.value})}
                        >
                            <option value="">{isHE ? 'בחר מסלול...' : 'Select...'}</option>
                            {clientPackages.map((pkg: Package) => (
                                <option key={pkg.id} value={pkg.id}>{isHE ? pkg.nameHE : pkg.nameEN}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => handleManualAssign(d.id)}
                            className="p-2 luxury-gradient text-black rounded-lg hover:scale-105 transition-all text-[8px] font-black uppercase whitespace-nowrap"
                        >
                            {isHE ? 'שיוך' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'routes' && (
            <div className="space-y-4">
              <h2 className="text-base font-black italic">{isHE ? 'מסלולי תרומה' : 'Routes'}</h2>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'שם' : 'Name'}</label>
                    <input className="w-full bg-white/10 p-2 rounded-lg text-xs font-bold outline-none" value={pkgForm.nameHE} onChange={e => setPkgForm({...pkgForm, nameHE: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'סכום' : 'Amount'}</label>
                    <input className="w-full bg-white/10 p-2 rounded-lg text-xs font-bold outline-none" type="number" value={pkgForm.minAmount || ''} onChange={e => setPkgForm({...pkgForm, minAmount: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'תמונה' : 'Image'}</label>
                    <div className="flex gap-1">
                      <input placeholder={isHE ? 'URL תמונה' : 'Img URL'} className="flex-1 bg-white/10 p-2 rounded-lg text-[10px]" value={pkgForm.image} onChange={e => setPkgForm({...pkgForm, image: e.target.value})} />
                      <div className="relative group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'package')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button className="bg-[#C2A353] text-black p-2 rounded-lg shadow-lg group-hover:scale-105 transition-all"><Paperclip size={12}/></button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'לינק הצטרפות' : 'Join Link'}</label>
                    <input placeholder={isHE ? 'לינק הצטרפות' : 'Join Link'} className="w-full bg-white/10 p-2 rounded-lg text-[10px]" value={pkgForm.joinLink} onChange={e => setPkgForm({...pkgForm, joinLink: e.target.value})} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'צבע מסלול' : 'Route Color'}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none" value={pkgForm.color} onChange={e => setPkgForm({...pkgForm, color: e.target.value})} />
                      <input type="text" className="flex-1 bg-white/10 p-2 rounded-lg text-[10px] outline-none" value={pkgForm.color} onChange={e => setPkgForm({...pkgForm, color: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{isHE ? 'בחירת פרסים למסלול' : 'Select prizes for route'}</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    <div 
                      onClick={() => handleTogglePrizeInPkg('ALL')}
                      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${pkgForm.rules?.some(r => r.prizeId === 'ALL') ? 'border-[#C2A353] bg-[#C2A353]/10 shadow-lg' : 'border-white/5 bg-white/5 grayscale hover:grayscale-0'}`}
                    >
                      <Layers size={14} className={pkgForm.rules?.some(r => r.prizeId === 'ALL') ? 'gold-text' : 'text-gray-600'} />
                      <span className="text-[7px] font-black uppercase mt-1">{isHE ? 'הכל' : 'ALL'}</span>
                    </div>
                    {clientPrizes.map((p: any) => {
                      const isActive = pkgForm.rules?.some(r => r.prizeId === p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => handleTogglePrizeInPkg(p.id)}
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden flex flex-col cursor-pointer transition-all ${isActive ? 'border-[#C2A353] bg-[#C2A353]/10 shadow-lg' : 'border-white/5 bg-white/5 grayscale hover:grayscale-0'}`}
                        >
                          <img src={p.media[0]?.url} className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-1">
                             <span className="text-[6px] font-black uppercase text-center text-white truncate">{isHE ? p.titleHE : p.titleEN}</span>
                          </div>
                          {isActive && <div className="absolute top-0.5 right-0.5"><CheckCircle size={8} className="gold-text fill-black" /></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {pkgForm.rules && pkgForm.rules.length > 0 && (
                  <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    {pkgForm.rules.map(r => (
                      <div key={r.prizeId} className="flex items-center justify-between gap-2 p-1.5 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold truncate max-w-[120px]">
                          {r.prizeId === 'ALL' ? (isHE ? 'הכל' : 'ALL') : (isHE ? clientPrizes.find(p => p.id === r.prizeId)?.titleHE : 'Prize')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input type="number" className="w-10 bg-black/40 border border-white/10 p-1 rounded text-[10px] text-center font-black outline-none" value={r.count} onChange={(e) => handleUpdateRuleCount(r.prizeId, Number(e.target.value))} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={onCreatePackage} className="w-full luxury-gradient p-2.5 rounded-xl text-black font-black text-xs uppercase tracking-tight shadow-lg">{isHE ? 'צור מסלול' : 'Create Route'}</button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {clientPackages.map((pkg: any) => (
                  <div key={pkg.id} style={{ borderColor: `${pkg.color}40` }} className="p-3 glass-card rounded-xl border flex flex-col gap-2 relative group">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-[11px] leading-tight" style={{ color: pkg.color || '#C2A353' }}>{isHE ? pkg.nameHE : pkg.nameEN}</h4>
                      <button onClick={() => deletePackage(pkg.id)} className="text-red-500/20 hover:text-red-500 transition-all"><Trash2 size={10}/></button>
                    </div>
                    <p className="text-xs font-black italic">₪{pkg.minAmount.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.rules.map((r: any, i: number) => (
                        <span key={i} className="text-[7px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase text-gray-500">
                           {r.prizeId === 'ALL' ? 'ALL' : 'ITEM'} x{r.count}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'donors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black italic">{isHE ? 'תורמים רשומים' : 'Registered Donors'}</h2>
                <button onClick={downloadExcelTemplate} className="text-[9px] font-black gold-text flex items-center gap-1"><Download size={10}/> {isHE ? 'תבנית' : 'Template'}</button>
              </div>

              {/* הוספת תורם ידני - חדש! */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Plus size={12}/> {isHE ? 'הוספת תורם ידני' : 'Add Manual Donor'}</h3>
                <form onSubmit={handleManualDonorAdd} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input placeholder={isHE ? 'שם התורם' : 'Donor Name'} className="bg-white/10 p-2 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={manualDonorForm.name} onChange={e => setManualDonorForm({...manualDonorForm, name: e.target.value})} />
                  <input placeholder={isHE ? 'טלפון' : 'Phone'} className="bg-white/10 p-2 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={manualDonorForm.phone} onChange={e => setManualDonorForm({...manualDonorForm, phone: e.target.value})} />
                  <input type="number" placeholder={isHE ? 'סכום תרומה ₪' : 'Donation Amount ₪'} className="bg-white/10 p-2 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]" value={manualDonorForm.amount} onChange={e => setManualDonorForm({...manualDonorForm, amount: e.target.value})} />
                  <select 
                      className="bg-white/10 p-2 rounded-lg text-xs font-bold outline-none border border-white/5 focus:border-[#C2A353]"
                      value={manualDonorForm.packageId}
                      onChange={e => setManualDonorForm({...manualDonorForm, packageId: e.target.value})}
                  >
                      <option value="">{isHE ? 'בחר מסלול (אופציונלי)' : 'Select Route (Optional)'}</option>
                      {clientPackages.map((pkg: any) => (
                          <option key={pkg.id} value={pkg.id}>{isHE ? pkg.nameHE : pkg.nameEN}</option>
                      ))}
                  </select>
                  <button type="submit" className="md:col-span-2 luxury-gradient p-2.5 rounded-xl text-black font-black text-[10px] uppercase shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                      <UserCheck size={14}/> {isHE ? 'הוסף תורם' : 'Add Donor'}
                  </button>
                </form>
              </div>
              
              <div className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all border-white/10 hover:border-[#C2A353] bg-white/5">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleExcelImport} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                {isImporting ? <RefreshCcw size={20} className="mx-auto text-[#C2A353] animate-spin" /> : <Upload size={20} className="mx-auto text-gray-600" />}
                <p className="text-[10px] mt-1 font-bold text-gray-400">
                  {isHE ? 'לחץ להעלאת קובץ אקסל (שיוך אוטומטי)' : 'Click to upload Excel (Auto-Map)'}
                </p>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {clientDonors.length === 0 ? (
                  <p className="text-center text-xs text-gray-600 py-10 italic">{isHE ? 'אין תורמים רשומים עדיין' : 'No registered donors yet'}</p>
                ) : (
                  clientDonors.map((d: Donor) => {
                    const assignedPkg = clientPackages.find((p: Package) => p.id === d.packageId);
                    return (
                        <div key={d.id} className="p-3 glass-card rounded-xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black gold-text border border-white/10">{d.name.charAt(0)}</div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate">{d.name}</p>
                                <div className="flex items-center gap-1">
                                    <Activity size={8} className={assignedPkg ? 'text-green-500' : 'text-red-500'} />
                                    <p className={`text-[7px] font-black uppercase italic ${assignedPkg ? 'text-gray-400' : 'text-red-500'}`}>
                                        {assignedPkg ? (isHE ? assignedPkg.nameHE : assignedPkg.nameEN) : (isHE ? 'טרם שויך' : 'UNMAPPED')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] font-black gold-text italic tracking-tighter">₪{d.totalDonated.toLocaleString()}</p>
                        </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'campaign' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-black italic">{isHE ? 'הגדרות קמפיין' : 'Campaign Settings'}</h2>
                  {/* כפתור השמירה החדש */}
                  <button 
                    onClick={handleSaveCampaignSettings}
                    disabled={isSavingCampaign}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg ${
                      showSaveSuccess ? 'bg-green-500 text-white' : 'luxury-gradient text-black hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isSavingCampaign ? <Loader2 size={14} className="animate-spin" /> : (showSaveSuccess ? <CheckCircle size={14} /> : <Save size={14} />)}
                    {isSavingCampaign ? (isHE ? 'שומר...' : 'Saving...') : (showSaveSuccess ? (isHE ? 'נשמר בהצלחה!' : 'Saved!') : (isHE ? 'שמור הגדרות' : 'Save Settings'))}
                  </button>
                </div>

                {/* --- איזור לינק ציבורי ייחודי - חדש! --- */}
                <div className="bg-[#C2A353]/5 border border-[#C2A353]/20 rounded-2xl p-4 md:p-6 space-y-4 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl luxury-gradient flex items-center justify-center text-black">
                      <Layout size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black italic uppercase">{isHE ? 'לינק קטלוג ציבורי' : 'Public Catalog Link'}</h3>
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{isHE ? 'הלינק הייחודי לשיתוף הקמפיין שלך' : 'Your unique campaign sharing URL'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between group">
                      <code className="text-[10px] gold-text font-bold truncate">
                        {`${window.location.origin}/#/catalog/${auth.clientId}`}
                      </code>
                      <button 
                        onClick={() => copyClientPublicLink(auth.clientId)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-[#C2A353] transition-colors"
                        title={isHE ? 'העתק לינק' : 'Copy Link'}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => openClientPublicLink(auth.clientId)}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} className="gold-text" /> {isHE ? 'צפה בקטלוג' : 'Open'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'שם' : 'Name'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-xs font-bold outline-none focus:border-[#C2A353]" value={campaign.nameHE} onChange={e => updateCampaign({nameHE: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'תאריך' : 'Draw Date'}</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-xs font-bold outline-none focus:border-[#C2A353]" value={campaign.drawDate} onChange={e => updateCampaign({drawDate: e.target.value})} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'לינק תרומות' : 'Donation URL'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] focus:border-[#C2A353]" value={campaign.donationUrl} onChange={e => updateCampaign({donationUrl: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'לוגו URL' : 'Logo URL'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] focus:border-[#C2A353]" value={campaign.logo} onChange={e => updateCampaign({logo: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'באנר (תמונה) URL' : 'Banner (Image) URL'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] focus:border-[#C2A353]" value={campaign.banner} onChange={e => updateCampaign({banner: e.target.value})} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[8px] font-black text-gray-500 uppercase">{isHE ? 'סרטון רקע URL' : 'Video Background URL'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] focus:border-[#C2A353]" value={campaign.videoUrl || ''} onChange={e => updateCampaign({videoUrl: e.target.value})} placeholder="https://example.com/video.mp4" />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <button onClick={() => {if(confirm(isHE ? 'לאפס הכל?' : 'Reset everything?')) resetData()}} className="text-gray-700 hover:text-red-500 text-[10px] font-bold uppercase transition-colors">{isHE ? 'איפוס כל נתוני הקמפיין' : 'Reset All Campaign Data'}</button>
                </div>
             </div>
          )}

          {!auth.isSuperAdmin && activeTab === 'live' && (
            <div className="space-y-4">
              <h2 className="text-base font-black italic">{isHE ? 'מרכז הגרלות לייב' : 'Live Draw Center'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientPrizes.length === 0 ? (
                    <p className="col-span-2 text-center text-xs text-gray-600 py-10 italic">{isHE ? 'אין פרסים להגרלה' : 'No prizes available for drawing'}</p>
                ) : (
                    clientPrizes.map((p: any) => (
                    <div key={p.id} className="p-4 glass-card rounded-xl flex flex-col justify-between border border-white/5 group hover:border-[#C2A353]/30 transition-all">
                        <div className="flex gap-4 items-start mb-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                <img src={p.media[0]?.url} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm leading-tight truncate mb-1">{isHE ? p.titleHE : p.titleEN}</p>
                                <div className="flex items-center gap-2">
                                    <TicketIcon size={10} className="text-blue-500" />
                                    <span className="text-[9px] text-gray-400 font-black uppercase">{clientTickets.filter((t:any)=>t.prizeId===p.id).length.toLocaleString()} {isHE ? 'כרטיסים' : 'TICKETS'}</span>
                                </div>
                            </div>
                            <button onClick={() => copyPublicLink(p.id)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Copy size={12}/></button>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/draw/${p.id}`} className={`flex items-center justify-center gap-2 flex-1 text-center py-2.5 rounded-xl font-black text-xs transition-all ${p.status === DrawStatus.DRAWN ? 'bg-white/5 text-gray-500' : 'luxury-gradient text-black shadow-lg hover:scale-[1.02]'}`}>
                              <Play size={12} fill="currentColor" />
                              {isHE ? 'הפעל הגרלה' : 'Start Live Draw'}
                            </Link>
                            <Link to={`/live/${p.id}`} target="_blank" className="p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><ExternalLink size={16}/></Link>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;