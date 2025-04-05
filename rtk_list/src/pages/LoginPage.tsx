import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const { validateToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('トークンを入力してください');
            return;
        }

        if (validateToken(token)) {
            navigate('/add');
        } else {
            setError('無効なトークンです');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>ログイン</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="token">認証トークン</label>
                        <input
                            type="password"
                            id="token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="認証トークンを入力"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-button">ログイン</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage; 