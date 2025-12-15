import { useState } from 'react';

interface WavyTextProps {
    text: string;
    style?: React.CSSProperties;
    className?: string;
}

export default function WavyText({ text, style, className }: WavyTextProps) {
    const letters = text.split('');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            style={{ display: 'inline-block', ...style }}
            className={className}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            {letters.map((char, index) => {
                let scale = 1;
                let margin = 0;
                let translateY = 0;
                let color = 'inherit';
                let textShadow = 'none';

                if (hoveredIndex !== null) {
                    const distance = Math.abs(index - hoveredIndex);
                    if (distance === 0) {
                        scale = 2.5;
                        margin = 15;
                        translateY = -15;
                        color = '#00ffff';
                        textShadow = '0 0 15px cyan';
                    } else if (distance === 1) {
                        scale = 1.8;
                        margin = 8;
                        translateY = -8;
                        color = '#a5b4fc';
                    } else if (distance === 2) {
                        scale = 1.3;
                        margin = 4;
                        translateY = -3;
                    }
                }

                return (
                    <span
                        key={index}
                        className="wavy-char"
                        onMouseEnter={() => setHoveredIndex(index)}
                        style={{
                            display: 'inline-block',
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
                            transform: `translateY(${translateY}px) scale(${scale})`,
                            margin: `0 ${margin}px`,
                            color: color,
                            textShadow: textShadow,
                            cursor: 'pointer'
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                );
            })}
        </div>
    );
}
