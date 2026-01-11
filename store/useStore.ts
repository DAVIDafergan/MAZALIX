
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Prize, Package, Donor, Ticket, Language, DrawStatus, CampaignSettings, Client, UserAuth } from '../types';
import { INITIAL_PRIZES, INITIAL_PACKAGES, INITIAL_CAMPAIGN } from '../constants';

// Key for local storage
const LS_KEY = 'mazalix_v1';

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

  // Effect to handle state silo based on clientId
  useEffect(() => {
    if (auth.isLoggedIn && auth.clientId) {
      if (auth.isSuperAdmin) {
        // Super admin context
      } else {
        const savedData = localStorage.getItem(`${LS_KEY}_data_${auth.clientId}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          setCampaign(data.campaign || INITIAL_CAMPAIGN);
          setPrizes(data.prizes || INITIAL_PRIZES);
          setPackages(data.packages || INITIAL_PACKAGES);
          setDonors(data.donors || []);
          setTickets(data.tickets || []);
        } else {
          resetData();
        }
      }
    }
  }, [auth.isLoggedIn, auth.clientId, auth.isSuperAdmin]);

  // Persist current context data
  useEffect(() => {
    if (auth.isLoggedIn && auth.clientId && !auth.isSuperAdmin) {
      const dataToSave = { campaign, prizes, packages, donors, tickets };
      localStorage.setItem(`${LS_KEY}_data_${auth.clientId}`, JSON.stringify(dataToSave));
    }
    localStorage.setItem(`${LS_KEY}_auth`, JSON.stringify(auth));
    localStorage.setItem(`${LS_KEY}_clients`, JSON.stringify(clients));
  }, [auth, campaign, prizes, packages, donors, tickets, clients]);

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
    
    const client = clients.find(c => c.username === username && c.password === pass);
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
  };

  const addClient = (displayName: string, user: string, pass: string) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      username: user,
      password: pass,
      displayName,
      createdAt: Date.now(),
      isActive: true
    };
    setClients(prev => [...prev, newClient]);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === Language.HE ? Language.EN : Language.HE);
  };

  const updateCampaign = (updates: Partial<CampaignSettings>) => setCampaign(prev => ({ ...prev, ...updates }));

  const addPrize = (prize: Prize) => setPrizes(prev => [...prev, prize].sort((a, b) => a.order - b.order));
  const deletePrize = (id: string) => {
    setPrizes(prev => prev.filter(p => p.id !== id));
    setTickets(prev => prev.filter(t => t.prizeId !== id));
  };
  const updatePrize = (id: string, updates: Partial<Prize>) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => a.order - b.order));
  };

  const addPackage = (pkg: Package) => setPackages(prev => [...prev, pkg]);
  const deletePackage = (id: string) => setPackages(prev => prev.filter(p => p.id !== id));
  const updatePackage = (id: string, updates: Partial<Package>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addDonor = (donor: Donor) => {
    // Logic to identify package by donation amount
    const matched = [...packages]
      .sort((a, b) => b.minAmount - a.minAmount)
      .find(p => donor.totalDonated >= p.minAmount);

    const donorWithPkg = { ...donor, packageId: matched?.id };

    setDonors(prev => {
      const exists = prev.find(d => d.phone === donor.phone);
      if (exists) return prev;
      return [...prev, donorWithPkg];
    });
    
    // Auto-generate tickets based on the mapped package
    if (matched) {
      const newTickets: Ticket[] = [];
      matched.rules.forEach(rule => {
        if (rule.prizeId === 'ALL') {
          // Rule applies to all current prizes
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
          // Rule applies to a specific prize
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
    
    // Clear old tickets for this donor first
    setTickets(prev => prev.filter(t => t.donorId !== donorId));

    // Generate new tickets for the new package
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

  // Identify donors whose donation amount doesn't map to any package
  const unmappedDonors = useMemo(() => {
    if (packages.length === 0) return [];
    return donors.filter(d => !d.packageId);
  }, [donors, packages]);

  return {
    lang,
    toggleLanguage,
    auth,
    login,
    logout,
    clients,
    addClient,
    campaign,
    updateCampaign,
    prizes,
    packages,
    donors,
    tickets,
    addPrize,
    deletePrize,
    updatePrize,
    addPackage,
    deletePackage,
    updatePackage,
    addDonor,
    performDraw,
    resetData,
    unmappedDonors,
    assignPackageToDonor
  };
}
