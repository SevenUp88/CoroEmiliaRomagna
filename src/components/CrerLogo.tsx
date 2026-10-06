import React, { useState } from 'react';
import crerLogoAsset from '../assets/images/crer_official_logo_1790168392824.jpg';

interface CrerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const CrerLogo: React.FC<CrerLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  inverted = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Height mappings optimized for clean readability across all viewports
  const sizeClasses = {
    sm: 'h-11 sm:h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-16 sm:h-20 md:h-22',
    xl: 'h-24 sm:h-32 md:h-36'
  };

  const primaryColor = inverted ? '#ffffff' : '#00675b';
  const subtitleColor = inverted ? '#f0fdfa' : '#00675b';
  const redColor = '#c81d25';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {!imageError ? (
        <img
          src={crerLogoAsset}
          alt="Logo Ufficiale Coro Regionale dell'Emilia-Romagna"
          referrerPolicy="no-referrer"
          className={`${sizeClasses[size]} w-auto object-contain rounded-lg transition-transform duration-200 drop-shadow-2xs`}
          onError={() => setImageError(true)}
        />
      ) : (
        /* Fallback SVG with identical geometry and colors */
        <svg
          viewBox="0 0 340 92"
          className={`${sizeClasses[size]} w-auto shrink-0 transition-transform duration-200`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo Ufficiale Coro Regionale dell'Emilia-Romagna"
        >
          {/* Acronimo CRER */}
          <text
            x="4"
            y="36"
            fill={primaryColor}
            fontSize="41"
            fontWeight="900"
            letterSpacing="1.2"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            CRER
          </text>

          {/* Linea orizzontale rossa */}
          <rect x="4" y="42" width="332" height="3.2" fill={redColor} rx="1.6" />

          {/* Dicitura istituzionale */}
          {showSubtitle && (
            <text
              x="4"
              y="56"
              fill={subtitleColor}
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="0.4"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            >
              Coro Regionale dell’Emilia-Romagna
            </text>
          )}

          {/* Sagoma grafica sfaccettata */}
          <g transform="translate(0, 60)">
            <polygon points="4,24 28,24 40,9 16,9" fill="#86c9a9" />
            <polygon points="31,24 55,24 67,8 43,8" fill="#00675b" />
            <polygon points="58,24 82,24 94,7 70,7" fill="#43a37e" />
            <polygon points="85,25 99,25 111,6 97,6" fill="#0c644a" />
            <polygon points="102,25 126,25 138,5 114,5" fill="#43a37e" />
            <polygon points="129,26 173,26 185,4 141,4" fill={redColor} />
            <g transform="translate(145, 6)">
              <path
                d="M 6 12 L 6 3 L 22 1 L 22 10"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <polygon points="5,3 23,1 23,4.5 5,6.5" fill="#ffffff" />
              <ellipse cx="4.5" cy="12.5" rx="3.5" ry="2.5" transform="rotate(-20 4.5 12.5)" fill="#ffffff" />
              <ellipse cx="20.5" cy="10.5" rx="3.5" ry="2.5" transform="rotate(-20 20.5 10.5)" fill="#ffffff" />
            </g>
            <polygon points="176,26 200,26 212,5 188,5" fill="#1c7c64" />
            <polygon points="203,26 235,26 247,7 215,7" fill="#43a37e" />
            <polygon points="238,26 270,26 282,9 250,9" fill="#59b28f" />
            <polygon points="273,26 305,26 317,11 285,11" fill="#86c9a9" />
            <polygon points="308,26 334,26 336,13 320,13" fill="#a8dcbe" />
          </g>
        </svg>
      )}
    </div>
  );
};
