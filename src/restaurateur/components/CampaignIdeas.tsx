import React, { useState } from 'react';
import type { CampaignIdea } from '../../shared/types';
import { generateCampaign } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MOCK_CUSTOMER_SEGMENTS } from '../../shared/constants';

const CampaignIdeaCard: React.FC<{ idea: CampaignIdea }> = ({ idea }) => (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-brand-primary">Campagne {idea.channel} pour "{idea.targetSegment}"</h3>
                <p className="text-sm text-gray-500">Objectif : {idea.objective}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${idea.channel === 'SMS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {idea.channel}
            </span>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap font-mono">{idea.message}</p>
        </div>
    </div>
);

const CampaignIdeas: React.FC = () => {
    const [objective, setObjective] = useState('');
    const [segment, setSegment] = useState(MOCK_CUSTOMER_SEGMENTS[3].name); // Default to "Clients Dormants"
    const [idea, setIdea] = useState<CampaignIdea | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!objective || !segment) {
            setError('Veuillez choisir un segment et décrire votre objectif.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setIdea(null);

        try {
            const result = await generateCampaign(objective, segment);
            setIdea(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800">Générateur d'Idées de Campagnes</h2>
                <p className="mt-2 text-gray-600">
                    Ciblez un segment de clientèle, décrivez votre objectif et recevez une proposition de message prête à l'emploi.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="segment" className="block text-sm font-medium text-gray-700">
                            Segment de clientèle
                        </label>
                        <select
                            id="segment"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                            value={segment}
                            onChange={(e) => setSegment(e.target.value)}
                        >
                            {MOCK_CUSTOMER_SEGMENTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="objective" className="block text-sm font-medium text-gray-700">
                            Objectif de la campagne
                        </label>
                        <input
                            type="text"
                            id="objective"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                            placeholder="Ex: Réactiver avec une offre spéciale"
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400"
                    >
                        {isLoading ? <SpinnerIcon /> : "Générer une idée de campagne"}
                    </button>
                </div>
            </div>
            
            {error && <div className="mt-6 text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

            {isLoading && !idea && (
                 <div className="mt-6 text-center text-gray-600">
                    <p>Loycal AI prépare une campagne percutante...</p>
                </div>
            )}

            {idea && <CampaignIdeaCard idea={idea} />}
        </div>
    );
};

export default CampaignIdeas;