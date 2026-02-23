
import React, { useState, useEffect } from 'react';
import type { LoyerClientView, Restaurant } from '../shared/types';
import LoyerHome from './components/LoyerHome';
import LoyerMap from './components/LoyerMap';
import LoyerProfile from './components/LoyerProfile';
import LoyerLoyalty from './components/LoyerLoyalty';
import LoyerBottomNav from './components/LoyerBottomNav';
import RestaurantDetails from './components/RestaurantDetails';
import InRestoFlow from './components/InRestoFlow';
import { firestoreService } from '../shared/services/firestoreService';
import { USE_FIREBASE } from '../shared/services/apiConfig';
import { mockBackend } from '../shared/mockBackend';
import { RemiIcon } from '../restaurateur/components/icons/RemiIcon';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onFinish, 2500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fade-in">
            {/* Logo Rémi animé */}
            <div className="w-48 h-48 mb-6 animate-bounce">
                <RemiIcon className="w-full h-full drop-shadow-xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-primary mb-2">Loycal</h1>
            <p className="text-gray-500 font-medium text-lg">Rémi vous prépare une table...</p>
        </div>
    );
};

const LoyerApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<LoyerClientView>('explore');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [mapFilter, setMapFilter] = useState<string | null>(null);
    const [showInResto, setShowInResto] = useState(false); // NEW STATE

    // Fetch restaurants from backend (Admin updates reflect here)
    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const backend = USE_FIREBASE ? firestoreService : mockBackend;
                const activeRestaurants = await backend.getRestaurants(true);
                setRestaurants(activeRestaurants);

                // Si le restaurant sélectionné a été supprimé ou désactivé, on revient à l'accueil
                if (selectedRestaurant) {
                    const stillExists = activeRestaurants.find(r => r.id === selectedRestaurant.id);
                    if (!stillExists) {
                        setSelectedRestaurant(null);
                        setCurrentView('explore');
                    }
                }
            } catch (error) {
                console.error('Error loading restaurants:', error);
            }
        };

        // Charger initialement
        loadRestaurants();

        // Subscribe to changes
        const backend = USE_FIREBASE ? firestoreService : mockBackend;
        const unsub = backend.subscribe(() => {
            loadRestaurants();
        });

        return unsub;
    }, [selectedRestaurant]);

    // Dark Mode Logic based on time of day
    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            setIsDarkMode(hour >= 19 || hour < 7);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const toggleFollow = (id: number) => {
        setRestaurants(prev => prev.map(r =>
            r.id === id ? { ...r, isFollowed: !r.isFollowed } : r
        ));
        if (selectedRestaurant?.id === id) {
            setSelectedRestaurant(prev => prev ? { ...prev, isFollowed: !prev.isFollowed } : null);
        }
    };

    const handleRate = (id: number, rating: number) => {
        setRestaurants(prev => prev.map(r =>
            r.id === id ? { ...r, userRating: rating } : r
        ));
    };

    const handleNavigateToMap = (filter?: string) => {
        if (filter) setMapFilter(filter);
        setCurrentView('map');
    };

    const handleRestaurantClick = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setCurrentView('restaurant-details');
    };

    const handleBackFromDetails = () => {
        setSelectedRestaurant(null);
        setCurrentView('explore');
    };

    const handleOpenInResto = () => {
        setShowInResto(true);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'explore':
                return <LoyerHome restaurants={restaurants} onToggleFollow={toggleFollow} onRate={handleRate} onNavigateToMap={handleNavigateToMap} onRestaurantClick={handleRestaurantClick} />;
            case 'map':
                return <LoyerMap restaurants={restaurants} onToggleFollow={toggleFollow} onRate={handleRate} initialFilter={mapFilter} onRestaurantClick={handleRestaurantClick} />;
            case 'loyalty':
                return <LoyerLoyalty restaurants={restaurants} onToggleFollow={toggleFollow} />;
            case 'profile':
                return <LoyerProfile restaurants={restaurants} />;
            case 'restaurant-details':
                return selectedRestaurant ? (
                    <RestaurantDetails
                        restaurant={selectedRestaurant}
                        onBack={handleBackFromDetails}
                        onToggleFollow={toggleFollow}
                    />
                ) : <LoyerHome restaurants={restaurants} onToggleFollow={toggleFollow} onRate={handleRate} onNavigateToMap={handleNavigateToMap} onRestaurantClick={handleRestaurantClick} />;
            default:
                return <LoyerHome restaurants={restaurants} onToggleFollow={toggleFollow} onRate={handleRate} onNavigateToMap={handleNavigateToMap} onRestaurantClick={handleRestaurantClick} />;
        }
    };

    return (
        <div className={`flex justify-center items-center h-screen bg-gray-100 transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
            {/* Phone Mockup Container */}
            <div className="relative w-full h-full md:max-w-[390px] md:max-h-[844px] bg-black md:rounded-[50px] md:p-[10px] shadow-2xl overflow-hidden z-0 ring-8 ring-gray-900/20">
                <div className="w-full h-full bg-gray-50 dark:bg-slate-900 md:rounded-[40px] overflow-hidden flex flex-col relative transition-colors duration-500 isolate">

                    {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

                    {/* Dynamic Island & Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-14 z-50 pointer-events-none flex justify-between items-start px-7 pt-4 bg-gradient-to-b from-white/90 to-transparent dark:from-black/80">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}
                        </div>
                        {/* Notch Area */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-3xl"></div>

                        <div className="flex space-x-1.5 items-center">
                            <div className="h-3 w-4 bg-gray-900 dark:bg-white rounded-sm"></div> {/* Wifi */}
                            <div className="h-3 w-2 bg-gray-900 dark:bg-white rounded-sm"></div> {/* Battery Body */}
                            <div className="h-1.5 w-0.5 bg-gray-900 dark:bg-white rounded-r-sm"></div> {/* Battery Tip */}
                        </div>
                    </div>

                    {/* Main App Content */}
                    <main className="flex-1 relative overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-slate-900 scrollbar-hide">
                        {renderContent()}
                        {/* Spacer for floating nav */}
                        {currentView !== 'restaurant-details' && <div className="h-28"></div>}
                    </main>

                    {/* NEW: In-Resto Flow Overlay */}
                    {showInResto && (
                        <InRestoFlow
                            restaurants={restaurants}
                            onClose={() => setShowInResto(false)}
                        />
                    )}

                    {/* Bottom Navigation - Floating Style */}
                    {currentView !== 'restaurant-details' && (
                        <LoyerBottomNav
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                            onOpenInResto={handleOpenInResto} // Pass handler
                        />
                    )}
                </div>
            </div>

            <button
                onClick={async () => {
                    if (USE_FIREBASE) {
                        firestoreService.logout();
                        window.location.reload();
                    } else {
                        mockBackend.logout();
                        window.location.reload();
                    }
                }}
                className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full text-xs opacity-50 hover:opacity-100 z-[9999]"
            >
                Déconnexion
            </button>
        </div>
    );
};

export default LoyerApp;
