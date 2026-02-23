/**
 * Configuration pour le service API
 * Permet de basculer entre mockBackend, API NestJS réelle, ou Firebase
 */

export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
export const USE_REAL_API = import.meta.env.VITE_USE_REAL_API !== 'false';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Retourne le service backend approprié selon la configuration :
 * 1. Firebase (si VITE_USE_FIREBASE=true) → firestoreService
 * 2. API NestJS réelle (si VITE_USE_REAL_API=true) → api
 * 3. Mock backend → mockBackend
 */
export const getBackendService = () => {
  if (USE_FIREBASE) {
    return import('./firestoreService').then((module) => module.default);
  }
  if (USE_REAL_API) {
    return import('./api').then((module) => module.default);
  }
  return import('../mockBackend').then((module) => module.mockBackend);
};
