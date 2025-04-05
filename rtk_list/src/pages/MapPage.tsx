import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import './MapPage.css';

// マーカーアイコンの設定を修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// カスタムマーカーアイコンの設定
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Station {
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

function MapPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/rtk_stations.csv');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const text = await response.text();
                const lines = text.split('\n');
                const headers = lines[0].split(',');

                const data = lines.slice(1)
                    .filter(line => line.trim()) // 空行を除外
                    .map(line => {
                        const values = line.split(',');
                        const station: any = {};
                        headers.forEach((header, index) => {
                            station[header] = values[index] || '';
                        });
                        return station as Station;
                    });

                setStations(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('データの読み込みに失敗しました');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="map-page">
            <div className="map-header">
                <h1>RTK基準局マップ</h1>
                <Link to="/" className="back-link">一覧に戻る</Link>
            </div>
            <div className="map-container">
                <MapContainer
                    center={[36.2048, 138.2529]} // 日本の中心付近
                    zoom={6}
                    style={{ height: 'calc(100vh - 100px)', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {stations.map((station, index) => (
                        <Marker
                            key={index}
                            position={[parseFloat(station.北緯), parseFloat(station.東経)]}
                            icon={station.状態 === '休止' ? redIcon : blueIcon}
                        >
                            <Popup>
                                <div>
                                    <h3>{station.局名}</h3>
                                    <p>{station.場所}</p>
                                    <p>状態: {station.状態}</p>
                                    <p>データ形式: {station.データ形式}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default MapPage; 