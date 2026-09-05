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
  step: 'category' | 'value' | 'method' | 'confirmation' | 'pix' | 'card' | 'mp_card' | 'success';
  paymentMethod?: 'pix' | 'credit' | 'debit';
  mpPaymentId?: string | number;
  mpQrCode?: string;
  mpQrCodeBase64?: string;
  idempotencyKey?: string;
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
  whatsappInstitutional?: string;
  memberCount?: number;
  status?: 'ativo' | 'inativo';
}

export interface Pastor {
  id: string;
  name: string;
  role: string;
  available: boolean;
  photoUrl: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status?: 'ativo' | 'inativo';
  cellGroupId?: string;
}

export interface Slide {
  bgUrl: string;
  verse: string;
  verseRef: string;
}
