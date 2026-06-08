export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  title: string;
  bairro: string;
  cidade: string;
  preco: number;
  tipo: "quarto" | "t1" | "t2" | "t3" | "t4" | "vivenda" | "flat";
  descricao: string;
  imagens: string[];
  amenidades: string[];
  createdAt: string;
  status: "active" | "inactive" | "rented";
  featured: boolean;
}

export interface UserProfile {
  uid: string;
  nome: string;
  telefone: string;
  role: "owner" | "tenant";
  email: string;
  photoURL?: string;
  verified?: boolean;
}

export interface SearchFilters {
  bairro: string;
  tipo: string;
  precoMin: number;
  precoMax: number;
  cidade: string;
}

export const PROPERTY_TYPES: Record<string, string> = {
  quarto: "Quarto",
  t1: "T1",
  t2: "T2",
  t3: "T3",
  t4: "T4+",
  vivenda: "Vivenda",
  flat: "Flat/Apartamento",
};

export const BAIRROS_MAPUTO: string[] = [
  "Sommerschield",
  "Polana Cimento",
  "Alto Maé",
  "Malhangalene",
  "Central",
  "Maxaquene",
  "Chamanculo",
  "Xipamanine",
  "Aeroporto",
  "Costa do Sol",
  "Triunfo",
  "Zimpeto",
  "Matola",
  "Catembe",
  "KaMpfumo",
  "KaMaxaqueni",
  "KaMavota",
  "KaMubukwana",
  "KaTembe",
  "KaNyaka",
];

export const AMENIDADES: string[] = [
  "Água 24h",
  "Luz incluída",
  "Internet/WiFi",
  "Garagem",
  "Segurança 24h",
  "Quintal",
  "Cozinha equipada",
  "Ar condicionado",
  "Piscina",
  "Mobiliado",
  "Varanda",
  "Casa de banho privativa",
];
