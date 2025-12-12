import { FaComment } from 'react-icons/fa';

interface ChatButtonProps {
    onClick: () => void;
}

export function ChatButton({ onClick }: ChatButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <FaComment />
        </button>
    );
}
