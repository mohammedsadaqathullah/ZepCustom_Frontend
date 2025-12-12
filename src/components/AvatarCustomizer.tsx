import { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import type { AvatarConfig } from '../types/avatar';

interface Props {
    initialConfig?: AvatarConfig;
    onSave: (config: AvatarConfig) => void;
    onClose: () => void;
}

export default function AvatarCustomizer({ initialConfig, onSave, onClose }: Props) {
    const [config, setConfig] = useState<AvatarConfig>(initialConfig || genConfig());

    const handleRandomize = () => {
        setConfig(genConfig());
    };

    const handleSave = () => {
        onSave(config);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: 'system-ui'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '500px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>Customize Avatar</h2>

                <div style={{ width: '200px', height: '200px' }}>
                    <Avatar style={{ width: '100%', height: '100%' }} {...config} />
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                        onClick={handleRandomize}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        🎲 Randomize
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#e5e7eb',
                            color: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
