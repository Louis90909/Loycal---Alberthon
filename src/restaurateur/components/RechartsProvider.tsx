import React, { createContext, useState, useEffect, useContext } from 'react';

interface RechartsContextType {
    Recharts: any | null;
}

const RechartsContext = createContext<RechartsContextType>({ Recharts: null });

export const RechartsProvider: React.FC<{ children: React.ReactNode, loader?: React.ReactNode }> = ({ children, loader }) => {
    const [recharts, setRecharts] = useState<any | null>(null);

    useEffect(() => {
        const checkRecharts = () => (window as any).Recharts && (window as any).Recharts.ResponsiveContainer;

        if (checkRecharts()) {
            setRecharts((window as any).Recharts);
            return;
        }

        const intervalId = setInterval(() => {
            if (checkRecharts()) {
                setRecharts((window as any).Recharts);
                clearInterval(intervalId);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    if (!recharts) {
        return loader || (
            <div className="w-full h-full flex items-center justify-center p-12">
                 <div className="text-center">
                    <svg className="animate-spin mx-auto h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading charts...</p>
                </div>
            </div>
        );
    }

    return (
        <RechartsContext.Provider value={{ Recharts: recharts }}>
            {children}
        </RechartsContext.Provider>
    );
};

export const useRecharts = () => {
    const context = useContext(RechartsContext);
    if (!context || !context.Recharts) {
        throw new Error('useRecharts must be used within a RechartsProvider and after Recharts has loaded');
    }
    return context.Recharts;
};
