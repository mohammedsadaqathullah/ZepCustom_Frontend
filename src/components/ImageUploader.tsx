import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageUploaderProps {
    onImageCropped: (base64Image: string) => void;
}

export function ImageUploader({ onImageCropped }: ImageUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
        }
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onImageCropped(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onImageCropped]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            {!imageSrc ? (
                <div style={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed #cbd5e0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: '#718096',
                    cursor: 'pointer',
                    background: '#f7fafc'
                }} onClick={() => document.getElementById('fileInput')?.click()}>
                    <span style={{ fontSize: '24px', marginBottom: '8px' }}>📸</span>
                    <span style={{ fontWeight: '500' }}>Upload Photo</span>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '300px',
                        background: '#333',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>
                    <div style={{ width: '100%', padding: '0 8px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4a5568' }}>Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setImageSrc(null)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e0',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={showCroppedImage}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#48bb78',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Confirm Crop
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string), false);
        reader.readAsDataURL(file);
    });
}

function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string | null> {
    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    return new Promise(async (resolve, reject) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return reject(new Error('No 2d context'));
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg'));
    });
}
