import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Restaurant,
  Campaign,
  FlashPromotion,
  Reservation,
  MenuItem,
  POSOrder,
  Customer,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;
  private listeners: Function[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(error);
      },
    );
  }

  // Système de subscription pour notifier les changements
  subscribe(listener: Function) {
    this.listeners.push(listener);
    listener(); // Appeler immédiatement
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // ============================================
  // AUTH
  // ============================================

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      this.notifyListeners();
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  }

  async registerClient(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    try {
      const response = await this.api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      this.notifyListeners();
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // ============================================
  // RESTAURANTS
  // ============================================

  async getRestaurants(activeOnly: boolean = true): Promise<Restaurant[]> {
    try {
      const response = await this.api.get('/restaurants', {
        params: { activeOnly },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  }

  async getRestaurant(id: number): Promise<Restaurant | null> {
    try {
      const response = await this.api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  }

  async updateRestaurantProfile(
    restaurantId: number,
    data: Partial<Restaurant>,
  ): Promise<void> {
    try {
      await this.api.put(`/restaurants/${restaurantId}`, data);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour');
    }
  }

  async updateRestaurantMenu(restaurantId: number, menu: MenuItem[]): Promise<void> {
    try {
      await this.api.put(`/restaurants/${restaurantId}/menu`, { menu });
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour menu');
    }
  }

  // ============================================
  // LOYALTY
  // ============================================

  async validateVisit(
    userId: string,
    restaurantId: number,
    code: string,
    amount?: number,
  ): Promise<{ success: boolean; pointsEarned: number; message?: string }> {
    try {
      const response = await this.api.post('/loyalty/visits', {
        restaurantId,
        validationCode: code,
        amount,
      });
      this.notifyListeners();
      return {
        success: true,
        pointsEarned: response.data.pointsEarned || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        pointsEarned: 0,
        message: error.response?.data?.message || 'Code incorrect',
      };
    }
  }

  async getMemberships(userId: string) {
    try {
      const response = await this.api.get('/loyalty/memberships');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching memberships:', error);
      return [];
    }
  }

  async getLoyaltyProgram(restaurantId: number) {
    try {
      const response = await this.api.get(`/loyalty/programs/${restaurantId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching loyalty program:', error);
      return null;
    }
  }

  async getRestaurantCustomers(restaurantId: number | string): Promise<Customer[]> {
    try {
      const response = await this.api.get(`/restaurants/${restaurantId}/customers`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  // ============================================
  // CAMPAIGNS
  // ============================================

  async getCampaigns(restaurantId: number): Promise<Campaign[]> {
    try {
      const response = await this.api.get(`/campaigns/${restaurantId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'stats' | 'createdAt'>): Promise<void> {
    try {
      await this.api.post('/campaigns', campaign);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de création campagne');
    }
  }

  async createFlashPromotion(
    promo: Omit<FlashPromotion, 'id' | 'createdAt'>,
  ): Promise<FlashPromotion> {
    try {
      const response = await this.api.post('/campaigns/flash', {
        restaurantId: promo.restaurantId,
        menuItemId: promo.menuItemId,
        itemName: promo.itemName,
        discountPrice: promo.discountPrice,
        originalPrice: promo.originalPrice,
        quantityTotal: promo.quantityTotal,
        startTime: promo.startTime,
        endTime: promo.endTime,
        targetSegment: promo.targetSegment,
      });
      this.notifyListeners();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de création promotion flash');
    }
  }

  async getFlashPromotions(restaurantId: number): Promise<FlashPromotion[]> {
    try {
      const response = await this.api.get(`/campaigns/flash/${restaurantId}`, {
        params: { activeOnly: true },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching flash promotions:', error);
      return [];
    }
  }

  async getAllActiveFlashPromotions(): Promise<FlashPromotion[]> {
    try {
      const response = await this.api.get('/campaigns/flash');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching flash promotions:', error);
      return [];
    }
  }

  // ============================================
  // RESERVATIONS
  // ============================================

  async createReservation(
    res: Omit<Reservation, 'id' | 'createdAt'>,
  ): Promise<Reservation> {
    try {
      const response = await this.api.post('/reservations', {
        restaurantId: res.restaurantId,
        date: res.date,
        time: res.time,
        guests: res.guests,
      });
      this.notifyListeners();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de création réservation');
    }
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const response = await this.api.get('/reservations/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAnalytics(restaurantId: number) {
    try {
      const response = await this.api.get(`/analytics/${restaurantId}`);
      return {
        totalRevenue: response.data.totalRevenue || 0,
        totalVisits: response.data.totalVisits || 0,
        averageTicket: response.data.averageTicket || 0,
      };
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      return {
        totalRevenue: 0,
        totalVisits: 0,
        averageTicket: 0,
      };
    }
  }

  // ============================================
  // POS
  // ============================================

  async getPOSOrders(restaurantId: number): Promise<POSOrder[]> {
    try {
      const response = await this.api.get(`/pos/orders/${restaurantId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching POS orders:', error);
      return [];
    }
  }

  async savePOSOrder(order: POSOrder): Promise<void> {
    try {
      if (order.id && order.id.startsWith('#')) {
        // Commande existante - mettre à jour
        const orderId = order.id.replace('#', '');
        await this.api.put(`/pos/orders/${orderId}/status`, {
          status: order.status,
        });
      } else {
        // Nouvelle commande
        await this.api.post('/pos/orders', {
          restaurantId: order.restaurantId || 1,
          userId: order.customer?.id,
          items: order.items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total,
          type: order.type,
          tableNumber: order.tableNumber,
        });
      }
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de sauvegarde commande');
    }
  }

  async payOrder(id: string, method: string): Promise<void> {
    try {
      const orderId = id.replace('#', '');
      await this.api.put(`/pos/orders/${orderId}/pay`, {
        paymentMethod: method,
      });
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de paiement');
    }
  }

  async deletePOSOrder(id: string): Promise<void> {
    try {
      const orderId = id.replace('#', '');
      await this.api.delete(`/pos/orders/${orderId}`);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de suppression');
    }
  }

  // ============================================
  // ADMIN (pour compatibilité)
  // ============================================

  async getUsersAdmin(): Promise<User[]> {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getAllRestaurantsAdmin(): Promise<Restaurant[]> {
    try {
      const response = await this.api.get('/restaurants', {
        params: { activeOnly: false },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  }

  async deleteRestaurant(id: number): Promise<void> {
    try {
      // Note: Cet endpoint n'existe pas encore dans le backend
      // À implémenter dans le module Admin
      await this.api.delete(`/admin/restaurants/${id}`);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de suppression');
    }
  }

  async toggleRestaurantStatus(id: number): Promise<void> {
    try {
      const restaurant = await this.getRestaurant(id);
      if (restaurant) {
        await this.updateRestaurantProfile(id, {
          status: restaurant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        });
      }
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour');
    }
  }

  async toggleUserStatus(id: string): Promise<void> {
    try {
      // Note: Cet endpoint n'existe pas encore dans le backend
      // À implémenter dans le module Admin
      await this.api.put(`/admin/users/${id}/status`);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de mise à jour');
    }
  }

  async createRestaurateur(data: any): Promise<void> {
    try {
      // Note: Cet endpoint n'existe pas encore dans le backend
      // À implémenter dans le module Admin
      await this.api.post('/admin/restaurants', data);
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de création');
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  activatePromo(userId: string, promoId: string) {
    // Placeholder - à implémenter si nécessaire
    console.log(`Promo ${promoId} activated for user ${userId}`);
  }
}

// Export singleton
export const apiService = new ApiService();

// Export pour compatibilité avec mockBackend
export default apiService;








