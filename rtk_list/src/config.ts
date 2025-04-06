// 認証トークンの設定
export const AUTH_TOKEN = import.meta.env.VITE_TOKEN;

// APIの設定
export const API_CONFIG = {
    baseUrl: `http://localhost:${import.meta.env.VITE_PORT}`,
    endpoints: {
        stations: '/stations'
    }
}; 