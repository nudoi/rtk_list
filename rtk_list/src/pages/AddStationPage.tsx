import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AddStationPage.css';

interface StationForm {
    場所: string;
    局名: string;
    北緯: string;
    東経: string;
    楕円体高: string;
    サーバアドレス: string;
    ポート番号: string;
    データ形式: string;
    接続方法: string;
    状態: string;
    メール連絡: string;
    コメント: string;
}

function AddStationPage() {
    const [formData, setFormData] = useState<StationForm>({
        場所: '',
        局名: '',
        北緯: '',
        東経: '',
        楕円体高: '',
        サーバアドレス: '',
        ポート番号: '',
        データ形式: '',
        接続方法: '',
        状態: '公開',
        メール連絡: '',
        コメント: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/stations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('局情報の追加に失敗しました');
            }

            setSuccess('局情報が正常に追加されました');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        }
    };

    return (
        <div className="add-station-container">
            <div className="add-station-box">
                <h1>新規局情報追加</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="場所">場所</label>
                        <input
                            type="text"
                            id="場所"
                            name="場所"
                            value={formData.場所}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="局名">局名</label>
                        <input
                            type="text"
                            id="局名"
                            name="局名"
                            value={formData.局名}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="北緯">北緯</label>
                        <input
                            type="text"
                            id="北緯"
                            name="北緯"
                            value={formData.北緯}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="東経">東経</label>
                        <input
                            type="text"
                            id="東経"
                            name="東経"
                            value={formData.東経}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="楕円体高">楕円体高</label>
                        <input
                            type="text"
                            id="楕円体高"
                            name="楕円体高"
                            value={formData.楕円体高}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="サーバアドレス">サーバアドレス</label>
                        <input
                            type="text"
                            id="サーバアドレス"
                            name="サーバアドレス"
                            value={formData.サーバアドレス}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ポート番号">ポート番号</label>
                        <input
                            type="text"
                            id="ポート番号"
                            name="ポート番号"
                            value={formData.ポート番号}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="データ形式">データ形式</label>
                        <input
                            type="text"
                            id="データ形式"
                            name="データ形式"
                            value={formData.データ形式}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="接続方法">接続方法</label>
                        <input
                            type="text"
                            id="接続方法"
                            name="接続方法"
                            value={formData.接続方法}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="状態">状態</label>
                        <select
                            id="状態"
                            name="状態"
                            value={formData.状態}
                            onChange={handleChange}
                        >
                            <option value="公開">公開</option>
                            <option value="休止">休止</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="メール連絡">メール連絡</label>
                        <input
                            type="text"
                            id="メール連絡"
                            name="メール連絡"
                            value={formData.メール連絡}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="コメント">コメント</label>
                        <textarea
                            id="コメント"
                            name="コメント"
                            value={formData.コメント}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <div className="button-group">
                        <button type="submit" className="submit-button">追加</button>
                        <button type="button" className="cancel-button" onClick={() => navigate('/')}>キャンセル</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStationPage; 