import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_TOKEN } from '../config';

interface AuthContextType {
    isAuthenticated: boolean;
    validateToken: (token: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const validateToken = (token: string) => {
        const isValid = token === AUTH_TOKEN;
        setIsAuthenticated(isValid);
        return isValid;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, validateToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 