
import { Prize, Package, DrawStatus, CampaignSettings } from './types';

export const INITIAL_CAMPAIGN: CampaignSettings = {
  nameHE: 'הקמפיין שלי',
  nameEN: 'My Campaign',
  logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  banner: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop',
  drawDate: '2025-12-31',
  primaryColor: '#C2A353',
  donationUrl: ''
};

// Starting with empty arrays as per user request for empty initial state
export const INITIAL_PRIZES: Prize[] = [];

export const INITIAL_PACKAGES: Package[] = [];
