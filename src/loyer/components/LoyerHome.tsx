
import React, { useState, useMemo, useEffect } from 'react';
import type { Restaurant, FlashPromotion } from '../../shared/types';
import { mockBackend } from '../../shared/mockBackend';
import BookingModal from './BookingModal';
import { SpinnerIcon } from '../../restaurateur/components/icons/SpinnerIcon';
import { RemiIcon } from '../../restaurateur/components/icons/RemiIcon';

interface LoyerHomeProps {
    restaurants: Restaurant[];
    onToggleFollow: (id: number) => void;
    onRate: (id: number, rating: number) => void;
    onNavigateToMap: (filter?: string) => void;
    onRestaurantClick: (restaurant: Restaurant) => void;
}

// --- SUB COMPONENTS ---

const FlashPromoCard: React.FC<{ promo: FlashPromotion, restaurantName: string, onViewDetails: () => void, onReserve: () => void }> = ({ promo, restaurantName, onViewDetails, onReserve }) => {
    const stockPercent = (promo.quantityRemaining / promo.quantityTotal) * 100;

    return (
        <div
            onClick={onViewDetails}
            className="min-w-[280px] bg-gradient-to-br from-brand-secondary to-orange-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between cursor-pointer"
        >
            {/* Background pattern */}
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                <RemiIcon className="w-32 h-32" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Alerte Éclair ⚡</span>
                    <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg">Expire à {promo.endTime}</span>
                </div>
                <h3 className="text-xl font-black leading-tight mb-1">{promo.itemName}</h3>
                <p className="text-sm opacity-90 font-medium">{restaurantName}</p>

                <div className="mt-4 flex items-baseline space-x-2">
                    <span className="text-3xl font-black">{promo.discountPrice.toFixed(2)} €</span>
                    <span className="text-sm line-through opacity-60">{promo.originalPrice.toFixed(2)} €</span>
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
                    <span>{promo.quantityRemaining} restants</span>
                    <span>{Math.round(stockPercent)}% en stock</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-white rounded-full transition-all duration-1000 ${stockPercent < 30 ? 'animate-pulse' : ''}`}
                        style={{ width: `${stockPercent}%` }}
                    ></div>
                </div>

                {/* Reserve Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onReserve(); }}
                    className="w-full mt-4 bg-white text-orange-600 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95"
                >
                    🎯 Réserver cette offre
                </button>
            </div>
        </div>
    );
};

export const StarRating: React.FC<{ rating: number, onRate: (rating: number) => void, size?: string }> = ({ rating, onRate, size = "w-4 h-4" }) => (
    <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                onClick={(e) => { e.stopPropagation(); onRate(star); }}
                className="focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
            </button>
        ))}
    </div>
);

const StoryCircle: React.FC<{ label: string, emoji: string, isLive?: boolean, onClick: () => void }> = ({ label, emoji, isLive, onClick }) => (
    <div className="flex flex-col items-center space-y-1 cursor-pointer group" onClick={onClick}>
        <div className={`w-16 h-16 rounded-full p-[3px] transition-all duration-300 ${isLive ? 'bg-gradient-to-tr from-brand-secondary to-pink-500 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}>
            <div className="w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl group-hover:scale-95 transition-transform border-2 border-white dark:border-slate-900 shadow-sm">
                {emoji}
            </div>
        </div>
        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 group-hover:text-brand-secondary transition-colors">{label}</span>
    </div>
);

const CategoryPill: React.FC<{ label: string, emoji: string, isActive: boolean, onClick: () => void }> = ({ label, emoji, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-5 py-3 rounded-2xl transition-all shadow-sm active:scale-95 ${isActive
            ? 'bg-gray-900 text-white shadow-lg scale-105'
            : 'bg-white text-gray-700 border border-gray-100'
            }`}
    >
        <span className="text-xl">{emoji}</span>
        <span className="font-bold text-sm whitespace-nowrap">{label}</span>
    </button>
);

// --- MAIN COMPONENT ---

const LoyerHome: React.FC<LoyerHomeProps> = ({ restaurants, onToggleFollow, onRate, onNavigateToMap, onRestaurantClick }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [bookingTarget, setBookingTarget] = useState<{ name: string, id: number } | null>(null);
    const [flashBooking, setFlashBooking] = useState<{
        promo: FlashPromotion,
        restaurantName: string,
        restaurantId: number
    } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [flashPromos, setFlashPromos] = useState<FlashPromotion[]>([]);

    useEffect(() => {
        const loadFlash = async () => {
            try {
                const promos = await mockBackend.getAllActiveFlashPromotions();
                setFlashPromos(promos);
            } catch (error) {
                console.error('Error loading flash promotions:', error);
            }
        };
        loadFlash();
        const unsub = mockBackend.subscribe(loadFlash);
        return unsub;
    }, []);

    const categories = [
        { id: 'Burger', emoji: '🍔', label: 'Burgers' },
        { id: 'Healthy', emoji: '🥗', label: 'Healthy' },
        { id: 'Sushi', emoji: '🍣', label: 'Sushi' },
        { id: 'Pizza', emoji: '🍕', label: 'Pizza' },
        { id: 'Brunch', emoji: '🥞', label: 'Brunch' },
    ];

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    }

    const filteredRestaurants = useMemo(() => {
        if (!selectedCategory) return restaurants;
        return restaurants.filter(r =>
            selectedCategory === 'Burger' ? r.cuisine.includes('Américaine') || r.name.includes('Burger') :
                selectedCategory === 'Sushi' ? r.cuisine.includes('Japonaise') || r.name.includes('Sushi') :
                    selectedCategory === 'Pizza' ? r.cuisine.includes('Italienne') || r.name.includes('Pizza') :
                        selectedCategory === 'Healthy' ? r.cuisine.includes('Végétarien') :
                            true
        );
    }, [restaurants, selectedCategory]);

    return (
        <div className="min-h-full pb-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-500">
            <header className="pt-16 px-6 pb-4">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Salut Alexandre 👋</p>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">Faim de loup ? 🐺</h1>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img src="https://picsum.photos/id/237/100/100" alt="Profile" />
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-brand-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" placeholder="Resto, plat, envie..." className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-brand-secondary transition-all" />
                </div>
            </header>

            <div className="flex space-x-5 overflow-x-auto px-6 py-2 no-scrollbar scrollbar-hide">
                <StoryCircle label="Promos" emoji="🔥" isLive onClick={() => showToast("Bientôt disponible")} />
                <StoryCircle label="Soirées" emoji="🎉" onClick={() => showToast("Bientôt disponible")} />
                <StoryCircle label="Nouveau" emoji="✨" onClick={() => showToast("Bientôt disponible")} />
                <StoryCircle label="Amis" emoji="👀" onClick={() => showToast("Bientôt disponible")} />
                <StoryCircle label="Cadeaux" emoji="🎁" onClick={() => showToast("Bientôt disponible")} />
            </div>

            {/* SECTION VENTES FLASH */}
            {flashPromos.length > 0 && (
                <div className="mt-8 animate-fade-in">
                    <div className="px-6 flex justify-between items-center mb-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                            <span className="bg-brand-secondary text-white p-1 rounded-lg mr-2">⚡</span>
                            Ventes Flash à proximité
                        </h2>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto px-6 pb-4 scrollbar-hide no-scrollbar">
                        {flashPromos.map(promo => {
                            const restaurant = restaurants.find(r => r.id === promo.restaurantId);
                            return (
                                <FlashPromoCard
                                    key={promo.id}
                                    promo={promo}
                                    restaurantName={restaurant?.name || "Restaurant Partenaire"}
                                    onViewDetails={() => restaurant && onRestaurantClick(restaurant)}
                                    onReserve={() => setFlashBooking({
                                        promo,
                                        restaurantName: restaurant?.name || "Restaurant Partenaire",
                                        restaurantId: promo.restaurantId
                                    })}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-6 pl-6 overflow-x-auto no-scrollbar scrollbar-hide">
                <div className="flex space-x-3 pb-2">
                    <CategoryPill label="Tout" emoji="🍽️" isActive={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
                    {categories.map(cat => (
                        <CategoryPill key={cat.id} label={cat.label} emoji={cat.emoji} isActive={selectedCategory === cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} />
                    ))}
                </div>
            </div>

            <div className="mt-4 px-6 space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pépites du coin 💎</h2>
                        <button className="text-brand-secondary text-sm font-bold" onClick={() => onNavigateToMap()}>Voir tout</button>
                    </div>
                    <div className="grid gap-6">
                        {filteredRestaurants.map((resto) => (
                            <div key={resto.id} onClick={() => onRestaurantClick(resto)} className="group bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer border border-gray-100 dark:border-slate-800">
                                <div className="h-48 w-full relative">
                                    <img src={`https://picsum.photos/seed/${resto.id}/600/400`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={resto.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <button onClick={(e) => { e.stopPropagation(); onToggleFollow(resto.id); }} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-75 ${resto.isFollowed ? 'bg-brand-secondary text-white' : 'bg-white text-gray-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-xl font-bold mb-1">{resto.name}</h3>
                                        <div className="flex items-center text-sm font-medium opacity-90"><span>{resto.cuisine}</span><span className="mx-2">•</span><span className="text-yellow-400 mr-1">★</span> {resto.aggregateRating}</div>
                                    </div>
                                </div>
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-xl">🎁</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Offre de bienvenue</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{resto.offer}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setBookingTarget({ name: resto.name, id: resto.id }); }}
                                        className="bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95"
                                    >
                                        Réserver
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={!!bookingTarget}
                onClose={() => setBookingTarget(null)}
                restaurantName={bookingTarget?.name || ""}
                restaurantId={bookingTarget?.id || 0}
            />

            <BookingModal
                isOpen={!!flashBooking}
                onClose={() => setFlashBooking(null)}
                restaurantName={flashBooking?.restaurantName || ""}
                restaurantId={flashBooking?.restaurantId || 0}
                flashPromo={flashBooking ? {
                    id: flashBooking.promo.id,
                    itemName: flashBooking.promo.itemName,
                    discountPrice: flashBooking.promo.discountPrice,
                    originalPrice: flashBooking.promo.originalPrice
                } : undefined}
            />

            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-fade-in-up z-[200]">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default LoyerHome;
