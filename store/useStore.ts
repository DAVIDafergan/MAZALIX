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

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${LS_KEY}_clients`);
    return saved ? JSON.parse(saved) : [];
  });

  const [campaign, setCampaign] = useState<CampaignSettings>(INITIAL_CAMPAIGN);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // --- פונקציה לטעינת נתונים מה-MongoDB ---
  const fetchAllData = async () => {
    try {
      const [cRes, pRes, pkgRes, dRes] = await Promise.all([
        fetch(`${API_URL}/api/clients`),
        fetch(`${API_URL}/api/prizes`),
        fetch(`${API_URL}/api/packages`),
        fetch(`${API_URL}/api/donors`)
      ]);
      
      if (cRes.ok) {
        const dbClients = await cRes.json();
        setClients(dbClients);
        
        // --- תיקון: טעינת הגדרות קמפיין מהמסד ללקוח המחובר ---
        if (auth.clientId && !auth.isSuperAdmin) {
          const currentClient = dbClients.find((c: any) => c.id === auth.clientId);
          if (currentClient?.campaign) {
            console.log("✅ נטענו הגדרות קמפיין מהמסד:", currentClient.campaign.nameHE);
            setCampaign(currentClient.campaign);
          }
        }
      }
      
      if (pRes.ok) {
        const allPrizes = await pRes.json();
        if (auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin) {
            setPrizes(allPrizes.filter((p: any) => p.clientId === auth.clientId));
        } else {
            setPrizes(allPrizes);
        }
      }
      if (pkgRes.ok) {
        const allPkgs = await pkgRes.json();
        if (auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin) {
            setPackages(allPkgs.filter((p: any) => p.clientId === auth.clientId));
        } else {
            setPackages(allPkgs);
        }
      }
      if (dRes.ok) {
        const allDonors = await dRes.json();
        if (auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin) {
            setDonors(allDonors.filter((d: any) => d.clientId === auth.clientId));
        } else {
            setDonors(allDonors);
        }
      }
    } catch (e) {
      console.error("טעינה מהמסד נכשלה", e);
    }
  };

  // --- מנגנון סינכרון אוטומטי (Migration) למסד הנתונים ---
  const syncLocalDataToDb = async () => {
    if (!auth.isLoggedIn) return;
    
    // סנכרון לקוחות קיימים
    for (const client of clients) {
       await fetch(`${API_URL}/api/clients`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(client)
       });
    }

    // סנכרון פרסים קיימים של הלקוח המחובר
    if (auth.clientId && !auth.isSuperAdmin) {
        for (const prize of prizes) {
          await fetch(`${API_URL}/api/prizes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...prize, clientId: auth.clientId })
          });
        }
    }

    console.log("✅ סינכרון למסד הנתונים הושלם");
    fetchAllData();
  };

  // טעינה ראשונית של הכל מהמסד (קורה פעם אחת בריענון)
  useEffect(() => {
    fetchAllData();
  }, [auth.clientId, auth.isSuperAdmin, auth.isLoggedIn]);

  // הפעלת סינכרון כשמנהל מתחבר ויש לו נתונים מקומיים
  useEffect(() => {
    if (auth.isLoggedIn && (clients.length > 0 || prizes.length > 0)) {
        syncLocalDataToDb();
    }
  }, [auth.isLoggedIn]);

  // --- תיקון: מניעת דריסת נתוני Database על ידי localStorage ישן ---
  useEffect(() => {
    if (auth.isLoggedIn && auth.clientId) {
      if (auth.isSuperAdmin) {
        // Super admin context
      } else {
        // הוסר הקוד שטען קמפיין מ-localStorage כדי שרק ה-Database יקבע
      }
    }
  }, [auth.isLoggedIn, auth.clientId, auth.isSuperAdmin]);

  // Persist current context data (שומר רק Auth ורשימת לקוחות בזיכרון מקומי)
  useEffect(() => {
    localStorage.setItem(`${LS_KEY}_auth`, JSON.stringify(auth));
    localStorage.setItem(`${LS_KEY}_clients`, JSON.stringify(clients));
  }, [auth, clients]);

  const login = (username: string, pass: string) => {
    if (username === 'DA1234' && pass === 'DA1234') {
      const newAuth = { isLoggedIn: true, isSuperAdmin: true, clientId: 'super' };
      setAuth(newAuth);
      return true;
    }

    if (username === 'demo' && pass === 'demo') {
        setAuth({ isLoggedIn: true, isSuperAdmin: false, clientId: 'demo-client' });
        return true;
    }
    
    const client = clients.find(c => (c.username === username || c.displayName === username) && c.password === pass);
    if (client) {
      const newAuth = { isLoggedIn: true, isSuperAdmin: false, clientId: client.id };
      setAuth(newAuth);
      // טעינה מיידית אחרי התחברות
      setTimeout(fetchAllData, 100);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, isSuperAdmin: false });
    resetData();
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
      email
    };

    try {
      await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
    } catch (e) { console.error(e); }

    setClients(prev => [...prev, newClient]);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === Language.HE ? Language.EN : Language.HE);
  };

  // --- תיקון: עדכון קמפיין ששולח ישירות לשרת ושומר במסד ---
  const updateCampaign = async (updates: Partial<CampaignSettings>) => {
    const newCampaign = { ...campaign, ...updates };
    setCampaign(newCampaign);
    
    if (auth.clientId && !auth.isSuperAdmin) {
      try {
        console.log("📡 שומר הגדרות קמפיין למסד הנתונים...");
        const res = await fetch(`${API_URL}/api/clients/${auth.clientId}/campaign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign: newCampaign })
        });
        if (res.ok) console.log("✅ נשמר ב-DB");
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
    } catch (e) { 
      console.error(e); 
      setPrizes(prev => [...prev, prize].sort((a, b) => a.order - b.order));
    }
  };

  const deletePrize = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/prizes/${id}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
    setPrizes(prev => prev.filter(p => p.id !== id));
    setTickets(prev => prev.filter(t => t.prizeId !== id));
  };

  const updatePrize = async (id: string, updates: Partial<Prize>) => {
    try {
      await fetch(`${API_URL}/api/prizes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) { console.error(e); }
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => a.order - b.order));
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
    } catch (e) { 
      console.error(e); 
      setPackages(prev => [...prev, pkg]);
    }
  };

  const deletePackage = async (id: string) => {
    try { await fetch(`${API_URL}/api/packages/${id}`, { method: 'DELETE' }); } catch (e) { console.error(e); }
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      await fetch(`${API_URL}/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) { console.error(e); }
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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
      setDonors(prev => {
        const exists = prev.find(d => d.phone === savedDonor.phone);
        if (exists) return prev;
        return [...prev, savedDonor];
      });
    } catch (e) { 
      console.error(e); 
      setDonors(prev => {
        const exists = prev.find(d => d.phone === donor.phone);
        if (exists) return prev;
        return [...prev, donorWithPkg as Donor];
      });
    }
    
    if (matched) {
      const newTickets: Ticket[] = [];
      matched.rules.forEach(rule => {
        if (rule.prizeId === 'ALL') {
          prizes.forEach(prize => {
            for (let i = 0; i < rule.count; i++) {
              newTickets.push({
                id: Math.random().toString(36).substr(2, 9),
                donorId: donor.id,
                prizeId: prize.id,
                createdAt: Date.now()
              });
            }
          });
        } else {
          for (let i = 0; i < rule.count; i++) {
            newTickets.push({
              id: Math.random().toString(36).substr(2, 9),
              donorId: donor.id,
              prizeId: rule.prizeId,
              createdAt: Date.now()
            });
          }
        }
      });
      setTickets(prev => [...prev, ...newTickets]);
    }
  };

  const assignPackageToDonor = (donorId: string, packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    setDonors(prev => prev.map(d => d.id === donorId ? { ...d, packageId } : d));
    setTickets(prev => prev.filter(t => t.donorId !== donorId));
    const newTickets: Ticket[] = [];
    pkg.rules.forEach(rule => {
      if (rule.prizeId === 'ALL') {
        prizes.forEach(prize => {
          for (let i = 0; i < rule.count; i++) {
            newTickets.push({
              id: Math.random().toString(36).substr(2, 9),
              donorId: donorId,
              prizeId: prize.id,
              createdAt: Date.now()
            });
          }
        });
      } else {
        for (let i = 0; i < rule.count; i++) {
          newTickets.push({
            id: Math.random().toString(36).substr(2, 9),
            donorId: donorId,
            prizeId: rule.prizeId,
            createdAt: Date.now()
          });
        }
      }
    });
    setTickets(prev => [...prev, ...newTickets]);
  };

  const performDraw = (prizeId: string) => {
    const prizeTickets = tickets.filter(t => t.prizeId === prizeId);
    if (prizeTickets.length === 0) return null;
    const winnerIndex = Math.floor(Math.random() * prizeTickets.length);
    const winner = donors.find(d => d.id === prizeTickets[winnerIndex].donorId);
    if (winner) {
      updatePrize(prizeId, { status: DrawStatus.DRAWN, winnerId: winner.id });
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
    if (packages.length === 0) return [];
    return donors.filter(d => !d.packageId);
  }, [donors, packages]);

  return {
    lang, toggleLanguage, auth, login, logout, clients, addClient, campaign, updateCampaign, prizes, packages, donors, tickets, addPrize, deletePrize, updatePrize, addPackage, deletePackage, updatePackage, addDonor, performDraw, resetData, unmappedDonors, assignPackageToDonor
  };
}