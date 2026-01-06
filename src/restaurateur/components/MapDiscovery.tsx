import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_RESTAURANTS } from '../../shared/constants';
import type { Restaurant } from '../../shared/types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { generateMapInsight } from '../services/geminiService';
import { StarIcon } from './icons/StatusIcons';

declare const L: any;

const RestaurantCard: React.FC<{ restaurant: Restaurant, onClose: () => void }> = ({ restaurant, onClose }) => (
    <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-2xl z-[500] animate-fade-in-up border border-gray-200">
         <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h3 className="text-xl font-bold text-brand-primary">{restaurant.name}</h3>
        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
        <div className="flex items-center text-sm mt-2 space-x-4">
             <span className="font-bold text-amber-600">{'€'.repeat(restaurant.budget)}</span>
             <span className="text-gray-600">{restaurant.popularity}</span>
             <span className="text-gray-600">{restaurant.distance > 0 ? `${restaurant.distance}m` : ''}</span>
        </div>
        <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
            <p className="font-semibold text-amber-800">{restaurant.offer}</p>
        </div>
    </div>
);


const MapDiscovery: React.FC = () => {
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [filters, setFilters] = useState({
        cuisine: [] as string[],
        budget: [] as number[],
    });
    const [insight, setInsight] = useState<string | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(true);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const userRestaurant = useMemo(() => MOCK_RESTAURANTS.find(r => r.isCurrentUser), []);
    const competitors = useMemo(() => MOCK_RESTAURANTS.filter(r => !r.isCurrentUser), []);
    const uniqueCuisines = useMemo(() => Array.from(new Set(competitors.map(c => c.cuisine))), [competitors]);
    
    useEffect(() => {
        const fetchInsight = async () => {
            if (userRestaurant) {
                setIsInsightLoading(true);
                const result = await generateMapInsight(competitors, userRestaurant);
                setInsight(result);
                setIsInsightLoading(false);
            }
        };
        fetchInsight();
    }, [userRestaurant, competitors]);


    const handleCuisineChange = (cuisine: string) => {
        setFilters(prev => ({
            ...prev,
            cuisine: prev.cuisine.includes(cuisine)
                ? prev.cuisine.filter(c => c !== cuisine)
                : [...prev.cuisine, cuisine],
        }));
    };
    
    const handleBudgetChange = (budget: number) => {
        setFilters(prev => ({
            ...prev,
            budget: prev.budget.includes(budget)
                ? prev.budget.filter(b => b !== budget)
                : [...prev.budget, budget],
        }));
    };

    const filteredRestaurants = useMemo(() => {
        return MOCK_RESTAURANTS.filter(restaurant => {
            if (restaurant.isCurrentUser) return true; // Always show user's restaurant
            const cuisineMatch = filters.cuisine.length === 0 || filters.cuisine.includes(restaurant.cuisine);
            const budgetMatch = filters.budget.length === 0 || filters.budget.includes(restaurant.budget);
            return cuisineMatch && budgetMatch;
        });
    }, [filters]);

     // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const PARIS_CENTER = [48.8588, 2.3470];
        const map = L.map(mapContainerRef.current).setView(PARIS_CENTER, 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
             attribution: '&copy; OpenStreetMap &copy; CARTO',
             subdomains: 'abcd',
             maxZoom: 20
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        filteredRestaurants.forEach(resto => {
            const isUser = resto.isCurrentUser;
            const isSelected = selectedRestaurant?.id === resto.id;

            const html = isUser ? `
                <div class="relative flex items-center justify-center">
                    <span class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-amber-400 opacity-75"></span>
                    <div class="relative text-3xl">⭐</div>
                </div>
            ` : `
                <div class="relative transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
                    <div class="w-10 h-10 rounded-full border-2 bg-white shadow-lg overflow-hidden flex items-center justify-center
                        ${isSelected ? 'border-brand-secondary' : 'border-brand-primary'}
                    ">
                        <img src="https://picsum.photos/seed/${resto.id}/100" class="w-full h-full object-cover" />
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-b2b-marker',
                html: html,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([resto.lat, resto.lng], { icon })
                .addTo(map)
                .on('click', () => setSelectedRestaurant(resto));
            
            markersRef.current.push(marker);
        });
    }, [filteredRestaurants, selectedRestaurant]);

    
    return (
        <div className="flex h-full gap-6">
            {/* Filter & Insight Panel */}
            <div className="w-1/3 max-w-sm flex-shrink-0 bg-surface rounded-lg shadow-md p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800">Filtres & Analyse</h3>
                
                {/* AI Insight */}
                <div className="mt-4">
                    <h4 className="font-semibold text-brand-primary">💡 Analyse IA</h4>
                    <div className="mt-2 p-3 bg-brand-light rounded-lg text-sm text-brand-dark min-h-[80px] flex items-center justify-center">
                        {isInsightLoading ? <SpinnerIcon className="h-6 w-6 text-brand-primary animate-spin"/> : <p>{insight}</p>}
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6">
                    <h4 className="font-semibold text-gray-700">Type de cuisine</h4>
                    <div className="mt-2 space-y-2">
                        {uniqueCuisines.map(cuisine => (
                            <label key={cuisine} className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary" onChange={() => handleCuisineChange(cuisine)} checked={filters.cuisine.includes(cuisine)} />
                                <span className="ml-2 text-sm text-gray-600">{cuisine}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div className="mt-6">
                    <h4 className="font-semibold text-gray-700">Budget</h4>
                    <div className="mt-2 flex space-x-2">
                        {[1, 2, 3].map(budget => (
                             <button key={budget} onClick={() => handleBudgetChange(budget)} className={`px-4 py-1.5 text-sm rounded-full border ${filters.budget.includes(budget) ? 'bg-brand-secondary text-white border-brand-secondary' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                {'€'.repeat(budget)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 bg-gray-200 rounded-lg shadow-inner relative overflow-hidden">
                <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                {selectedRestaurant && <RestaurantCard restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)}/>}
            </div>
        </div>
    );
};

export default MapDiscovery;