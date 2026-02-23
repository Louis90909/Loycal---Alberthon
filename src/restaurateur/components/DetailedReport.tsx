
import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { RemiIcon } from './icons/RemiIcon';
import { generateAnalyticalReport } from '../services/geminiService';
import { getBackendService } from '../../shared/services/apiConfig';

interface DetailedReportProps {
    onClose: () => void;
    type: 'standard' | 'custom';
}

const DetailedReport: React.FC<DetailedReportProps> = ({ onClose, type }) => {
    const [isLoading, setIsLoading] = useState(type === 'custom');
    const [customTheme, setCustomTheme] = useState('Évolution du CA et Cohortes');
    const [reportContent, setReportContent] = useState<string | null>(null);

    const handleGenerateCustom = async () => {
        setIsLoading(true);
        try {
            const backend = await getBackendService();
            const user = backend.getCurrentUser();
            if (!user?.restaurantId) {
                throw new Error('Restaurant non trouvé');
            }
            const analytics = await backend.getAnalytics(
                user.restaurantId
            );
            const result = await generateAnalyticalReport(customTheme, analytics);
            setReportContent(result);
        } catch (error: any) {
            console.error('Error generating report:', error);
            alert(error.message || "Erreur lors de la génération.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-6 bg-brand-primary text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <RemiIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Rapport d'Intelligence Business</h2>
                            <p className="text-xs text-brand-light opacity-70">Généré par Loycal AI le {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    {type === 'custom' && !reportContent ? (
                        <div className="max-w-xl mx-auto space-y-6 mt-12">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-800">Personnalisez votre analyse</h3>
                                <p className="text-gray-500 mt-2">Rémi va croiser toutes vos données pour répondre à une problématique précise.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Thématique du rapport</label>
                                <textarea
                                    value={customTheme}
                                    onChange={(e) => setCustomTheme(e.target.value)}
                                    placeholder="Ex: Analyse de la rentabilité des offres du midi vs soir..."
                                    rows={4}
                                    className="w-full border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary outline-none bg-slate-50"
                                />
                                <button
                                    onClick={handleGenerateCustom}
                                    disabled={isLoading}
                                    className="w-full mt-6 py-4 bg-brand-secondary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all flex justify-center items-center"
                                >
                                    {isLoading ? <SpinnerIcon className="w-6 h-6" /> : "Générer le rapport avec l'IA"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10 prose prose-slate">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <SpinnerIcon className="w-12 h-12 text-brand-primary mb-4" />
                                    <p className="text-gray-500 font-medium">Rémi analyse les cohortes et les flux financiers...</p>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                                        <h1 className="text-3xl font-black text-gray-900 leading-tight">Synthèse Stratégique</h1>
                                        <button className="flex items-center text-xs font-bold text-brand-primary border-2 border-brand-primary px-3 py-1 rounded-lg hover:bg-brand-primary hover:text-white transition-all">
                                            📥 Télécharger PDF
                                        </button>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed space-y-4">
                                        {reportContent ? (
                                            reportContent.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-bold">1. Performance Globale</h3>
                                                <p>Votre taux de fidélisation est stable à 32%. Le panier moyen des membres (38€) surpasse de 18% celui des non-membres (32€). Cette différence génère un surplus de CA estimé à 1 200€ ce mois-ci.</p>
                                                <h3 className="text-xl font-bold">2. Analyse des Segments</h3>
                                                <p>Le segment "À risque" a diminué de 5% grâce aux dernières campagnes automatisées. Cependant, les "Nouveaux" ont un taux de transformation en "Habitués" qui plafonne à 12%, indiquant un manque de friction positive lors de la 2ème visite.</p>
                                                <h3 className="text-xl font-bold">3. Recommandations Rémi</h3>
                                                <ul className="list-disc pl-5 space-y-2">
                                                    <li><strong>Boost 2ème visite :</strong> Offrez un avantage exclusif valable uniquement sous 14 jours après la première visite.</li>
                                                    <li><strong>Optimisation Midi :</strong> Les mardis midis affichent un creux récurent. Lancez une offre "Tampons Doublés" sur ce créneau.</li>
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
                    <p className="text-[10px] text-gray-400">LOYCAL AI • ANALYTICS ENGINE V2.5 • CONFIDENTIEL</p>
                </div>
            </div>
        </div>
    );
};

export default DetailedReport;
