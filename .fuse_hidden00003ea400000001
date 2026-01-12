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
  clientId?: string; // הוספה לצורך סנכרון רב-לקוחי
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
  clientId?: string; // הוספה לצורך סנכרון רב-לקוחי
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
  clientId?: string; // הוספה לצורך סנכרון רב-לקוחי
  name: string;
  email: string;
  phone: string;
  totalDonated: number;
  packageId?: string;
}

export interface Ticket {
  id: string;
  clientId?: string; // הוספה לצורך סנכרון רב-לקוחי
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
  clientId?: string; // הוספה לצורך סנכרון רב-לקוחי
}

export interface Client {
  id: string;
  username: string;
  password?: string; // Only for creation
  displayName: string;
  phone?: string; // הוספה לפי בקשתך בניהול לקוחות
  email?: string; // הוספה לפי בקשתך בניהול לקוחות
  createdAt: number;
  isActive: boolean;
  campaign?: CampaignSettings; // הוספה כדי לשמור הגדרות לכל לקוח
}

export interface UserAuth {
  isSuperAdmin: boolean;
  clientId?: string;
  isLoggedIn: boolean;
}