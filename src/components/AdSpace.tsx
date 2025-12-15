import React from 'react';

interface AdSpaceProps {
    className?: string; // Allow passing standard className mostly for potential future flexibility or if we ever move to CSS modules/Tailwind
}

const AdSpace: React.FC<AdSpaceProps> = () => {
    return (
        <div style={{
            margin: '20px 0',
            padding: '20px',
            border: '1px dashed #4a5568',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#718096',
            textAlign: 'center',
            fontSize: '0.8rem'
        }}>
            <p style={{ marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored</p>
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                <span style={{ fontStyle: 'italic' }}>Your Ad Here</span>
            </div>
        </div>
    );
};

export default AdSpace;
