
import { useState, useEffect, useCallback } from 'react';
import { Prize, Package, Donor, Ticket, Language, DrawStatus, CampaignSettings, Client, UserAuth } from '../types';
import { INITIAL_PRIZES, INITIAL_PACKAGES, INITIAL_CAMPAIGN } from '../constants';

const API_BASE = '/api';

export function useStore() {
  const [lang, setLang] = useState<Language>(Language.HE);
  const [auth, setAuth] = useState<UserAuth>(() => {
    const saved = localStorage.getItem('mazalix_auth');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, isSuperAdmin: false };
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [campaign, setCampaign] = useState<CampaignSettings>(INITIAL_CAMPAIGN);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadClientData = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`${API_BASE}/data/${clientId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.campaign) setCampaign(data.campaign);
      setPrizes(data.prizes || []);
      setPackages(data.packages || []);
      setDonors(data.donors || []);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  const searchDonorCampaigns = async (phone: string) => {
    try {
      const res = await fetch(`${API_BASE}/donors/search/${phone}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  const fetchClients = useCallback(async () => {
    if (!auth.isSuperAdmin) return;
    const res = await fetch(`${API_BASE}/clients`);
    const data = await res.json();
    setClients(data);
  }, [auth.isSuperAdmin]);

  useEffect(() => {
    if (auth.isLoggedIn && auth.clientId) {
      if (auth.isSuperAdmin) {
        fetchClients();
      } else {
        loadClientData(auth.clientId);
      }
    }
    localStorage.setItem('mazalix_auth', JSON.stringify(auth));
  }, [auth, loadClientData, fetchClients]);

  const login = async (username: string, pass: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass })
    });
    if (res.ok) {
      const data = await res.json();
      setAuth(data);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, isSuperAdmin: false });
    setCampaign(INITIAL_CAMPAIGN);
    setPrizes([]);
    setPackages([]);
    setDonors([]);
    setTickets([]);
  };

  const addClient = async (displayName: string, user: string, pass: string) => {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, username: user, password: pass })
    });
    if (res.ok) fetchClients();
  };

  const updateClientStatus = async (id: string, isActive: boolean) => {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (res.ok) fetchClients();
  };

  const deleteClient = async (id: string) => {
    const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
    if (res.ok) fetchClients();
  };

  const updateCampaign = async (updates: Partial<CampaignSettings>) => {
    const newCampaign = { ...campaign, ...updates };
    setCampaign(newCampaign);
    if (auth.clientId && !auth.isSuperAdmin) {
      await fetch(`${API_BASE}/clients/${auth.clientId}/campaign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
    }
  };

  const addPrize = async (prize: Prize) => {
    const res = await fetch(`${API_BASE}/prizes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prize, clientId: auth.clientId })
    });
    if (res.ok) loadClientData(auth.clientId!);
  };

  const updatePrize = async (id: string, updates: Partial<Prize>) => {
    const res = await fetch(`${API_BASE}/prizes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) loadClientData(auth.clientId!);
  };

  const deletePrize = async (id: string) => {
    const res = await fetch(`${API_BASE}/prizes/${id}`, { method: 'DELETE' });
    if (res.ok) loadClientData(auth.clientId!);
  };

  const addPackage = async (pkg: Package) => {
    const res = await fetch(`${API_BASE}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pkg, clientId: auth.clientId })
    });
    if (res.ok) loadClientData(auth.clientId!);
  };

  const deletePackage = async (id: string) => {
    await fetch(`${API_BASE}/packages/${id}`, { method: 'DELETE' });
    loadClientData(auth.clientId!);
  };

  const performDraw = (prizeId: string) => {
    const prizeTickets = tickets.filter(t => t.prizeId === prizeId);
    if (prizeTickets.length === 0) return null;
    const winningTicket = prizeTickets[Math.floor(Math.random() * prizeTickets.length)];
    const winner = donors.find(d => d._id === winningTicket.donorId || d.id === winningTicket.donorId);
    
    if (winningTicket.donorId) {
      updatePrize(prizeId, { status: DrawStatus.DRAWN, winnerId: winningTicket.donorId });
    }
    
    return winner || null;
  };

  const addDonor = async (donor: Donor) => {
    const sortedPkgs = [...packages].sort((a, b) => b.minAmount - a.minAmount);
    const matched = sortedPkgs.find(p => donor.totalDonated >= p.minAmount);
    
    let generatedTickets: any[] = [];
    if (matched) {
      matched.rules.forEach(rule => {
        if (rule.prizeId === 'ALL') {
          prizes.forEach(p => {
            for (let i = 0; i < rule.count; i++) generatedTickets.push({ prizeId: p._id || p.id });
          });
        } else {
          for (let i = 0; i < rule.count; i++) generatedTickets.push({ prizeId: rule.prizeId });
        }
      });
    }

    const res = await fetch(`${API_BASE}/donors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: auth.clientId,
        donor: { ...donor, packageId: matched?._id || matched?.id },
        tickets: generatedTickets
      })
    });
    if (res.ok) loadClientData(auth.clientId!);
  };

  return {
    lang, toggleLanguage: () => setLang(l => l === Language.HE ? Language.EN : Language.HE),
    auth, login, logout, clients, addClient, updateClientStatus, deleteClient, campaign, updateCampaign,
    prizes, packages, donors, tickets, addPrize, deletePrize, updatePrize, addPackage,
    deletePackage, updatePackage: (id: string, u: any) => {}, 
    addDonor, triggerSave: () => {},
    loadClientData, searchDonorCampaigns,
    performDraw,
    setImpersonation: (clientId: string | undefined) => {
       setAuth(prev => ({ ...prev, clientId: clientId || 'super' }));
       if (clientId) loadClientData(clientId);
    }
  };
}
