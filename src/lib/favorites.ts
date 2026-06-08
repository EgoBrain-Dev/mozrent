"use client";

import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Serviço de favoritos - guarda favoritos no documento do utilizador no Firestore.
 * Campo: favorites (array de property IDs)
 */

// Adicionar imóvel aos favoritos
export async function addFavorite(userId: string, propertyId: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    favorites: arrayUnion(propertyId),
  });
}

// Remover imóvel dos favoritos
export async function removeFavorite(userId: string, propertyId: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    favorites: arrayRemove(propertyId),
  });
}

// Obter favoritos do utilizador
export async function getFavorites(userId: string): Promise<string[]> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().favorites || [];
  }
  return [];
}

// Verificar se um imóvel está nos favoritos
export async function isFavorite(userId: string, propertyId: string): Promise<boolean> {
  const favorites = await getFavorites(userId);
  return favorites.includes(propertyId);
}
