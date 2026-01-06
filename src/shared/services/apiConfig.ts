/**
 * Configuration pour le service API
 * Permet de basculer entre mockBackend et API réelle
 */

// Basculer entre mockBackend et API réelle
export const USE_REAL_API = import.meta.env.VITE_USE_REAL_API !== 'false'; // Par défaut true

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Export conditionnel du service
export const getBackendService = () => {
  if (USE_REAL_API) {
    return import('./api').then((module) => module.default);
  } else {
    return import('../mockBackend').then((module) => module.mockBackend);
  }
};






