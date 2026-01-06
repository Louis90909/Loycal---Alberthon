import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MOCK_REVENUE_FORECAST } from '../../shared/constants';

const RevenueForecast: React.FC = () => {
    const totalReal = MOCK_REVENUE_FORECAST.reduce((acc, cur) => acc + cur['CA Réel'], 0);
    const totalForecast = MOCK_REVENUE_FORECAST.reduce((acc, cur) => acc + cur['CA Prévu'], 0);
    
    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800">Prévision de Chiffre d'Affaires (Semaine)</h3>
            <p className="text-sm text-gray-500 mb-4">Suivez vos objectifs et ajustez votre stratégie.</p>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={MOCK_REVENUE_FORECAST}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(val) => `${val/1000}k`}/>
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`}/>
                    <Legend />
                    <Area type="monotone" dataKey="CA Prévu" stroke="#ff6f00" fill="#ff6f0033" strokeWidth={2} />
                    <Area type="monotone" dataKey="CA Réel" stroke="#1a237e" fill="#1a237e33" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-rose-50 rounded-lg text-sm text-rose-800 flex items-start">
                <span className="mr-2 text-lg">⚠️</span>
                <div>
                    <strong>Alerte IA:</strong> Objectif hebdo en retard de { (totalForecast-totalReal).toFixed(2) } €. Pensez à une promotion week-end pour les clients fidèles.
                </div>
            </div>
        </div>
    );
};

export default RevenueForecast;