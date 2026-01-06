import React from 'react';
import { MOCK_RESTAURANTS } from '../../shared/constants';
import { MapIcon } from './icons/MapIcon';
import { UserIcon } from '../../loyer/components/icons/UserIcon';
import { TagIcon } from '../../loyer/components/icons/TagIcon';
import { ExploreIcon } from '../../loyer/components/icons/ExploreIcon';


const AppPreview: React.FC = () => {
    return (
        <div className="absolute inset-0 flex justify-center items-center p-4">
            {/* Phone Mockup */}
            <div className="w-full max-w-[375px] aspect-[375/812] bg-slate-800 rounded-[40px] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[30px] overflow-hidden flex flex-col relative">
                    {/* Dynamic Island */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-slate-800 rounded-b-xl z-20"></div>

                    {/* App Header */}
                    <header className="px-4 pt-12 pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500">Bonjour,</p>
                                <h1 className="text-2xl font-bold text-gray-800">Alexandre</h1>
                            </div>
                            <img src="https://picsum.photos/id/237/100/100" alt="User profile" className="w-12 h-12 rounded-full" />
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-4 space-y-6 pb-24">
                        {/* Loyalty Card */}
                        <div className="bg-brand-primary text-white p-6 rounded-2xl shadow-lg">
                            <p className="text-sm font-light text-brand-light opacity-80">Vos Points Loycal</p>
                            <p className="text-4xl font-bold mt-1">428 pts</p>
                            <div className="w-full bg-brand-dark rounded-full h-2 mt-4">
                                <div className="bg-brand-secondary h-2 rounded-full" style={{width: "65%"}}></div>
                            </div>
                            <p className="text-xs text-brand-light opacity-80 mt-2">Plus que 72 pts avant votre prochaine récompense !</p>
                        </div>

                        {/* Recommendations */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Pour Vous</h2>
                            <div className="mt-3 space-y-3">
                                {MOCK_RESTAURANTS.slice(0, 4).map(resto => (
                                    <div key={resto.id} className="flex items-center p-3 bg-gray-50 rounded-xl space-x-4 hover:bg-gray-100 transition-colors">
                                        <div className="w-16 h-16 bg-cover bg-center rounded-lg" style={{backgroundImage: `url('https://picsum.photos/seed/${resto.id}/200')`}}></div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{resto.name}</h3>
                                            <p className="text-sm text-gray-500">{resto.cuisine}</p>
                                            <p className="text-xs text-amber-600 font-medium mt-1">{resto.offer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Bottom Navigation */}
                    <nav className="absolute bottom-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-md border-t border-gray-200 rounded-b-[30px] flex justify-around items-center">
                        <button className="flex flex-col items-center justify-center text-brand-secondary">
                            <ExploreIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">Accueil</span>
                        </button>
                        <button className="flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary">
                            <MapIcon className="w-6 h-6" />
                            <span className="text-xs">Carte</span>
                        </button>
                        <button className="flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary">
                            <TagIcon className="w-6 h-6" />
                            <span className="text-xs">Offres</span>
                        </button>
                        <button className="flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary">
                            <UserIcon className="w-6 h-6" />
                            <span className="text-xs">Profil</span>
                        </button>
                    </nav>

                </div>
            </div>
        </div>
    );
};

export default AppPreview;