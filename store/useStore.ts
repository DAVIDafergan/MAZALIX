import { useState, useEffect, useCallback, useMemo } from 'react';
import { Prize, Package, Donor, Ticket, Language, DrawStatus, CampaignSettings, Client, UserAuth } from '../types';
import { INITIAL_PRIZES, INITIAL_PACKAGES, INITIAL_CAMPAIGN } from '../constants';

const LS_KEY = 'mazalix_v1';
// הכתובת המעודכנת של השרת שלך ב-Railway
const API_URL = "https://mazalix-production.up.railway.app"; 

export function useStore() {
  const [lang, setLang] = useState<Language>(Language.HE);
  const [auth, setAuth] = useState<UserAuth>(() => {
    const saved = localStorage.getItem(`${LS_KEY}_auth`);
    return saved ? JSON.parse(saved) : { isLoggedIn: false, isSuperAdmin: false };
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [campaign, setCampaign] = useState<CampaignSettings>(INITIAL_CAMPAIGN);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // טעינה מבודדת של נתונים מהמסד
  const fetchAllData = useCallback(async () => {
    try {
      const [cRes, pRes, pkgRes, dRes, tRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/clients`),
        fetch(`${API_URL}/api/prizes`),
        fetch(`${API_URL}/api/packages`),
        fetch(`${API_URL}/api/donors`),
        fetch(`${API_URL}/api/tickets`),
        fetch(`${API_URL}/api/settings`) // שאיבת הגדרות מהטבלה החדשה
      ]);
      
      if (cRes.ok) {
        const dbClients = await cRes.json();
        setClients(dbClients);
        
        // שליפת הגדרות קמפיין מתוך אובייקט הלקוח המחובר
        if (auth.clientId && !auth.isSuperAdmin) {
          const currentClient = dbClients.find((c: any) => c.id === auth.clientId);
          if (currentClient?.campaign) {
            setCampaign(currentClient.campaign);
          }
        }
      }

      // אם המשתמש הוא מנהל על, נטען את ההגדרות הגלובליות מהמסד
      if (auth.isSuperAdmin && sRes.ok) {
        const globalSettings = await sRes.json();
        if (Array.isArray(globalSettings) && globalSettings.length > 0) {
          setCampaign(globalSettings[0]); // ההגדרה הראשונה במסד היא הקובעת
        }
      }
      
      const filterByClient = (data: any[]) => 
        auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin 
          ? data.filter((item: any) => item.clientId === auth.clientId)
          : data;

      if (pRes.ok) setPrizes(filterByClient(await pRes.json()).sort((a: any, b: any) => a.order - b.order));
      if (pkgRes.ok) setPackages(filterByClient(await pkgRes.json()));
      if (dRes.ok) setDonors(filterByClient(await dRes.json()));
      if (tRes.ok) setTickets(filterByClient(await tRes.json()));

    } catch (e) { console.error("טעינה מהמסד נכשלה", e); }
  }, [auth.clientId, auth.isSuperAdmin, auth.isLoggedIn]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}_auth`, JSON.stringify(auth));
  }, [auth]);

  // פונקציית התחברות מתוקנת שקולטת clientId מהשרת
  const login = async (username: string, pass: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });

      const data = await response.json();

      if (data.success) {
        // שמירת הטוקן עבור בקשות API מוגנות
        localStorage.setItem(`${LS_KEY}_admin_token`, data.token);
        
        // עדכון ה-State עם ה-clientId שחזר מהשרת (מונע undefined)
        setAuth({ 
          isLoggedIn: true, 
          isSuperAdmin: data.isSuperAdmin, 
          clientId: data.clientId 
        });
        return true;
      }
    } catch (e) {
      console.error("Login API error:", e);
    }

    // Fallback למקרה של לקוחות רגילים שעדיין לא בשרת (תאימות לאחור)
    const client = clients.find(c => (c.username === username || c.displayName === username) && c.password === pass);
    if (client) {
      setAuth({ isLoggedIn: true, isSuperAdmin: false, clientId: client.id });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, isSuperAdmin: false });
    resetData();
    localStorage.removeItem(`${LS_KEY}_auth`);
    localStorage.removeItem(`${LS_KEY}_admin_token`);
  };

  const addClient = async (displayName: string, user: string, pass: string, phone?: string, email?: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newClient: Client = {
      id: newId,
      username: user,
      password: pass,
      displayName,
      createdAt: Date.now(),
      isActive: true,
      phone,
      email,
      campaign: INITIAL_CAMPAIGN
    };
    try {
      const token = localStorage.getItem(`${LS_KEY}_admin_token`);
      await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': token || '' 
        },
        body: JSON.stringify(newClient)
      });
      setClients(prev => [...prev, newClient]);
    } catch (e) { console.error(e); }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === Language.HE ? Language.EN : Language.HE);
  };

  // פונקציית עדכון קמפיין משופרת
  const updateCampaign = async (updates: Partial<CampaignSettings>) => {
    const newCampaign = { ...campaign, ...updates };
    setCampaign(newCampaign);

    if (auth.isSuperAdmin) {
      try {
        await fetch(`${API_URL}/api/settings/global`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCampaign)
        });
      } catch (e) { console.error("❌ שגיאה בשמירת הגדרות גלובליות:", e); }
    } else if (auth.clientId) {
      try {
        const res = await fetch(`${API_URL}/api/clients/${auth.clientId}/campaign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign: newCampaign })
        });
        
        if (res.ok) {
           // סנכרון רשימת הלקוחות כדי שהקטלוג יתעדכן מיד
           setClients(prev => prev.map(c => c.id === auth.clientId ? { ...c, campaign: newCampaign } : c));
        }
      } catch (e) { console.error("❌ שגיאה בשמירת קמפיין:", e); }
    }
  };

  const addPrize = async (prize: Prize) => {
    const prizeWithClient = { ...prize, clientId: auth.clientId };
    try {
      const res = await fetch(`${API_URL}/api/prizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prizeWithClient)
      });
      const saved = await res.json();
      setPrizes(prev => [...prev, saved].sort((a, b) => a.order - b.order));
    } catch (e) { console.error(e); }
  };

  const deletePrize = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/prizes/${id}`, { method: 'DELETE' });
      setPrizes(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const updatePrize = async (id: string, updates: Partial<Prize>) => {
    try {
      await fetch(`${API_URL}/api/prizes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => a.order - b.order));
    } catch (e) { console.error(e); }
  };

  const addPackage = async (pkg: Package) => {
    const pkgWithClient = { ...pkg, clientId: auth.clientId };
    try {
      const res = await fetch(`${API_URL}/api/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkgWithClient)
      });
      const saved = await res.json();
      setPackages(prev => [...prev, saved]);
    } catch (e) { console.error(e); }
  };

  const deletePackage = async (id: string) => {
    try { 
      await fetch(`${API_URL}/api/packages/${id}`, { method: 'DELETE' }); 
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      await fetch(`${API_URL}/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (e) { console.error(e); }
  };

  const addDonor = async (donor: Donor) => {
    const matched = [...packages].sort((a, b) => b.minAmount - a.minAmount).find(p => donor.totalDonated >= p.minAmount);
    const donorWithPkg = { ...donor, packageId: matched?.id, clientId: auth.clientId };
    try {
      const res = await fetch(`${API_URL}/api/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorWithPkg)
      });
      const saved = await res.json();
      setDonors(prev => [...prev, saved]);
      if (matched) {
        const newTix: Ticket[] = [];
        matched.rules.forEach(rule => {
          const ids = rule.prizeId === 'ALL' ? prizes.map(p => p.id) : [rule.prizeId];
          ids.forEach(pId => {
            for (let i = 0; i < rule.count; i++) {
              newTix.push({ id: Math.random().toString(36).substr(2, 9), donorId: saved.id, prizeId: pId, createdAt: Date.now(), clientId: auth.clientId });
            }
          });
        });
        for (const t of newTix) {
          await fetch(`${API_URL}/api/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) });
        }
        setTickets(prev => [...prev, ...newTix]);
      }
    } catch (e) { console.error(e); }
  };

  const deleteDonor = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/donors/${id}`, { method: 'DELETE' });
      setDonors(prev => prev.filter(d => d.id !== id));
      setTickets(prev => prev.filter(t => t.donorId !== id)); // ניקוי כרטיסים משויכים ב-State
    } catch (e) { console.error(e); }
  };

  const assignPackageToDonor = async (donorId: string, packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    try {
      await fetch(`${API_URL}/api/donors/${donorId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId }) });
      setDonors(prev => prev.map(d => d.id === donorId ? { ...d, packageId } : d));
      fetchAllData(); 
    } catch (e) { console.error(e); }
  };

  const performDraw = async (prizeId: string) => {
    const prizeTickets = tickets.filter(t => t.prizeId === prizeId);
    if (prizeTickets.length === 0) return null;
    const winner = donors.find(d => d.id === prizeTickets[Math.floor(Math.random() * prizeTickets.length)].donorId);
    if (winner) {
      await updatePrize(prizeId, { status: DrawStatus.DRAWN, winnerId: winner.id });
      return winner;
    }
    return null;
  };

  const resetData = () => {
    setPrizes([]); setPackages([]); setCampaign(INITIAL_CAMPAIGN); setDonors([]); setTickets([]);
  };

  const unmappedDonors = useMemo(() => donors.filter(d => !d.packageId), [donors]);

  return {
    lang, toggleLanguage, auth, login, logout, clients, addClient, campaign, updateCampaign, prizes, packages, donors, tickets, addPrize, deletePrize, updatePrize, addPackage, deletePackage, updatePackage, addDonor, deleteDonor, performDraw, resetData, unmappedDonors, assignPackageToDonor
  };
}