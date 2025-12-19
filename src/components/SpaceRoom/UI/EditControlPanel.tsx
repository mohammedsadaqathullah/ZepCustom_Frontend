import React from 'react';

interface EditControlPanelProps {
    isEditing: boolean;
    onToggleEdit: () => void;
    onAddRoom: () => void;
    onAddObject: (type: string) => void;
    onRotate: () => void;
    onSave: () => void;
    onDelete: () => void;
    hasSelection: boolean;
}

export const EditControlPanel: React.FC<EditControlPanelProps> = ({
    isEditing,
    onToggleEdit,
    onAddRoom,
    onAddObject,
    onRotate,
    onSave,
    onDelete,
    hasSelection
}) => {
    const [showModal, setShowModal] = React.useState(false);

    const objectTypes = [
        { type: 'desk', label: 'Desk', icon: '🖥️' },
        { type: 'chair', label: 'Chair', icon: '🪑' },
        { type: 'sofa', label: 'Sofa', icon: '🛋️' },
        { type: 'plant', label: 'Plant', icon: '🪴' },
        { type: 'bookshelf', label: 'Shelf', icon: '📚' },
        { type: 'cabinet', label: 'Cabinet', icon: '🗄️' },
        { type: 'meeting-table', label: 'Table', icon: '🍽️' },
        { type: 'whiteboard', label: 'Board', icon: '📝' },
        { type: 'projector', label: 'Projector', icon: '📽️' },
        { type: 'bench', label: 'Bench', icon: '🪑' },
        { type: 'tree', label: 'Tree', icon: '🌳' },
        { type: 'fountain', label: 'Fountain', icon: '⛲' },
    ];

    return (
        <>
            {/* Context Menu for Selected Object */}
            {isEditing && hasSelection && (
                <div style={{
                    position: 'absolute',
                    bottom: '160px',
                    left: '60%', // Offset slightly to right or center?
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    display: 'flex',
                    gap: '8px',
                    background: 'rgba(50, 50, 50, 0.9)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <button
                        onClick={onRotate}
                        style={{
                            padding: '8px 12px',
                            background: '#805ad5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        🔄 Rotate
                    </button>
                    <button
                        onClick={onDelete}
                        style={{
                            padding: '8px 12px',
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}

            <div style={{
                position: 'absolute',
                bottom: '90px', // Raised to avoid overlap
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                display: 'flex',
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '12px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {!isEditing ? (
                    <button
                        onClick={onToggleEdit}
                        style={{
                            padding: '10px 20px',
                            background: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: 'background 0.2s'
                        }}
                    >
                        ✏️ Edit Space
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onAddRoom}
                            style={{
                                padding: '10px 16px',
                                background: '#48bb78',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            ➕ Room
                        </button>
                        <button
                            onClick={() => setShowModal(!showModal)}
                            style={{
                                padding: '10px 16px',
                                background: '#ed8936',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            🛋️ Object
                        </button>

                        {/* Rotate/Delete moved to context menu, removed from main bar or kept as fallback? User said "Only on selection", so let's remove from main bar */}

                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                        <button
                            onClick={onSave}
                            style={{
                                padding: '10px 16px',
                                background: '#38a169',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            💾 Save
                        </button>
                        <button
                            onClick={onToggleEdit}
                            style={{
                                padding: '10px 16px',
                                background: '#718096',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            ✖️ Exit
                        </button>
                    </>
                )}
            </div>

            {/* Object Selection Modal */}
            {showModal && isEditing && (
                <div style={{
                    position: 'absolute',
                    bottom: '160px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001,
                    background: 'rgba(30, 30, 30, 0.95)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    width: '320px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px'
                }}>
                    {objectTypes.map((obj) => (
                        <button
                            key={obj.type}
                            onClick={() => {
                                onAddObject(obj.type);
                                setShowModal(false);
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 4px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <span style={{ fontSize: '20px' }}>{obj.icon}</span>
                            <span>{obj.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};
