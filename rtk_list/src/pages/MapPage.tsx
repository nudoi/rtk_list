import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
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

// 2点間の距離を計算する関数（km単位）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function MapPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [showCurrentPosition, setShowCurrentPosition] = useState(false);

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
                    .filter(line => line.trim())
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

    // 現在の位置を取得
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPosition([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    // 円を表示する基準局をフィルタリングする関数
    const stationsWithCircles = stations.filter(station => {
        // 半径が選択されている場合のみ円を表示
        return selectedRadius !== null;
    });

    // マーカーをフィルタリングする関数
    const filteredStations = stations.filter(station => {
        if (selectedRadius === null || !currentPosition) return true;

        const stationLat = parseFloat(station.北緯);
        const stationLon = parseFloat(station.東経);
        const distance = calculateDistance(
            currentPosition[0],
            currentPosition[1],
            stationLat,
            stationLon
        );

        return distance <= selectedRadius;
    });

    // 現在位置が変更された時に円を再計算
    useEffect(() => {
        if (currentPosition && selectedRadius !== null) {
            setSelectedRadius(selectedRadius);
        }
    }, [currentPosition]);

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
                    center={currentPosition || [36.2048, 138.2529]}
                    zoom={currentPosition ? 12 : 6}
                    style={{ height: 'calc(100vh - 160px)', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {selectedRadius && stationsWithCircles.map((station, index) => (
                        <Circle
                            key={`circle-${index}`}
                            center={[parseFloat(station.北緯), parseFloat(station.東経)]}
                            radius={selectedRadius * 1000}
                            pathOptions={{
                                color: station.状態 === '休止'
                                    ? '#dc3545'
                                    : selectedRadius === 10
                                        ? '#28a745'  // 10km圏は緑色
                                        : '#007bff', // 20km圏は青色
                                fillColor: station.状態 === '休止'
                                    ? '#dc3545'
                                    : selectedRadius === 10
                                        ? '#28a745'  // 10km圏は緑色
                                        : '#007bff', // 20km圏は青色
                                fillOpacity: 0.1,
                                weight: 2
                            }}
                        />
                    ))}
                    {showCurrentPosition && currentPosition && (
                        <Marker
                            position={currentPosition}
                            icon={new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })}
                        >
                            <Popup>現在位置</Popup>
                        </Marker>
                    )}
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
                                    {currentPosition && (
                                        <p>
                                            距離: {calculateDistance(
                                                currentPosition[0],
                                                currentPosition[1],
                                                parseFloat(station.北緯),
                                                parseFloat(station.東経)
                                            ).toFixed(1)}km
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            <div className="radius-controls">
                <div className="radius-buttons">
                    <button
                        className={`radius-button ${selectedRadius === 10 ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedRadius(10);
                            if (!currentPosition && navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        setCurrentPosition([position.coords.latitude, position.coords.longitude]);
                                    },
                                    (error) => {
                                        console.error('Error getting location:', error);
                                    }
                                );
                            }
                        }}
                    >
                        10km圏
                    </button>
                    <button
                        className={`radius-button ${selectedRadius === 20 ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedRadius(20);
                            if (!currentPosition && navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        setCurrentPosition([position.coords.latitude, position.coords.longitude]);
                                    },
                                    (error) => {
                                        console.error('Error getting location:', error);
                                    }
                                );
                            }
                        }}
                    >
                        20km圏
                    </button>
                    <button
                        className={`radius-button ${selectedRadius === null ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedRadius(null);
                            setShowCurrentPosition(false);
                        }}
                    >
                        非表示
                    </button>
                    <button
                        className={`radius-button ${showCurrentPosition ? 'active' : ''}`}
                        onClick={() => {
                            setShowCurrentPosition(!showCurrentPosition);
                            if (!currentPosition && navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        setCurrentPosition([position.coords.latitude, position.coords.longitude]);
                                    },
                                    (error) => {
                                        console.error('Error getting location:', error);
                                    }
                                );
                            }
                        }}
                    >
                        現在地
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MapPage; 