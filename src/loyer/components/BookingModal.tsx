
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../shared/mockBackend';
import { SpinnerIcon } from '../../restaurateur/components/icons/SpinnerIcon';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantName: string;
    restaurantId: number;
    flashPromo?: {
        id: string;
        itemName: string;
        discountPrice: number;
        originalPrice: number;
    };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, restaurantName, restaurantId, flashPromo }) => {
    const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
    const [guests, setGuests] = useState(2);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('20:00');

    useEffect(() => {
        if (isOpen) setStep('form');
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');

        try {
            const user = mockBackend.getCurrentUser();
            if (!user) {
                throw new Error('Vous devez être connecté pour réserver');
            }

            await mockBackend.createReservation({
                restaurantId,
                userId: user.id,
                date,
                time,
                guests,
                status: 'confirmed',
                ...(flashPromo ? { flashPromoId: flashPromo.id } : {})
            } as any);
            setStep('success');
        } catch (error: any) {
            console.error('Error creating reservation:', error);
            alert(error.message || "Erreur lors de la réservation. Veuillez réessayer.");
            setStep('form');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">

                <div className="bg-brand-primary p-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
                    {flashPromo ? (
                        <>
                            <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block mb-2">⚡ OFFRE FLASH</div>
                            <h2 className="text-xl font-bold">{flashPromo.itemName}</h2>
                            <p className="text-sm opacity-90 mt-1">{restaurantName}</p>
                            <div className="mt-3 flex items-baseline justify-center space-x-2">
                                <span className="text-2xl font-black">{flashPromo.discountPrice.toFixed(2)} €</span>
                                <span className="text-sm line-through opacity-60">{flashPromo.originalPrice.toFixed(2)} €</span>
                            </div>
                        </>
                    ) : (
                        <h2 className="text-xl font-bold">Réserver chez {restaurantName}</h2>
                    )}
                </div>

                <div className="p-6">
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!flashPromo && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre de personnes</label>
                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-xl p-2">
                                        <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg font-bold text-gray-600 dark:text-white shadow-sm">-</button>
                                        <span className="font-bold text-lg text-gray-900 dark:text-white">{guests}</span>
                                        <button type="button" onClick={() => setGuests(guests + 1)} className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg font-bold text-gray-600 dark:text-white shadow-sm">+</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="w-full bg-gray-100 dark:bg-slate-700 border-transparent rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Heure</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                        className="w-full bg-gray-100 dark:bg-slate-700 border-transparent rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-brand-secondary text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-transform active:scale-95 mt-4">
                                Confirmer la réservation
                            </button>
                        </form>
                    )}

                    {step === 'loading' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <SpinnerIcon className="w-12 h-12 text-brand-primary mb-4" />
                            <p className="font-bold text-gray-800 dark:text-white">Validation de votre table...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Réservé !</h3>
                            <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                                Votre table pour {guests} personnes<br />
                                est confirmée pour le {new Date(date).toLocaleDateString()} à {time}.
                            </p>
                            <button onClick={onClose} className="px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl shadow-md">
                                Parfait, merci !
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
