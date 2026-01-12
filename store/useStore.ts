import { useState, useEffect, useCallback, useMemo } from 'react';
import { Prize, Package, Donor, Ticket, Language, DrawStatus, CampaignSettings, Client, UserAuth } from '../types';
import { INITIAL_PRIZES, INITIAL_PACKAGES, INITIAL_CAMPAIGN } from '../constants';

// Key for local storage
const LS_KEY = 'mazalix_v1';
const API_URL = ""; // השרת מגיש את האפליקציה באותה כתובת

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

  // --- פונקציה מרכזית לטעינת נתונים מבודדת ---
  const fetchAllData = async () => {
    try {
      const [cRes, pRes, pkgRes, dRes, tRes] = await Promise.all([
        fetch(`${API_URL}/api/clients`),
        fetch(`${API_URL}/api/prizes`),
        fetch(`${API_URL}/api/packages`),
        fetch(`${API_URL}/api/donors`),
        fetch(`${API_URL}/api/tickets`) // הוספת טעינת כרטיסים מהמסד
      ]);
      
      if (cRes.ok) {
        const dbClients = await cRes.json();
        setClients(dbClients);
        
        // טעינת הגדרות קמפיין ספציפיות למנהל המחובר
        if (auth.clientId && !auth.isSuperAdmin) {
          const currentClient = dbClients.find((c: any) => c.id === auth.clientId);
          if (currentClient?.campaign) {
            setCampaign(currentClient.campaign);
          }
        }
      }
      
      // סינון נתונים: אם מנהל מחובר - רואה רק שלו. אם SuperAdmin - רואה הכל.
      const filterByClient = (data: any[]) => 
        auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin 
          ? data.filter((item: any) => item.clientId === auth.clientId)
          : data;

      if (pRes.ok) setPrizes(filterByClient(await pRes.json()).sort((a: any, b: any) => a.order - b.order));
      if (pkgRes.ok) setPackages(filterByClient(await pkgRes.json()));
      if (dRes.ok) setDonors(filterByClient(await dRes.json()));
      if (tRes.ok) setTickets(filterByClient(await tRes.json()));

    } catch (e) {
      console.error("טעינה מהמסד נכשלה", e);
    }
  };

  // טעינה ראשונית וסינכרון בזמן שינוי זהות משתמש
  useEffect(() => {
    fetchAllData();
  }, [auth.clientId, auth.isSuperAdmin, auth.isLoggedIn]);

  // שמירת ה-Auth בלבד ב-LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LS_KEY}_auth`, JSON.stringify(auth));
  }, [auth]);

  const login = (username: string, pass: string) => {
    // מנהל על
    if (username === 'DA1234' && pass === 'DA1234') {
      const newAuth = { isLoggedIn: true, isSuperAdmin: true, clientId: 'super' };
      setAuth(newAuth);
      return true;
    }
    // דמו
    if (username === 'demo' && pass === 'demo') {
        setAuth({ isLoggedIn: true, isSuperAdmin: false, clientId: 'demo-client' });
        return true;
    }
    // לקוחות רגילים
    const client = clients.find(c => (c.username === username || c.displayName === username) && c.password === pass);
    if (client) {
      const newAuth = { isLoggedIn: true, isSuperAdmin: false, clientId: client.id };
      setAuth(newAuth);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, isSuperAdmin: false });
    resetData();
    localStorage.removeItem(`${LS_KEY}_auth`);
  };

  const addClient = async (displayName: string, user: string, pass: string, phone?: string, email?: string) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
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
      await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      setClients(prev => [...prev, newClient]);
    } catch (e) { console.error(e); }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === Language.HE ? Language.EN : Language.HE);
  };

  const updateCampaign = async (updates: Partial<CampaignSettings>) => {
    const newCampaign = { ...campaign, ...updates };
    setCampaign(newCampaign);
    
    if (auth.clientId && !auth.isSuperAdmin) {
      try {
        const res = await fetch(`${API_URL}/api/clients/${auth.clientId}/campaign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign: newCampaign })
        });
        if (res.ok) {
          // עדכון מקומי של רשימת הלקוחות כדי שהקטלוג יתעדכן מיידית
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
      const savedPrize = await res.json();
      setPrizes(prev => [...prev, savedPrize].sort((a, b) => a.order - b.order));
    } catch (e) { console.error(e); }
  };

  const deletePrize = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/prizes/${id}`, { method: 'DELETE' });
      setPrizes(prev => prev.filter(p => p.id !== id));
      setTickets(prev => prev.filter(t => t.prizeId !== id));
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
      const savedPkg = await res.json();
      setPackages(prev => [...prev, savedPkg]);
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

  // --- פונקציה לשמירת כרטיסים למסד הנתונים ---
  const saveTicketsToDb = async (newTickets: Ticket[]) => {
    for (const ticket of newTickets) {
      try {
        await fetch(`${API_URL}/api/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...ticket, clientId: auth.clientId })
        });
      } catch (e) { console.error("שגיאה בשמירת כרטיס", e); }
    }
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
      const savedDonor = await res.json();
      setDonors(prev => [...prev, savedDonor]);

      if (matched) {
        const newTickets: Ticket[] = [];
        matched.rules.forEach(rule => {
          const targetPrizeIds = rule.prizeId === 'ALL' ? prizes.map(p => p.id) : [rule.prizeId];
          targetPrizeIds.forEach(pId => {
            for (let i = 0; i < rule.count; i++) {
              newTickets.push({
                id: Math.random().toString(36).substr(2, 9),
                donorId: savedDonor.id,
                prizeId: pId,
                createdAt: Date.now(),
                clientId: auth.clientId
              });
            }
          });
        });
        setTickets(prev => [...prev, ...newTickets]);
        await saveTicketsToDb(newTickets);
      }
    } catch (e) { console.error(e); }
  };

  const assignPackageToDonor = async (donorId: string, packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    try {
      // 1. עדכון התורם במסד
      await fetch(`${API_URL}/api/donors/${donorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });
      
      // 2. מחיקת כרטיסים ישנים של התורם (במידה ויש)
      const oldTickets = tickets.filter(t => t.donorId === donorId);
      for (const t of oldTickets) {
        await fetch(`${API_URL}/api/tickets/${t.id}`, { method: 'DELETE' });
      }

      // 3. יצירת כרטיסים חדשים
      const newTickets: Ticket[] = [];
      pkg.rules.forEach(rule => {
        const targetPrizeIds = rule.prizeId === 'ALL' ? prizes.map(p => p.id) : [rule.prizeId];
        targetPrizeIds.forEach(pId => {
          for (let i = 0; i < rule.count; i++) {
            newTickets.push({
              id: Math.random().toString(36).substr(2, 9),
              donorId: donorId,
              prizeId: pId,
              createdAt: Date.now(),
              clientId: auth.clientId
            });
          }
        });
      });

      setDonors(prev => prev.map(d => d.id === donorId ? { ...d, packageId } : d));
      setTickets(prev => [...prev.filter(t => t.donorId !== donorId), ...newTickets]);
      await saveTicketsToDb(newTickets);
    } catch (e) { console.error(e); }
  };

  const performDraw = async (prizeId: string) => {
    const prizeTickets = tickets.filter(t => t.prizeId === prizeId);
    if (prizeTickets.length === 0) return null;
    const winnerIndex = Math.floor(Math.random() * prizeTickets.length);
    const winner = donors.find(d => d.id === prizeTickets[winnerIndex].donorId);
    if (winner) {
      await updatePrize(prizeId, { status: DrawStatus.DRAWN, winnerId: winner.id });
      return winner;
    }
    return null;
  };

  const resetData = () => {
    setPrizes([]);
    setPackages([]);
    setCampaign(INITIAL_CAMPAIGN);
    setDonors([]);
    setTickets([]);
  };

  const unmappedDonors = useMemo(() => {
    return donors.filter(d => !d.packageId);
  }, [donors]);

  return {
    lang, toggleLanguage, auth, login, logout, clients, addClient, campaign, updateCampaign, prizes, packages, donors, tickets, addPrize, deletePrize, updatePrize, addPackage, deletePackage, updatePackage, addDonor, performDraw, resetData, unmappedDonors, assignPackageToDonor
  };
}