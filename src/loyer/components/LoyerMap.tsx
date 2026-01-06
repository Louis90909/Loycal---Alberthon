import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Restaurant } from '../../shared/types';
import { StarRating } from './LoyerHome';

// Déclaration globale pour Leaflet (chargé via CDN)
declare const L: any;

interface LoyerMapProps {
    restaurants: Restaurant[];
    onToggleFollow: (id: number) => void;
    onRate: (id: number, rating: number) => void;
    initialFilter?: string | null;
    onRestaurantClick: (restaurant: Restaurant) => void;
}

const RestaurantMapCard: React.FC<{ 
    restaurant: Restaurant, 
    onClose: () => void,
    onToggleFollow: (id: number) => void,
    onRate: (id: number, rating: number) => void,
    onClick: () => void
}> = ({ restaurant, onClose, onToggleFollow, onRate, onClick }) => (
    <div 
        onClick={onClick}
        className="absolute bottom-24 left-4 right-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl z-[500] animate-fade-in-up border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-3xl transition-shadow"
    >
         <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 z-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <div className="flex items-start space-x-4">
             <div className="w-16 h-16 bg-cover bg-center rounded-xl shadow-md flex-shrink-0" style={{backgroundImage: `url('https://picsum.photos/seed/${restaurant.id}/200')`}}></div>
             <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{restaurant.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.cuisine} • {'€'.repeat(restaurant.budget)}</p>
                
                <div className="mt-1 flex items-center justify-between">
                     <StarRating rating={restaurant.userRating || 0} onRate={(r) => onRate(restaurant.id, r)} size="w-4 h-4" />
                     <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{restaurant.ambiance}</span>
                </div>
             </div>
        </div>

        {/* Friends Indicator in Card */}
        {restaurant.friendsActivity && restaurant.friendsActivity.count > 0 && (
            <div className="mt-3 flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="flex -space-x-1.5 mr-2">
                    {restaurant.friendsActivity.avatars.map((url, i) => (
                        <img key={i} className="w-5 h-5 rounded-full border border-white dark:border-slate-800" src={url} alt="" />
                    ))}
                </div>
                Validé par {restaurant.friendsActivity.names[0]}
            </div>
        )}

        <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-100 dark:border-amber-900/50 p-3 rounded-xl">
            <div className="flex items-start space-x-2">
                <span className="text-lg">🎁</span>
                <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Offre du moment</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{restaurant.offer}</p>
                </div>
            </div>
        </div>

        <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                onToggleFollow(restaurant.id); 
            }}
            className={`mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                restaurant.isFollowed 
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600' 
                : 'bg-brand-secondary text-white hover:bg-orange-700'
            }`}
        >
            {restaurant.isFollowed ? '✓ Abonné au programme' : 'Rejoindre le programme fidélité'}
        </button>
    </div>
);


const LoyerMap: React.FC<LoyerMapProps> = ({ restaurants, onToggleFollow, onRate, initialFilter, onRestaurantClick }) => {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [filterCuisine, setFilterCuisine] = useState<string | null>(initialFilter || null);
    const [filterAmbiance, setFilterAmbiance] = useState<string | null>(null);
    const [friendsOnly, setFriendsOnly] = useState(false);
    
    // Leaflet refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // If initialFilter matches an ambiance, use it there, otherwise cuisine.
    useEffect(() => {
        if (initialFilter) {
            const isAmbiance = restaurants.some(r => r.ambiance === initialFilter);
            if (isAmbiance) {
                setFilterAmbiance(initialFilter);
                setFilterCuisine(null);
            } else {
                setFilterCuisine(initialFilter);
                setFilterAmbiance(null);
            }
        }
    }, [initialFilter, restaurants]);

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(r => {
            if (filterCuisine && r.cuisine !== filterCuisine) return false;
            if (filterAmbiance && r.ambiance !== filterAmbiance) return false;
            if (friendsOnly && (!r.friendsActivity || r.friendsActivity.count === 0)) return false;
            return true;
        });
    }, [restaurants, filterCuisine, filterAmbiance, friendsOnly]);

    const cuisines = useMemo(() => Array.from(new Set(restaurants.map(r => r.cuisine))), [restaurants]);
    
    const selectedRestaurant = useMemo(() => 
        restaurants.find(r => r.id === selectedRestaurantId), 
    [restaurants, selectedRestaurantId]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Paris Coordinates
        const PARIS_CENTER = [48.8588, 2.3470];
        
        const map = L.map(mapContainerRef.current, {
            zoomControl: false, // We hide default controls for mobile look
            attributionControl: false
        }).setView(PARIS_CENTER, 13);

        // Add CartoDB Voyager tiles (Clean, App-like look)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // User Location Marker (Blue Pulse)
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div class="relative flex items-center justify-center h-24 w-24 -translate-x-1/2 -translate-y-1/2">
                    <span class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-75"></span>
                    <div class="relative rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg z-10"></div>
                   </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        L.marker(PARIS_CENTER, { icon: userIcon }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update Markers when filters or restaurants change
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        filteredRestaurants.forEach(resto => {
            const isSelected = selectedRestaurantId === resto.id;
            const hasFriends = resto.friendsActivity && resto.friendsActivity.count > 0;
            const isFollowed = resto.isFollowed;

            // Custom HTML for marker
            const html = `
                <div class="relative flex flex-col items-center group transition-transform duration-300 ${isSelected ? 'scale-110 z-50' : 'hover:scale-110 z-10'}">
                    ${hasFriends ? `
                        <div class="absolute -top-3 -right-3 z-30 flex -space-x-1 animate-bounce">
                             <img src="${resto.friendsActivity?.avatars[0]}" class="w-6 h-6 rounded-full border border-white shadow-sm" />
                        </div>
                    ` : ''}
                    
                    <div class="relative w-12 h-12 rounded-full border-4 shadow-xl flex items-center justify-center bg-white overflow-hidden transition-all duration-300
                        ${isSelected ? 'border-brand-secondary scale-110' : 'border-white'}
                        ${isFollowed && !isSelected ? 'border-amber-400' : ''}
                    ">
                        <img src="https://picsum.photos/seed/${resto.id}/100" class="w-full h-full object-cover" />
                    </div>
                    
                    <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-1 shadow-sm 
                        ${isSelected ? 'border-t-brand-secondary' : 'border-t-white'}
                        ${isFollowed && !isSelected ? 'border-t-amber-400' : ''}
                    "></div>

                    ${isSelected ? `
                    <div class="mt-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm text-[10px] font-bold text-gray-800 whitespace-nowrap">
                        ${resto.name}
                    </div>` : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-map-marker', // Avoid default leaflet styles
                html: html,
                iconSize: [48, 64],
                iconAnchor: [24, 54] // Point to bottom center
            });

            const marker = L.marker([resto.lat, resto.lng], { icon })
                .addTo(map)
                .on('click', () => {
                    setSelectedRestaurantId(resto.id);
                    // Center map on click with slight offset to accommodate card
                    map.flyTo([resto.lat - 0.002, resto.lng], 14, { duration: 0.5 });
                });
            
            markersRef.current.push(marker);
        });

    }, [filteredRestaurants, selectedRestaurantId]);


    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-200">
            {/* The Actual Map Container */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0 outline-none" style={{zIndex: 0}}></div>

            {/* Floating Filters */}
            <div className="absolute top-14 left-0 right-0 z-[400] px-4 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center space-x-2 no-scrollbar pb-2 pointer-events-auto">
                <button 
                    onClick={() => setFriendsOnly(!friendsOnly)}
                    className={`px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center space-x-2 transition-all border ${friendsOnly ? 'bg-brand-secondary text-white border-brand-secondary' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-slate-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Amis</span>
                </button>
                {filterAmbiance && (
                     <button 
                        onClick={() => setFilterAmbiance(null)}
                        className="px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-all border bg-purple-100 text-purple-800 border-purple-200"
                    >
                        {filterAmbiance} ✕
                    </button>
                )}
                {cuisines.map(c => (
                     <button 
                        key={c}
                        onClick={() => setFilterCuisine(filterCuisine === c ? null : c)}
                        className={`px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-all border ${filterCuisine === c ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-slate-700'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Click backdrop to close card */}
            {selectedRestaurant && (
                <div 
                    className="absolute inset-0 z-[450]" 
                    onClick={() => setSelectedRestaurantId(null)}
                ></div>
            )}

            {selectedRestaurant && (
                <RestaurantMapCard 
                    restaurant={selectedRestaurant} 
                    onClose={() => setSelectedRestaurantId(null)} 
                    onToggleFollow={onToggleFollow}
                    onRate={onRate}
                    onClick={() => onRestaurantClick(selectedRestaurant)}
                />
            )}
        </div>
    );
};

export default LoyerMap;