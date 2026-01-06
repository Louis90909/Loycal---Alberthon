import React from 'react';
import type { LoyerClientView } from '../../shared/types';
import { MapIcon } from '../../restaurateur/components/icons/MapIcon';
import { ExploreIcon } from './icons/ExploreIcon';
import { TagIcon } from './icons/TagIcon';
import { UserIcon } from './icons/UserIcon';
import { QrCodeIcon } from './icons/QrCodeIcon'; 

interface LoyerBottomNavProps {
    currentView: LoyerClientView;
    setCurrentView: (view: LoyerClientView) => void;
    onOpenInResto?: () => void;
}

const LoyerBottomNav: React.FC<LoyerBottomNavProps> = ({ currentView, setCurrentView, onOpenInResto }) => {
    
    const leftItems = [
        { id: 'explore', label: 'Explorer', icon: ExploreIcon },
        { id: 'map', label: 'Carte', icon: MapIcon },
    ];
    const rightItems = [
        { id: 'loyalty', label: 'Fidélité', icon: TagIcon },
        { id: 'profile', label: 'Profil', icon: UserIcon },
    ];

    return (
        <div className="absolute bottom-8 left-6 right-6 z-40">
            <nav className="h-20 bg-white/95 backdrop-blur-2xl rounded-3xl flex justify-between items-center px-6 shadow-2xl border-2 border-gray-200">
                
                {/* Left Group */}
                <div className="flex space-x-2">
                    {leftItems.map(item => {
                        const isActive = currentView === item.id;
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setCurrentView(item.id as any)}
                                className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${
                                    isActive 
                                        ? 'bg-orange-50 text-orange-600' 
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <item.icon className="w-7 h-7" />
                                <span className={`text-[10px] font-bold mt-1 ${isActive ? '' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* CENTER ACTION BUTTON */}
                <div className="relative -top-8">
                    <button 
                        onClick={onOpenInResto}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/40 flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95 border-4 border-white group"
                    >
                        <QrCodeIcon className="w-10 h-10 group-hover:rotate-6 transition-transform" />
                    </button>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-gray-600 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                        Au Resto
                    </span>
                </div>

                {/* Right Group */}
                <div className="flex space-x-2">
                    {rightItems.map(item => {
                        const isActive = currentView === item.id;
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setCurrentView(item.id as any)}
                                className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${
                                    isActive 
                                        ? 'bg-orange-50 text-orange-600' 
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <item.icon className="w-7 h-7" />
                                <span className={`text-[10px] font-bold mt-1 ${isActive ? '' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

            </nav>
        </div>
    );
};

export default LoyerBottomNav;
