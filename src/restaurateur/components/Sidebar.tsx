import React from 'react';
import type { RestaurateurView } from '../../shared/types';
import { DashboardIcon } from './icons/DashboardIcon';
import { CustomerIcon } from './icons/CustomerIcon';
import { LogoIcon } from './icons/LogoIcon';
import { OfferIcon } from './icons/OfferIcon';
import { CampaignIcon } from './icons/CampaignIcon';
import { RemiIcon } from './icons/RemiIcon';
import { StoreIcon } from './icons/StoreIcon';

interface SidebarProps {
    currentView: RestaurateurView;
    setCurrentView: (view: RestaurateurView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Vue d\'ensemble', icon: DashboardIcon, description: 'Tableau de bord' },
        {
            id: 'reservations', label: 'Réservations', icon: (props: any) => (
                <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ), description: 'Tables & Flash'
        },
        { id: 'loyalty-program', label: 'Programme Fidélité', icon: OfferIcon, description: 'Configuration' },
        { id: 'campaigns', label: 'Campagnes & Promos', icon: CampaignIcon, description: 'Marketing' },
        { id: 'customers', label: 'Base Clients', icon: CustomerIcon, description: 'Gestion clients' },
        {
            id: 'analytics', label: 'Analyses & Rapports', icon: (props: any) => (
                <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ), description: 'Statistiques'
        },
        { id: 'profile-editor', label: 'Mon Établissement', icon: StoreIcon, description: 'Profil & menu' },
    ] as const;

    return (
        <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-3 h-20 px-6 border-b border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center shadow-md">
                    <LogoIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Loycal</h1>
                    <p className="text-xs text-gray-500 font-medium">Intelligence Fidélité</p>
                </div>
            </div>

            {/* Navigation principale */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {/* Rémi Expert IA - CTA prioritaire */}
                <button
                    onClick={() => setCurrentView('remi-expert')}
                    className={`group flex items-center w-full px-4 py-3.5 mb-6 text-sm font-semibold transition-all duration-200 rounded-2xl relative overflow-hidden ${currentView === 'remi-expert'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                            : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 hover:border-orange-300'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <RemiIcon className="h-6 w-6 mr-3 z-10 flex-shrink-0" />
                    <span className="z-10">Rémi Expert IA</span>
                    <svg className="w-4 h-4 ml-auto z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Menu principal */}
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id as RestaurateurView)}
                                className={`group flex items-start w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                <div className="flex-1 text-left">
                                    <div className={isActive ? 'font-semibold' : ''}>{item.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* POS - Accès rapide */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                    <button
                        onClick={() => setCurrentView('pos')}
                        className="group flex items-center w-full px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Caisse / POS</span>
                        <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Footer - Version */}
            <div className="px-6 py-4 border-t border-gray-200">
                <div className="text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                        <span>Version 2.0</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">PRO</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
