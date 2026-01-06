
import React from 'react';

export const RatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" {...props}>
        {/* Simple stylized Rat/Mouse Face */}
        <circle cx="256" cy="256" r="200" fill="#E5E7EB" /> {/* Background circle */}
        <path fill="#4B5563" d="M160,160 Q120,80 160,20 Z" /> {/* Left Ear */}
        <path fill="#4B5563" d="M352,160 Q392,80 352,20 Z" /> {/* Right Ear */}
        <path fill="#F9FAFB" d="M256,120 Q380,120 380,300 Q256,420 132,300 Q132,120 256,120 Z" /> {/* Face Shape */}
        <circle cx="200" cy="240" r="20" fill="#1F2937" /> {/* Left Eye */}
        <circle cx="312" cy="240" r="20" fill="#1F2937" /> {/* Right Eye */}
        <path fill="#EC4899" d="M240,320 Q256,340 272,320 L256,300 Z" /> {/* Nose */}
        <path fill="none" stroke="#4B5563" strokeWidth="6" d="M256,330 L256,360 M180,340 Q210,360 256,360 Q302,360 332,340" /> {/* Mouth & Whiskers base */}
        <path fill="none" stroke="#9CA3AF" strokeWidth="4" d="M150,320 L100,310 M150,330 L100,340 M362,320 L412,310 M362,330 L412,340" /> {/* Whiskers */}
        <path fill="#3B82F6" d="M180,380 L332,380 L300,450 L212,450 Z" opacity="0.8" /> {/* Tie/Collar (Expert Look) */}
    </svg>
);
