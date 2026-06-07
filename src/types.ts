export type CategoryType = 'imovel' | 'veiculo' | 'equipamento';

export type ProvinceType = 
  | 'Maputo Cidade' 
  | 'Maputo Província (Matola)' 
  | 'Sofala (Beira)' 
  | 'Nampula' 
  | 'Tete' 
  | 'Cabo Delgado (Pemba)' 
  | 'Tete' 
  | 'Zambézia (Quelimane)'
  | 'Inhambane'
  | 'Gaza (Xai-Xai)';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  type: string; // e.g. 'Vivenda', 'Apartamento', 'Carrinha 4x4', 'Compactador', 'Salão de Festas'
  price: number; // in MZN (Metical)
  period: 'mês' | 'dia' | 'evento';
  location: string; // e.g., 'Sommerschield II, Maputo'
  province: string; // e.g., 'Maputo Cidade'
  rooms?: number; // for properties
  bathrooms?: number; // for properties
  spaceArea?: string; // e.g. "250 m²", "N/A"
  image: string;
  gallery: string[];
  features: string[];
  landlordName: string;
  landlordPhone: string;
  landlordWhatsApp: string; // Full international or local link
  verified: boolean;
  featured: boolean;
  views: number;
  rating: number;
  availableNow: boolean;
  allowCredelecRefund?: boolean; // Mozambique-specific: does landlord handle FIPAG or EDM?
  stock?: number; // Inventory level for equipment/vehicle, or 1 for properties
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RentBooking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  price: number;
  period: string; // 'mês' | 'dia' | 'evento'
  userName: string;
  userPhone: string;
  userIdentity: string; // BI / Passaporte
  documentType: 'bi' | 'passaporte' | 'dire';
  documentFile?: string; // Uploaded photograph file name or indicator
  startDate: string;
  duration: number; // e.g., 1 month or 3 days
  paymentMethod: 'mpesa' | 'emola' | 'ponto24' | 'mkesh' | 'visa';
  mpesaNumber?: string;
  visaCardNumber?: string;
  referenceNumber?: string;
  status: 'Pendente' | 'Confirmado' | 'Rejeitado';
  createdAt: string;
  expiresAt?: number; // Simulated timestamp when rental expires (useful for warnings)
}

export interface UserFeedback {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppSettings {
  taxPercentage: number;
  termsText: string;
  allowSelfRegistration: boolean;
  minBookingDuration: number;
  adminPin: string;
}

