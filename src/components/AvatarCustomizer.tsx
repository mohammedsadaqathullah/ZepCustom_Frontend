import { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import type { AvatarConfig } from '../types/avatar';
import { ImageUploader } from './ImageUploader';

interface Props {
    initialConfig?: AvatarConfig;
    initialAvatarUrl?: string; // Added prop
    onSave: (data: { config?: AvatarConfig; avatarUrl?: string }) => void; // Updated signature
    onClose: () => void;
}

export default function AvatarCustomizer({ initialConfig, initialAvatarUrl, onSave, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<'generate' | 'upload'>(initialAvatarUrl ? 'upload' : 'generate');
    const [config, setConfig] = useState<AvatarConfig>(initialConfig || genConfig());
    const [uploadedImage, setUploadedImage] = useState<string | null>(initialAvatarUrl || null);

    const handleRandomize = () => {
        setConfig(genConfig());
    };

    const handleSave = () => {
        if (activeTab === 'generate') {
            onSave({ config, avatarUrl: undefined }); // Clear avatarUrl if switching to generated
        } else {
            if (uploadedImage) {
                onSave({ avatarUrl: uploadedImage, config: undefined }); // Clear config if using image (optional, or keep generic one)
            }
        }
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
                gap: '24px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>Customize Avatar</h2>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#f7fafc', padding: '4px', borderRadius: '12px', width: '100%' }}>
                    <button
                        onClick={() => setActiveTab('generate')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === 'generate' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'generate' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            color: activeTab === 'generate' ? '#4a5568' : '#a0aec0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Generate
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === 'upload' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            color: activeTab === 'upload' ? '#4a5568' : '#a0aec0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Upload Photo
                    </button>
                </div>

                {activeTab === 'generate' ? (
                    <>
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
                    </>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {uploadedImage ? (
                            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                <img
                                    src={uploadedImage}
                                    alt="Avatar Preview"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <button
                                    onClick={() => setUploadedImage(null)}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: '#edf2f7',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    ✏️
                                </button>
                            </div>
                        ) : (
                            <ImageUploader onImageCropped={(img) => setUploadedImage(img)} />
                        )}
                    </div>
                )}

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
                        disabled={activeTab === 'upload' && !uploadedImage}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === 'upload' && !uploadedImage ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: activeTab === 'upload' && !uploadedImage ? 'not-allowed' : 'pointer',
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
