import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";
import { Listing, RentBooking, UserFeedback, AppSettings } from "./types";
import { INITIAL_LISTINGS } from "./data";

// 1. Operation types and custom diagnostics
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global handleFirestoreError helper
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Safe check to verify if the error is a permission error
function isPermissionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("permission") || msg.includes("insufficient");
  }
  return false;
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Core Data Persistence config
const USE_FIRESTORE_RECOVERABLE = true;

// Helper to validate and return a document ID safe format
function formatDbId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, "_");
}

// 2. Listings Services
export async function getPersistedListings(): Promise<Listing[]> {
  if (!USE_FIRESTORE_RECOVERABLE) {
    return getLocalListings();
  }
  const path = "listings";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Listing[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Listing);
    });

    if (list.length === 0) {
      console.log("[MozRent DB] Sem imóveis na Firestore. A semear catálogo inicial...");
      await seedInitialListings();
      return INITIAL_LISTINGS;
    }
    return list;
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn("[MozRent Firebase Error] Falha de Firestore ao carregar imóveis, usando cache local:", error);
    return getLocalListings();
  }
}

async function seedInitialListings() {
  const path = "listings";
  try {
    for (const listing of INITIAL_LISTINGS) {
      const dbId = formatDbId(listing.id);
      await setDoc(doc(db, path, dbId), listing);
    }
    console.log("[MozRent DB] Catálogo semeado com sucesso na Firestore.");
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent DB] Erro ao semear catálogo:", error);
  }
}

export async function addPersistedListing(listing: Listing): Promise<void> {
  const local = getLocalListings();
  saveLocalListings([listing, ...local]);

  const path = "listings";
  try {
    const dbId = formatDbId(listing.id);
    await setDoc(doc(db, path, dbId), listing);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent Firebase] Erro ao adicionar imóvel na Firestore:", error);
  }
}

export async function updatePersistedListingStock(id: string, newStock: number): Promise<void> {
  const local = getLocalListings();
  const updated = local.map(l => l.id === id ? { ...l, stock: newStock, availableNow: newStock > 0 } : l);
  saveLocalListings(updated);

  const path = "listings";
  try {
    const dbId = formatDbId(id);
    await updateDoc(doc(db, path, dbId), {
      stock: newStock,
      availableNow: newStock > 0
    });
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    console.error("[MozRent Firebase] Erro ao atualizar stock no Firestore:", error);
  }
}

// 3. Bookings Services
export async function getPersistedBookings(): Promise<RentBooking[]> {
  const path = "bookings";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: RentBooking[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as RentBooking);
    });
    
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn("[MozRent Firebase] Carregando reservas locais:", error);
    return getLocalBookings();
  }
}

export async function addPersistedBooking(booking: RentBooking): Promise<void> {
  const local = getLocalBookings();
  saveLocalBookings([booking, ...local]);

  const path = "bookings";
  try {
    const dbId = formatDbId(booking.id);
    await setDoc(doc(db, path, dbId), booking);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent Firebase] Falha ao criar reserva na Firestore:", error);
  }
}

export async function updatePersistedBooking(booking: RentBooking): Promise<void> {
  const local = getLocalBookings();
  const updated = local.map(b => b.id === booking.id ? booking : b);
  saveLocalBookings(updated);

  const path = "bookings";
  try {
    const dbId = formatDbId(booking.id);
    await setDoc(doc(db, path, dbId), booking);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent Firebase] Falha ao atualizar reserva na Firestore:", error);
  }
}

// 4. User Feedback Services
export async function getPersistedFeedbacks(): Promise<UserFeedback[]> {
  const path = "feedbacks";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: UserFeedback[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as UserFeedback);
    });
    
    if (list.length === 0) {
      const initialFeedback: UserFeedback[] = [
        {
          id: "fb-1",
          name: "Celso de Nhakupandene",
          rating: 5,
          comment: "Aluguei um gerador industrial de 20kVA para o Lobolo do meu cunhado em Marracuene. Entrega super rápida, atendimento 100% confiável e zero complicações de energia!",
          createdAt: "02/06/2026"
        },
        {
          id: "fb-2",
          name: "Amélia Chauque",
          rating: 5,
          comment: "A segurança do checkout com M-Pesa é de outro mundo. Sem burlas, sem intermediários burladores. Poupei mais de 15.000 MT que daria a corretores na Polana!",
          createdAt: "05/06/2026"
        }
      ];
      for (const fb of initialFeedback) {
        await setDoc(doc(db, "feedbacks", fb.id), fb);
      }
      return initialFeedback;
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn("[MozRent Firebase] Carregando feedbacks locais:", error);
    return getLocalFeedbacks();
  }
}

export async function addPersistedFeedback(feedback: UserFeedback): Promise<void> {
  const local = getLocalFeedbacks();
  saveLocalFeedbacks([feedback, ...local]);

  const path = "feedbacks";
  try {
    await setDoc(doc(db, path, feedback.id), feedback);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent Firebase] Erro ao gravar feedback:", error);
  }
}

export async function updatePersistedListingRating(id: string, newRating: number): Promise<void> {
  const local = getLocalListings();
  const updated = local.map(l => l.id === id ? { ...l, rating: newRating } : l);
  saveLocalListings(updated);

  const path = "listings";
  try {
    const dbId = formatDbId(id);
    await updateDoc(doc(db, path, dbId), {
      rating: newRating
    });
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    console.error("[MozRent Firebase] Erro ao atualizar avaliação do anúncio:", error);
  }
}

// 5. Listing Moderation Services
export async function updatePersistedListingVerification(id: string, verified: boolean, featured: boolean): Promise<void> {
  const local = getLocalListings();
  const updated = local.map(l => l.id === id ? { ...l, verified, featured } : l);
  saveLocalListings(updated);

  const path = "listings";
  try {
    const dbId = formatDbId(id);
    await updateDoc(doc(db, path, dbId), { verified, featured });
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    console.error("[MozRent Firebase] Erro ao moderar imóvel:", error);
  }
}

export async function deletePersistedListing(id: string): Promise<void> {
  const local = getLocalListings();
  const updated = local.filter(l => l.id !== id);
  saveLocalListings(updated);

  const path = "listings";
  try {
    const { deleteDoc } = await import("firebase/firestore");
    const dbId = formatDbId(id);
    await deleteDoc(doc(db, path, dbId));
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.error("[MozRent Firebase] Erro ao eliminar imóvel na Firestore:", error);
  }
}

// 6. System Settings Services
const DEFAULT_SETTINGS: AppSettings = {
  taxPercentage: 6.5,
  termsText: "1. Verificação de Documentação Obrigatória: Todos os arrendatários devem anexar uma cópia nítida legível do seu BI, Passaporte ou DIRE.\\n\\n2. Proteção de Transações: Os pagamentos operam retidos via sistema integrado até o check-in presencial para precaver burlas.\\n\\n3. Sinistro e Custos de Danos: Danos causados aos bens arrendados são cobertos sob termos de responsabilidade civil.",
  allowSelfRegistration: true,
  minBookingDuration: 1,
  adminPin: "2026"
};

export async function getPersistedSettings(): Promise<AppSettings> {
  const path = "settings";
  try {
    const { getDoc } = await import("firebase/firestore");
    const docRef = doc(db, path, "app_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        adminPin: data.adminPin || "2026"
      } as AppSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn("[MozRent Firebase] Falha ao carregar configurações de Firestore. Usando cache local:", error);
    const saved = localStorage.getItem("mozrent_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        adminPin: parsed.adminPin || "2026"
      };
    }
    return DEFAULT_SETTINGS;
  }
}

export async function updatePersistedSettings(settings: AppSettings): Promise<void> {
  localStorage.setItem("mozrent_settings", JSON.stringify(settings));

  const path = "settings";
  try {
    const docRef = doc(db, path, "app_config");
    await setDoc(docRef, settings);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error("[MozRent Firebase] Falha ao gravar configurações na Firestore:", error);
  }
}

// Local storage fallbacks
function getLocalListings(): Listing[] {
  const data = localStorage.getItem("mozrent_local_listings");
  return data ? JSON.parse(data) : INITIAL_LISTINGS;
}
function saveLocalListings(listings: Listing[]) {
  localStorage.setItem("mozrent_local_listings", JSON.stringify(listings));
}

function getLocalBookings(): RentBooking[] {
  const data = localStorage.getItem("mozrent_local_bookings");
  return data ? JSON.parse(data) : [];
}
function saveLocalBookings(bookings: RentBooking[]) {
  localStorage.setItem("mozrent_local_bookings", JSON.stringify(bookings));
}

function getLocalFeedbacks(): UserFeedback[] {
  const data = localStorage.getItem("mozrent_local_feedbacks");
  return data ? JSON.parse(data) : [
    {
      id: "fb-1",
      name: "Celso de Nhakupandene",
      rating: 5,
      comment: "Aluguei um gerador industrial de 20kVA para o Lobolo do meu cunhado em Marracuene. Entrega super rápida, atendimento 100% confiável e zero complicações de energia!",
      createdAt: "02/06/2026"
    },
    {
      id: "fb-2",
      name: "Amélia Chauque",
      rating: 5,
      comment: "A segurança do checkout com M-Pesa é de outro mundo. Sem burlas, sem intermediários burladores. Poupei mais de 15.000 MT que daria a corretores na Polana!",
      createdAt: "05/06/2026"
    }
  ];
}
function saveLocalFeedbacks(feedbacks: UserFeedback[]) {
  localStorage.setItem("mozrent_local_feedbacks", JSON.stringify(feedbacks));
}
