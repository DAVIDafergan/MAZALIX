
export enum Language {
  HE = 'he',
  EN = 'en'
}

export enum DrawStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAWN = 'DRAWN'
}

export interface PrizeMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface Prize {
  id: string;
  titleHE: string;
  titleEN: string;
  descriptionHE: string;
  descriptionEN: string;
  value: number;
  media: PrizeMedia[];
  status: DrawStatus;
  winnerId?: string;
  isFeatured?: boolean;
  isFullPage?: boolean;
  order: number;
}

export interface PackageRule {
  prizeId: string | 'ALL';
  count: number;
}

export interface Package {
  id: string;
  nameHE: string;
  nameEN: string;
  minAmount: number;
  rules: PackageRule[];
  image?: string;
  joinLink?: string;
  color?: string; // Hex color for the theme
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalDonated: number;
  packageId?: string;
}

export interface Ticket {
  id: string;
  donorId: string;
  prizeId: string;
  createdAt: number;
}

export interface CampaignSettings {
  nameHE: string;
  nameEN: string;
  logo: string;
  banner: string;
  videoUrl?: string;
  drawDate: string;
  primaryColor: string;
  donationUrl?: string;
}

export interface Client {
  id: string;
  username: string;
  password?: string; // Only for creation
  displayName: string;
  createdAt: number;
  isActive: boolean;
}

export interface UserAuth {
  isSuperAdmin: boolean;
  clientId?: string;
  isLoggedIn: boolean;
}
