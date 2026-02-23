
import React, { useState } from 'react';
import type { RestaurateurView } from '../shared/types';
import { MOCK_CUSTOMERS } from '../shared/constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CustomerSegments from './components/CustomerSegments';
import CustomerProfile from './components/CustomerProfile';
import POSSystem from './components/pos/POSSystem';
import RemiExpertHub from './components/RemiExpertHub';
import LoyaltyProgram from './components/LoyaltyProgram';
import MarketingCampaigns from './components/MarketingCampaigns';
import LoyaltyAnalytics from './components/LoyaltyAnalytics';
import RestaurantProfileEditor from './components/RestaurantProfileEditor';
import ReservationsManager from './components/ReservationsManager';
import { mockBackend } from '../shared/mockBackend';
import { firestoreService } from '../shared/services/firestoreService';
import { USE_FIREBASE } from '../shared/services/apiConfig';

const RestaurateurApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<RestaurateurView>('dashboard');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const handleSelectCustomer = (id: number) => {
        setSelectedCustomerId(id);
        setCurrentView('customerProfile');
    };

    const handleBackToCustomers = () => {
        setSelectedCustomerId(null);
        setCurrentView('customers');
    };

    const handleLogout = () => {
        if (USE_FIREBASE) {
            firestoreService.logout();
            window.location.reload();
        } else {
            mockBackend.logout();
            window.location.reload();
        }
    };

    if (currentView === 'pos') {
        return (
            <>
                <POSSystem />
                <button onClick={() => setCurrentView('dashboard')} className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded z-50 font-bold">Quitter la Caisse</button>
            </>
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard onNavigate={setCurrentView} />;
            case 'remi-expert':
                return <RemiExpertHub />;
            case 'loyalty-program':
                return <LoyaltyProgram />;
            case 'campaigns':
                return <MarketingCampaigns />;
            case 'customers':
                return <CustomerSegments onSelectCustomer={handleSelectCustomer} />;
            case 'analytics':
                return <LoyaltyAnalytics />;
            case 'reservations':
                return <ReservationsManager />;
            case 'profile-editor':
                return <RestaurantProfileEditor />;
            case 'customerProfile': {
                const customer = MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId);
                return customer ? <CustomerProfile customer={customer} onBack={handleBackToCustomers} /> : <CustomerSegments onSelectCustomer={handleSelectCustomer} />;
            }
            default:
                return <Dashboard onNavigate={setCurrentView} />;
        }
    };

    const viewTitles: Record<string, string> = {
        dashboard: 'Tableau de bord',
        customers: 'Base clients',
        customerProfile: "Profil client",
        reservations: 'Réservations',
        'remi-expert': 'Rémi l\'IA Experte',
        'loyalty-program': 'Programme de fidélité',
        'campaigns': 'Campagnes marketing',
        'analytics': 'Analyse de performance',
        'profile-editor': 'Mon établissement',
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={viewTitles[currentView] || 'Loycal'} onNavigate={setCurrentView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RestaurateurApp;
