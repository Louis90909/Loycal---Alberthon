
import React, { useState, useMemo, useEffect } from 'react';
import type { Restaurant, FlashPromotion } from '../../shared/types';
import { mockBackend } from '../../shared/mockBackend';
import { RemiIcon } from '../../restaurateur/components/icons/RemiIcon';
import { SpinnerIcon } from '../../restaurateur/components/icons/SpinnerIcon';
import { NfcIcon } from './icons/NfcIcon'; 

interface InRestoFlowProps {
    restaurants: Restaurant[];
    onClose: () => void;
}

type FlowStep = 'locator' | 'dashboard' | 'validate' | 'nfc-scan' | 'success';

const InRestoFlow: React.FC<InRestoFlowProps> = ({ restaurants, onClose }) => {
    const [step, setStep] = useState<FlowStep>('locator');
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [validationCode, setValidationCode] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [flashPromos, setFlashPromos] = useState<FlashPromotion[]>([]);

    useEffect(() => {
        const loadFlashPromos = async () => {
            if (selectedRestaurant) {
                try {
                    const promos = await mockBackend.getFlashPromotions(selectedRestaurant.id);
                    setFlashPromos(promos);
                } catch (error) {
                    console.error('Error loading flash promotions:', error);
                }
            }
        };
        loadFlashPromos();
    }, [selectedRestaurant]);

    const nearbyRestaurants = useMemo(() => [...restaurants].sort((a, b) => a.distance - b.distance), [restaurants]);

    const handleSelectRestaurant = (r: Restaurant) => { setSelectedRestaurant(r); setStep('dashboard'); };

    const handleValidateVisit = async (e?: React.FormEvent, method: 'code' | 'nfc' = 'code') => {
        if(e) e.preventDefault();
        if (!selectedRestaurant) return;
        
        setIsSubmitting(true); 
        setErrorMsg(null);
        
        try {
            const user = mockBackend.getCurrentUser();
            if (!user) {
                throw new Error('Vous devez être connecté pour valider une visite');
            }

            const result = await mockBackend.validateVisit(
                user.id, 
                selectedRestaurant.id, 
                method === 'nfc' ? '1234' : validationCode, 
                amount ? parseFloat(amount) : undefined
            );
            
            if (result.success) { 
                setPointsEarned(result.pointsEarned); 
                setStep('success'); 
            } else { 
                setErrorMsg(result.message || "Code incorrect. Veuillez réessayer."); 
                if(method === 'nfc') {
                    setTimeout(() => setStep('validate'), 2000);
                }
            }
        } catch (error: any) {
            console.error('Error validating visit:', error);
            setErrorMsg(error.message || "Erreur lors de la validation. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startNfcScan = () => { 
        setStep('nfc-scan'); 
        setTimeout(() => handleValidateVisit(undefined, 'nfc'), 2500); 
    };

    const renderLocator = () => (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 animate-fade-in">
            <div className="p-6 bg-white dark:bg-slate-800 shadow-sm z-10 pt-16">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Où mangez-vous ? 📍</h1>
                <p className="text-gray-500 text-sm">Sélectionnez l'établissement pour valider vos points.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {nearbyRestaurants.map(r => (
                    <div key={r.id} onClick={() => handleSelectRestaurant(r)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 cursor-pointer hover:bg-brand-light/30 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-cover bg-center" style={{backgroundImage: `url('https://picsum.photos/seed/${r.id}/100')`}}></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">{r.name}</h3>
                            <p className="text-xs text-gray-500">{r.cuisine} • {r.distance}m</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDashboard = () => selectedRestaurant && (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 animate-fade-in overflow-y-auto">
            <div className="relative h-56 w-full flex-shrink-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('https://picsum.photos/seed/${selectedRestaurant.id}/400')`}}></div>
                <div className="absolute inset-0 bg-black/50"></div>
                <button onClick={() => setStep('locator')} className="absolute top-14 left-4 bg-white/20 p-2 rounded-full backdrop-blur-md text-white shadow-xl">←</button>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h1 className="text-3xl font-extrabold">{selectedRestaurant.name}</h1>
                </div>
            </div>
            
            <div className="p-6 space-y-8">
                {/* ACTIONS PRIORITAIRES */}
                <button onClick={() => setStep('validate')} className="w-full py-5 bg-brand-primary text-white rounded-3xl font-black shadow-xl flex items-center justify-center text-lg active:scale-95 transition-transform ring-4 ring-brand-primary/10">
                    🎟️ Valider ma visite
                </button>

                {/* VENTES FLASH ACTIVES (URGENT) */}
                {flashPromos.length > 0 && (
                    <div className="animate-fade-in-up">
                        <h2 className="font-black text-brand-secondary mb-3 uppercase text-xs tracking-widest flex items-center">
                            <span className="animate-pulse mr-2">⚡</span> Offres Éclairs Disponibles
                        </h2>
                        <div className="space-y-4">
                            {flashPromos.map(promo => (
                                <div key={promo.id} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-3xl border border-orange-200 dark:border-orange-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-black text-orange-900 dark:text-orange-400">{promo.itemName}</p>
                                            <p className="text-xs text-orange-700/70 font-bold uppercase">Plus que {promo.quantityRemaining} disponibles !</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-orange-900 dark:text-orange-300">{promo.discountPrice.toFixed(2)} €</p>
                                            <p className="text-[10px] line-through text-orange-700/50">{promo.originalPrice.toFixed(2)} €</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-orange-200/50 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-orange-500 rounded-full" style={{width: `${(promo.quantityRemaining/promo.quantityTotal)*100}%`}}></div>
                                    </div>
                                    <button 
                                        className="w-full py-2 bg-brand-secondary text-white text-xs font-black rounded-xl uppercase tracking-widest"
                                        onClick={() => {
                                            const user = mockBackend.getCurrentUser();
                                            alert("Offre activée ! Présentez votre écran en caisse pour en bénéficier.");
                                            if (user) {
                                                mockBackend.activatePromo(user.id, promo.id);
                                            }
                                        }}
                                    >
                                        Profiter maintenant
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* OFFRES CLASSIQUES */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h2 className="font-bold text-gray-800 dark:text-white mb-3 uppercase text-[10px] tracking-[0.2em] opacity-50">Autres avantages</h2>
                    {selectedRestaurant.activePromotions?.map(p => (
                        <div key={p.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center mb-3 shadow-sm">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{p.title}</p>
                                <p className="text-[10px] text-gray-500">{p.description}</p>
                            </div>
                            <button 
                                className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs font-bold rounded-xl shadow-sm" 
                                onClick={() => {
                                    const user = mockBackend.getCurrentUser();
                                    if (user) {
                                        mockBackend.activatePromo(user.id, p.id);
                                    }
                                }}
                            >
                                Activer
                            </button>
                        </div>
                    ))}
                    {(!selectedRestaurant.activePromotions || selectedRestaurant.activePromotions.length === 0) && flashPromos.length === 0 && (
                        <p className="text-gray-400 text-xs italic text-center py-4">Aucune offre disponible pour le moment.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderValidate = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-fade-in p-6 pt-16">
            <button onClick={() => setStep('dashboard')} className="self-start text-gray-400 mb-6 font-bold text-sm flex items-center">← Retour</button>
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
                <button onClick={startNfcScan} className="w-full py-5 mb-8 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 transition-transform active:scale-95 shadow-xl">
                    <div className="animate-pulse"><NfcIcon className="w-6 h-6" /></div>
                    <span>Valider avec NFC</span>
                </button>
                <div className="flex items-center w-full mb-8 text-gray-300">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="px-4 text-[10px] text-gray-400 font-bold tracking-widest">OU SAISIR UN CODE</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <form onSubmit={(e) => handleValidateVisit(e, 'code')} className="w-full space-y-6">
                    <div>
                        <input 
                            type="text" 
                            maxLength={4} 
                            placeholder="0000" 
                            className={`w-full text-center text-4xl p-4 rounded-2xl border-2 transition-all outline-none font-mono ${errorMsg ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 focus:border-brand-primary dark:bg-slate-800'}`}
                            value={validationCode} 
                            onChange={e => { setValidationCode(e.target.value); setErrorMsg(null); }} 
                        />
                        {errorMsg && <p className="text-red-500 text-xs text-center font-bold mt-2">{errorMsg}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting || validationCode.length < 4} className="w-full py-5 bg-brand-secondary text-white font-bold rounded-2xl shadow-lg disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex justify-center items-center">
                        {isSubmitting ? <SpinnerIcon className="w-6 h-6" /> : "Confirmer le code"}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderNfcScan = () => (
        <div className="flex flex-col h-full bg-brand-dark/95 text-white animate-fade-in items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute w-[500px] h-[500px] bg-brand-primary/30 rounded-full animate-ping opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 animate-bounce shadow-2xl"><NfcIcon className="w-12 h-12 text-brand-dark" /></div>
                <h2 className="text-2xl font-bold mb-2">Validation sans contact</h2>
                <p className="text-white/70 text-center text-sm">Approchez le haut de votre mobile de la borne Loycal située près de la caisse.</p>
            </div>
            <button onClick={() => setStep('validate')} className="absolute bottom-12 text-white/50 font-bold hover:text-white transition-colors">Annuler le scan</button>
        </div>
    );

    const renderSuccess = () => (
        <div className="flex flex-col h-full bg-brand-primary text-white animate-fade-in items-center justify-center p-8 text-center relative overflow-hidden">
             <div className="w-40 h-40 mb-6 animate-bounce"><RemiIcon className="w-full h-full drop-shadow-2xl" /></div>
             <h1 className="text-4xl font-extrabold mb-2">Félicitations !</h1>
             <p className="text-xl mb-8">Votre visite chez <strong>{selectedRestaurant?.name}</strong> est validée.</p>
             <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 w-full max-w-xs shadow-2xl">
                 <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-widest">Points accumulés</p>
                 <p className="text-6xl font-extrabold text-brand-secondary mb-2 animate-pulse">+{pointsEarned}</p>
                 <p className="text-sm font-medium">Programme Fidélité</p>
             </div>
             <button onClick={onClose} className="mt-12 w-full py-4 bg-white text-brand-primary font-bold rounded-2xl shadow-xl hover:bg-gray-100 transition-colors">Terminer</button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            {step === 'locator' && renderLocator()}
            {step === 'dashboard' && renderDashboard()}
            {step === 'validate' && renderValidate()}
            {step === 'nfc-scan' && renderNfcScan()}
            {step === 'success' && renderSuccess()}
            {['locator', 'validate', 'dashboard'].includes(step) && (
                <button onClick={onClose} className="absolute top-14 right-4 bg-gray-100/50 dark:bg-slate-800/50 p-2 rounded-full text-gray-500 z-[210] backdrop-blur-sm">✕</button>
            )}
        </div>
    );
};
export default InRestoFlow;
