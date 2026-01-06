import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MOCK_DEMAND_FORECAST } from '../../shared/constants';

const DemandForecast: React.FC = () => {
    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800">Prévision de Fréquentation (Aujourd'hui)</h3>
            <p className="text-sm text-gray-500 mb-4">Anticipez les pics et les heures creuses.</p>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MOCK_DEMAND_FORECAST}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Visites Prévues" stroke="#ff6f00" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Visites Actuelles" stroke="#1a237e" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
             <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-start">
                <span className="mr-2 text-lg">💡</span>
                <div>
                    <strong>Suggestion IA:</strong> Un creux est attendu vers 14h. Proposez une offre "Café gourmand offert" de 14h à 16h pour stimuler les visites.
                </div>
            </div>
        </div>
    );
};

export default DemandForecast;