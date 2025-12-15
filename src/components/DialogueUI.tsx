
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface DialogueUIProps {
    speaker: string;
    text: string;
    show: boolean;
    onComplete?: () => void;
    actions?: { label: string; onClick: () => void }[];
}

export default function DialogueUI({ speaker, text, show, onComplete, actions }: DialogueUIProps) {
    const [displayedText, setDisplayedText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Typewriter Effect
    useEffect(() => {
        if (!show) {
            setDisplayedText('');
            return;
        }

        let currentText = '';
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                currentText += text[index];
                setDisplayedText(currentText);
                index++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 30); // 30ms per char

        return () => clearInterval(interval);
    }, [text, show, onComplete]);

    // Appearance Animation
    useEffect(() => {
        if (show && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }
            );
        }
    }, [show]);

    if (!show) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '1000px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 1000,
                pointerEvents: 'none'
            }}
        >
            {/* Tech HUD Frame */}
            <div style={{
                position: 'relative',
                padding: '20px 60px',
                background: 'rgba(0, 20, 40, 0.4)', // Very subtle tint
                backdropFilter: 'blur(2px)',
                borderLeft: '4px solid #00ffff',
                borderRight: '4px solid #00ffff',
                borderRadius: '4px'
            }}>
                {/* Corner Accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '2px', background: '#00ffff' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '2px', background: '#00ffff' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '2px', background: '#00ffff' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '2px', background: '#00ffff' }}></div>

                <div style={{
                    color: '#00ffff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    textAlign: 'left'
                }}>
                    INCOMING TRANSMISSION // {speaker}
                </div>

                <div
                    ref={textRef}
                    style={{
                        color: 'white',
                        fontSize: '28px',
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                        minHeight: '40px',
                        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                    }}
                >
                    {displayedText}
                    <span className="blinking-cursor">_</span>
                </div>
            </div>

            {/* Actions */}
            {actions && displayedText.length === text.length && (
                <div style={{ marginTop: '30px', display: 'flex', gap: '40px', justifyContent: 'center', pointerEvents: 'auto' }}>
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            style={{
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: '1px solid #00ffff',
                                color: '#00ffff',
                                padding: '12px 30px',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                fontSize: '16px',
                                textTransform: 'uppercase',
                                transition: 'all 0.2s',
                                letterSpacing: '2px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#00ffff';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 20px #00ffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                e.currentTarget.style.color = '#00ffff';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .blinking-cursor {
                    animation: blink 0.5s step-end infinite;
                    color: #00ffff;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
