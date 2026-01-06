import React, { useState } from 'react';
import { mockBackend } from '../../shared/mockBackend';

interface HeaderProps {
    title: string;
    onNavigate?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
    const [showMenu, setShowMenu] = useState(false);
    const user = mockBackend.getCurrentUser();
    const restaurant = user?.restaurantId
        ? mockBackend.getRestaurants().find(r => r.id === user.restaurantId)
        : null;

    const handleLogout = () => {
        mockBackend.logout();
        window.location.reload();
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200 shadow-sm">
            {/* Titre de la page */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Bienvenue sur votre dashboard</p>
            </div>

            {/* Actions & Profil */}
            <div className="flex items-center gap-4">
                {/* Quick Actions */}
                <button
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                    title="Notifications"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="hidden lg:inline">Notifications</span>
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">3</span>
                </button>

                {/* Infos Restaurant + Avatar */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-gray-900">
                                {restaurant?.name || 'Mon Restaurant'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {restaurant?.address || 'Adresse non définie'}
                            </p>
                        </div>

                        <div className="relative">
                            <img
                                className="h-11 w-11 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                src={restaurant?.imageUrl || 'https://picsum.photos/id/1025/100/100'}
                                alt="Restaurant"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{restaurant?.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={() => onNavigate?.('profile-editor')}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Mon Profil</span>
                                </button>
                                <button
                                    onClick={() => onNavigate?.('settings')}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Paramètres</span>
                                </button>
                                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Aide & Support</span>
                                </button>
                            </div>

                            <div className="border-t border-gray-100 py-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
