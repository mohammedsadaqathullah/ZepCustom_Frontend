import { create } from 'zustand';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),

    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ isAuthenticated: true });

        // Fetch user profile
        const userResponse = await api.get('/users/me');
        set({ user: userResponse.data });
    },

    register: async (email: string, password: string, displayName: string) => {
        const response = await api.post('/auth/register', { email, password, displayName });
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ isAuthenticated: true });

        // Fetch user profile
        const userResponse = await api.get('/users/me');
        set({ user: userResponse.data });
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        try {
            const response = await api.get('/users/me');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        }
    },
}));
