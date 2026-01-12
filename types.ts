export enum Language { HE = 'HE', EN = 'EN' }
export enum DrawStatus { OPEN = 'OPEN', DRAWING = 'DRAWING', DRAWN = 'DRAWN' }

export interface UserAuth {
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  clientId?: string; // הוספנו את זה כדי לזהות איזה קמפיין מנהלים
  token?: string;
}

export interface PrizeMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface Prize {
  id: string;
  clientId: string;
  titleHE: string;
  titleEN: string;
  descriptionHE: string;
  descriptionEN: string;
  value: number;
  media: PrizeMedia[];
  status: DrawStatus;
  order: number;
  winnerId?: string;
  isFeatured?: boolean;
  isFullPage?: boolean;
}

export interface PackageRule {
  prizeId: string | 'ALL';
  count: number;
}

export interface Package {
  id: string;
  clientId: string;
  nameHE: string;
  nameEN: string;
  minAmount: number;
  rules: PackageRule[];
  image?: string;
  color?: string;
  joinLink?: string;
}

export interface Donor {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  email: string;
  totalDonated: number;
  packageId?: string;
}

export interface Ticket {
  id: string;
  clientId: string;
  donorId: string;
  prizeId: string;
  createdAt: number;
}

export interface CampaignSettings {
  nameHE: string;
  nameEN: string;
  drawDate: string;
  donationUrl: string;
  logo: string;
  banner: string;
  videoUrl?: string;
}

export interface Client {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: number;
  campaign: CampaignSettings;
}