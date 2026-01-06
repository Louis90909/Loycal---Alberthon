
import React from 'react';

export const RemiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Fond Cercle Bleu Nuit */}
        <circle cx="256" cy="256" r="256" fill="#0D123C"/>
        
        {/* Oreilles */}
        <circle cx="165" cy="230" r="55" fill="#E5E7EB"/>
        <circle cx="347" cy="230" r="55" fill="#E5E7EB"/>
        <circle cx="165" cy="230" r="35" fill="#F472B6"/> {/* Rose oreille */}
        <circle cx="347" cy="230" r="35" fill="#F472B6"/>

        {/* Tête */}
        <ellipse cx="256" cy="310" rx="110" ry="100" fill="#E5E7EB"/>
        
        {/* Toque de Chef */}
        <path d="M180 180C170 120 210 60 256 60C302 60 342 120 332 180H180Z" fill="white"/>
        <rect x="176" y="180" width="160" height="40" rx="8" fill="#F3F4F6"/>
        <path d="M176 220H336" stroke="#D1D5DB" strokeWidth="2"/>

        {/* Yeux */}
        <circle cx="216" cy="270" r="12" fill="#1F2937"/>
        <circle cx="296" cy="270" r="12" fill="#1F2937"/>
        
        {/* Nez & Moustaches */}
        <circle cx="256" cy="310" r="18" fill="#F472B6"/>
        <path d="M170 310H120M170 325H130M342 310H392M342 325H382" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>

        {/* Burger dans les mains */}
        <g transform="translate(0, 20)">
            <path d="M206 380H306" stroke="#D97706" strokeWidth="24" strokeLinecap="round"/> {/* Pain bas */}
            <path d="M206 360H306" stroke="#10B981" strokeWidth="8" strokeLinecap="round"/> {/* Salade */}
            <path d="M206 350H306" stroke="#78350F" strokeWidth="12" strokeLinecap="round"/> {/* Steak */}
            <path d="M216 335H296" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round"/> {/* Pain haut */}
        </g>
        
        {/* Mains */}
        <circle cx="206" cy="380" r="20" fill="#E5E7EB"/>
        <circle cx="306" cy="380" r="20" fill="#E5E7EB"/>
    </svg>
);
