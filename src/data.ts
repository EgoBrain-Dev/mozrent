import { Listing } from "./types";

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: "lst-001",
    title: "Apartamento T3 Elegante na Polana Cimento",
    description: "Espetacular apartamento T3 totalmente climatizado, com excelente vista para a Baía de Maputo. Cozinha moderna equipada, segurança física 24 horas por dia, elevador operacional, e reserva de água automática (tanque privativo de 5000L). Localizado no coração da Polana, próximo a cafés e restaurantes de prestígio.",
    category: "imovel",
    type: "Apartamento",
    price: 85000,
    period: "mês",
    location: "Av. Julius Nyerere, Polana, Maputo Cidade",
    province: "Maputo Cidade",
    rooms: 3,
    bathrooms: 2,
    spaceArea: "155 m²",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Vista para o Mar", "Segurança 24h", "Tanque de Água 5000L", "Gerador do Prédio", "Área Climatizada", "Elevador"],
    landlordName: "Sr. António Macamo",
    landlordPhone: "+258 84 123 4567",
    landlordWhatsApp: "https://wa.me/258841234567?text=Olá,%20tenho%20interesse%20no%20Apartamento%20T3%20na%20Polana%20no%20MozRent",
    verified: true,
    featured: true,
    views: 1420,
    rating: 4.9,
    availableNow: true,
    allowCredelecRefund: true,
    stock: 1
  },
  {
    id: "lst-002",
    title: "Vivenda T4 de Luxo com Piscina no Triunfo",
    description: "Linda vivenda T4 independente no prestigiado bairro do Triunfo. Conta com piscina privativa cristalina, anexo independente para serviços ou guarda, quintal pavimentado com capacidade para estacionar até 4 viaturas e portão automático de alta segurança. Próximo ao Centro de Conferências Joaquim Chissano e à praia da Costa do Sol.",
    category: "imovel",
    type: "Vivenda",
    price: 135000,
    period: "mês",
    location: "Bairro do Triunfo, Costa do Sol, Maputo Cidade",
    province: "Maputo Cidade",
    rooms: 4,
    bathrooms: 3,
    spaceArea: "320 m²",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Piscina Privativa", "Portão Elétrico", "Câmara de Segurança", "Anexo T1 Completo", "Credelec Pré-pago", "Jardim Lateral"],
    landlordName: "Dra. Eliana Tembe",
    landlordPhone: "+258 82 987 6543",
    landlordWhatsApp: "https://wa.me/258829876543?text=Olá,%20tenho%20interesse%20na%20Vivenda%20T4%20no%20Triunfo%20no%20MozRent",
    verified: true,
    featured: true,
    views: 938,
    rating: 4.8,
    availableNow: true,
    allowCredelecRefund: false,
    stock: 1
  },
  {
    id: "lst-003",
    title: "Toyota Hilux Double Cab 4x4 Off-Road",
    description: "Aluguer de carrinha robusta Toyota Hilux Double Cab GD6 4x4. Ideal para deslocações de negócios ou lazer em estradas difíceis das províncias moçambicanas. Ar condicionado gelado, suspensão reforçada, pneus todo-terreno e rastreador por satélite. Opção de aluguer com ou sem motorista profissional local.",
    category: "veiculo",
    type: "Viatura (4x4)",
    price: 55000 / 10, // 5500 per day
    period: "dia",
    location: "Matola C, Matola (Maputo Província)",
    province: "Maputo Província (Matola)",
    spaceArea: "5 Lugares",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Tracção 4x4", "Ar Condicionado", "Pneus Todo-Terreno", "Transmissão Manual", "GPS Assistido", "Seguro Contra Terceiros"],
    landlordName: "Rent-A-Car Sombreiro",
    landlordPhone: "+258 87 555 1212",
    landlordWhatsApp: "https://wa.me/258875551212?text=Olá,%20tenho%20interesse%20em%20alugar%20a%20Toyota%20Hilux%20no%20MozRent",
    verified: true,
    featured: false,
    views: 412,
    rating: 4.7,
    availableNow: true,
    stock: 3
  },
  {
    id: "lst-004",
    title: "Quarto/Dependência Charmosa na Coop",
    description: "Quarto independente (estilo Kitnet/Suíte) totalmente mobilado no seguro Bairro da Coop. Entrada completamente independente da casa principal, água corrente do FIPAG garantida com reservatório, energia Credelec pré-paga incluída na taxa. Excelente opção para estudantes universitários, consultores de passagem ou jovens casais.",
    category: "imovel",
    type: "Dependência",
    price: 18500,
    period: "mês",
    location: "Bairro da Coop (próximo à UEM), Maputo Cidade",
    province: "Maputo Cidade",
    rooms: 1,
    bathrooms: 1,
    spaceArea: "42 m²",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Entrada Independente", "Mobilado", "Água FIPAG Incluída", "Cozinha Integrada", "Seguro contra roubo", "Wi-Fi Gratuito"],
    landlordName: "Sra. Maria Mutola",
    landlordPhone: "+258 84 444 8888",
    landlordWhatsApp: "https://wa.me/258844448888?text=Olá,%20tenho%20interesse%20no%20Quarto/Dependência%20na%20Coop%20no%20MozRent",
    verified: true,
    featured: false,
    views: 1810,
    rating: 4.9,
    availableNow: true,
    allowCredelecRefund: true,
    stock: 1
  },
  {
    id: "lst-005",
    title: "Salão de Eventos 'Estrela de Xiguiane'",
    description: "Espaço deslumbrante estilo Capulana rústica e moderno para casamentos, baptizados, recepções de Lobolo (casamento tradicional sul-moçambicano) e reuniões corporativas de alto nível. Capacidade para até 300 convidados sentados, cozinha industrial de suporte, gerador próprio automático para evitar interrupções de energia, estacionamento privativo de segurança para 40 carros.",
    category: "equipamento",
    type: "Salão de Eventos",
    price: 45000,
    period: "evento",
    location: "Estrada de Marracuene, Marracuene (Maputo Província)",
    province: "Maputo Província (Matola)",
    spaceArea: "650 m²",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Capacidade 300 Carros", "Gerador Silencioso Integrado", "Climatização Ampla", "Cozinha de Grande Porte", "Segurança Localizada", "Cadeiras e Mesas Inclusas"],
    landlordName: "Eventos Moçambique Lda.",
    landlordPhone: "+258 85 777 9999",
    landlordWhatsApp: "https://wa.me/258857779999?text=Olá,%20tenho%20interesse%20no%20Salão%20Estrela%20de%20Xiguiane%20no%20MozRent",
    verified: true,
    featured: true,
    views: 654,
    rating: 4.6,
    availableNow: true,
    stock: 1
  },
  {
    id: "lst-006",
    title: "Apartamento T2 Climatizado - Bairro Jaimito (Beira)",
    description: "Excelente apartamento T2 totalmente mobilado e climatizado, localizado num ponto estratégico da Cidade da Beira livre de problemas severos de inundações. Condomínio fechado muito tranquilo, com rampa de acesso, segurança armada nocturna, reservatório de água com bomba de pressão, próximo ao Hotel Golden Peacock.",
    category: "imovel",
    type: "Apartamento",
    price: 35000,
    period: "mês",
    location: "Bairro do Jaimito, Beira City",
    province: "Sofala (Beira)",
    rooms: 2,
    bathrooms: 1,
    spaceArea: "90 m²",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1502672017483-74511001828d?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Livre de Cheias", "Segurança Nocturna", "Climatização Completa", "Água 24h", "Parqueamento Interno", "Totalmente Equipado"],
    landlordName: "Eng. Pedro Simango",
    landlordPhone: "+258 84 321 0987",
    landlordWhatsApp: "https://wa.me/258843210987?text=Olá,%20tenho%20interesse%20no%20Apartamento%20T2%20na%20Beira%20no%20MozRent",
    verified: false,
    featured: false,
    views: 310,
    rating: 4.5,
    availableNow: true,
    allowCredelecRefund: false,
    stock: 1
  },
  {
    id: "lst-007",
    title: "Gerador Silencioso Industrial de 20kVA",
    description: "Aluguer de gerador silencioso a diesel (silenced canopy) de alto rendimento. Perfeito para garantir fluxo contínuo de energia elétrica sem picos de voltagem em obras civis, grandes eventos ao ar livre ou para backup em escritórios comerciais durante oscilações da EDM. Entregue sob regime de tanque cheio.",
    category: "equipamento",
    type: "Gerador Industrial",
    price: 3800,
    period: "dia",
    location: "Bairro Carrupeia, Nampula City",
    province: "Nampula",
    spaceArea: "20 kVA",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Canopy Silencioso", "Diesel Económico", "Arranque Automático", "Estabilizador Integrado", "Suporte 24/7", "Entrega no Local"],
    landlordName: "Nampula Força Motores",
    landlordPhone: "+258 86 333 4444",
    landlordWhatsApp: "https://wa.me/258863334444?text=Olá,%20tenho%20interesse%20no%20Gerador%20Industrial%20em%20Nampula%20no%20MozRent",
    verified: true,
    featured: false,
    views: 185,
    rating: 4.8,
    availableNow: true,
    stock: 5
  },
  {
    id: "lst-008",
    title: "Vivenda de Campo T3 Climatizada em Muhala",
    description: "Aconchegante vivenda T3 em Nampula com excelente acabamento tradicional e moderno. Quintal enorme com árvores de sombra, muro com cerca elétrica operacional, água de poço com electrobomba auxiliar para autonomia completa da rede pública. Todos os quartos possuem ar condicionado moderno e roupeiros integrados.",
    category: "imovel",
    type: "Vivenda",
    price: 28000,
    period: "mês",
    location: "Bairro de Muhala, Nampula Cidade",
    province: "Nampula",
    rooms: 3,
    bathrooms: 2,
    spaceArea: "180 m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop&q=85"
    ],
    features: ["Poço de Água Privado", "Cerca Elétrica", "Quintal Verdejante", "Estacionamento Coberto", "Telas Mosquiteiras", "Mobilado Parcial"],
    landlordName: "Dra. Amina Amade",
    landlordPhone: "+258 83 299 1122",
    landlordWhatsApp: "https://wa.me/258832991122?text=Olá,%20tenho%20interesse%20na%20Vivenda%20em%20Muhala%20no%20MozRent",
    verified: false,
    featured: false,
    views: 450,
    rating: 4.6,
    availableNow: true,
    allowCredelecRefund: true,
    stock: 1
  }
];

export const MOZAMBIQUE_PROVINCES = [
  "Maputo Cidade",
  "Maputo Província (Matola)",
  "Sofala (Beira)",
  "Nampula",
  "Tete",
  "Cabo Delgado (Pemba)",
  "Zambézia (Quelimane)",
  "Inhambane",
  "Gaza (Xai-Xai)",
  "Manica (Chimoio)",
  "Niassa (Lichinga)"
];

export const RENTAL_GUIDES = [
  {
    title: "O que é o Credelec?",
    content: "O Credelec é o sistema de eletricidade pré-paga gerido pela EDM (Eletricidade de Moçambique). No MozRent, indicamos se o inquilino compra o seu próprio Credelec ou se faz parte da renda fixa."
  },
  {
    title: "Como funciona o FIPAG?",
    content: "O FIPAG é o fundo responsável pelo fornecimento público de água nas vilas e cidades. Como o fornecimento pode oscilar, dê preferência a imóveis com tanque subterrâneo ou reservatório elevado (vulgo depósito) com electrobomba."
  },
  {
    title: "Lobolo e Casamentos Tradicionais",
    content: "O Lobolo é a cerimónia tradicional de casamento em Moçambique. Se precisa alugar salões majestosos ou tendas amplas para a festa do Lobolo, escolha a nossa categoria de 'Equipamentos e Serviços'."
  },
  {
    title: "O que ter em atenção ao alugar viaturas?",
    content: "Prefira viaturas 4x4 (tracção às quatro rodas) se for viajar para fora do perímetro de Maputo ou Matola, pois estradas como a EN1 estão frequentemente sujeitas a obras ou estradas de terra arenosa nas praias de Bilene, Tofo e Vilankulo."
  }
];
