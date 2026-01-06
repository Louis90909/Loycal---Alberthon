import React, { useState } from 'react';
import type { OfferSuggestion } from '../../shared/types';
import { generateOffer } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MOCK_CUSTOMER_SEGMENTS } from '../../shared/constants';

const DynamicPromotions: React.FC = () => {
    const [step, setStep] = useState(1);
    const [objective, setObjective] = useState('');
    const [offerDetails, setOfferDetails] = useState({ type: '-15% sur l\'addition', duration: 'Ce soir (19h-22h)' });
    const [targetSegment, setTargetSegment] = useState(MOCK_CUSTOMER_SEGMENTS[2].name);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [generatedOffer, setGeneratedOffer] = useState<OfferSuggestion | null>(null);

    const handleAIGenerate = async () => {
        if (!objective) return;
        setIsAIGenerating(true);
        setGeneratedOffer(null);
        try {
            const result = await generateOffer(`Créer une promotion dynamique à durée limitée pour: "${objective}"`);
            setGeneratedOffer(result);
            setOfferDetails({ type: result.title, duration: 'Suggéré par IA' });
        } catch (error) {
            console.error(error);
        } finally {
            setIsAIGenerating(false);
        }
    };

    const reset = () => {
        setStep(1);
        setObjective('');
        setGeneratedOffer(null);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800">Promotions Dynamiques à Durée Limitée</h2>
                <p className="mt-2 text-gray-600">
                    Créez des offres ciblées pour stimuler l'activité pendant les heures creuses ou pour atteindre des objectifs spécifiques.
                </p>

                {/* Stepper */}
                <div className="mt-8">
                    <ol className="flex items-center w-full">
                        <li className={`flex w-full items-center ${step >= 1 ? 'text-brand-primary' : 'text-gray-400'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 1 ? 'after:border-brand-primary' : 'after:border-gray-200'} after:border-4 after:inline-block`}>
                           <span className={`flex items-center justify-center w-10 h-10 ${step >= 1 ? 'bg-brand-primary' : 'bg-gray-200'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                               <span className={step >= 1 ? 'text-white' : 'text-gray-500'}>1</span>
                           </span>
                        </li>
                        <li className={`flex w-full items-center ${step >= 2 ? 'text-brand-primary' : 'text-gray-400'} after:content-[''] after:w-full after:h-1 after:border-b ${step > 2 ? 'after:border-brand-primary' : 'after:border-gray-200'} after:border-4 after:inline-block`}>
                           <span className={`flex items-center justify-center w-10 h-10 ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-200'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                               <span className={step >= 2 ? 'text-white' : 'text-gray-500'}>2</span>
                           </span>
                        </li>
                         <li className={`flex items-center ${step >= 3 ? 'text-brand-primary' : 'text-gray-400'}`}>
                           <span className={`flex items-center justify-center w-10 h-10 ${step >= 3 ? 'bg-brand-primary' : 'bg-gray-200'} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                               <span className={step >= 3 ? 'text-white' : 'text-gray-500'}>3</span>
                           </span>
                        </li>
                    </ol>
                </div>

                {/* Step Content */}
                <div className="mt-8">
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold">Étape 1: Quel est votre objectif ?</h3>
                            <textarea
                                rows={3}
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                                placeholder="Ex: Remplir le restaurant mardi midi, qui est habituellement calme."
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <button onClick={() => setStep(2)} disabled={!objective} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-gray-300">Suivant</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold">Étape 2: Définissez la promotion</h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Type d'offre</label>
                                    <input type="text" value={offerDetails.type} onChange={e => setOfferDetails({...offerDetails, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Durée</label>
                                    <input type="text" value={offerDetails.duration} onChange={e => setOfferDetails({...offerDetails, duration: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                                </div>
                                 <div>
                                    <label className="text-sm font-medium">Ciblage</label>
                                    <select value={targetSegment} onChange={e => setTargetSegment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        {MOCK_CUSTOMER_SEGMENTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="mt-4 p-4 bg-brand-light rounded-lg">
                                <p className="font-semibold text-brand-dark">Besoin d'inspiration ?</p>
                                <p className="text-sm text-brand-dark">Laissez l'IA générer une offre basée sur votre objectif.</p>
                                <button onClick={handleAIGenerate} disabled={isAIGenerating} className="mt-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-brand-dark disabled:bg-gray-400 flex items-center">
                                    {isAIGenerating && <SpinnerIcon />}Générer avec l'IA
                                </button>
                                {generatedOffer && <p className="mt-2 text-sm text-green-700">Suggestion: "{generatedOffer.title}" pour les "{generatedOffer.target}"</p>}
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button onClick={() => setStep(1)} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Précédent</button>
                                <button onClick={() => setStep(3)} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-orange-700">Suivant</button>
                            </div>
                        </div>
                    )}
                    
                     {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold">Étape 3: Lancement</h3>
                            <div className="mt-4 p-4 border rounded-lg space-y-2">
                                <p><strong>Objectif:</strong> {objective}</p>
                                <p><strong>Offre:</strong> {offerDetails.type}</p>
                                <p><strong>Durée:</strong> {offerDetails.duration}</p>
                                <p><strong>Cible:</strong> {targetSegment}</p>
                            </div>
                            <div className="mt-6 flex justify-between">
                                <button onClick={() => setStep(2)} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Précédent</button>
                                <button onClick={reset} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Lancer la promotion</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Post-Campaign report */}
            <div className="mt-8 bg-surface rounded-lg shadow-md p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800">Performance de la dernière campagne</h3>
                <div className="mt-4 flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                        <p className="font-semibold text-green-800">Offre "Happy Hour" pour Clients Réguliers</p>
                        <p className="text-sm text-green-700">+35 visites générées, +850€ de CA additionnel</p>
                    </div>
                    <span className="px-3 py-1 bg-green-200 text-green-800 text-sm font-bold rounded-full">Campagne Réussie</span>
                </div>
            </div>
        </div>
    );
};

export default DynamicPromotions;
