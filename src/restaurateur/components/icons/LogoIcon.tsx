
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Fond Cercle Bleu Nuit */}
        <circle cx="256" cy="256" r="256" fill="#0D123C"/>
        
        {/* Pin Vert (Forme de goutte) */}
        <path d="M256 110C194.1 110 144 160.1 144 222C144 306 256 428 256 428C256 428 368 306 368 222C368 160.1 317.9 110 256 110Z" fill="#34D399"/>
        
        {/* Ombre portée interne légère */}
        <ellipse cx="256" cy="222" rx="60" ry="60" fill="black" fillOpacity="0.1"/>

        {/* Coche (Checkmark) Blanche */}
        <path d="M206 222L236 252L306 182" stroke="white" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
