export type ViewState = 
  | 'home'
  | 'dashboard'
  | 'new_member'
  | 'prayer'
  | 'checkin'
  | 'checkin_success'
  | 'ministries'
  | 'donations'
  | 'my_cell'
  | 'pastoral';

export interface PrayerRequest {
  isAnonymous: boolean;
  name: string;
  message: string;
}

export interface CheckinState {
  method: 'qr' | 'phone' | 'name';
  phone: string;
  name: string;
}

export interface DonationState {
  category: string;
  value: number;
  customValue: string;
  step: 'category' | 'value' | 'method' | 'pix' | 'card' | 'success';
  paymentMethod?: 'pix' | 'credit' | 'debit';
}

export interface NewMemberState {
  step: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  ageRange: string;
}

export interface CellGroup {
  id: string;
  name: string;
  neighborhood: string;
  day: string;
  hour: string;
  leader: string;
  phone: string;
}

export interface Pastor {
  id: string;
  name: string;
  role: string;
  available: boolean;
  photoUrl: string;
}

export interface Slide {
  bgUrl: string;
  verse: string;
  verseRef: string;
}
