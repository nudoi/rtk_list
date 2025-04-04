import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'

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

function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showGreenCircle, setShowGreenCircle] = useState(false);
  const [showBlueCircle, setShowBlueCircle] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/rtk_stations.csv');
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');

        const data = lines.slice(1)
          .map(line => {
            const values = line.split(',');
            const station: any = {};
            headers.forEach((header, index) => {
              station[header] = values[index] || '';
            });
            return station as Station;
          })
          .sort((a, b) => {
            // 東経を数値に変換して比較（東から西へ）
            const longA = parseFloat(a.東経) || 0;
            const longB = parseFloat(b.東経) || 0;
            return longB - longA; // 降順（東から西へ）
          });

        setStations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (stations.length > 0 && initialLoad) {
      setSelectedStation(stations[0]);
      setInitialLoad(false);
    }
  }, [stations, initialLoad]);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  const handleCloseDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStation(null);
  };

  const toggleGreenCircle = () => {
    setShowGreenCircle(!showGreenCircle);
  };

  const toggleBlueCircle = () => {
    setShowBlueCircle(!showBlueCircle);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <h1>公開RTK基準局一覧</h1>
      <div className={`container ${!selectedStation ? 'centered' : ''}`}>
        <div className="list-container">
          <table>
            <thead>
              <tr>
                <th>場所</th>
                <th>局名</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station, index) => (
                <tr
                  key={index}
                  onClick={() => handleStationClick(station)}
                  className={selectedStation === station ? 'selected' : ''}
                >
                  <td>{station.場所}</td>
                  <td>{station.局名}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedStation && (
          <div className="details-container">
            <div className="details-header">
              <h2>詳細情報</h2>
              <div className="header-buttons">
                <button onClick={handleCloseDetails} className="close-button">×</button>
              </div>
            </div>
            <div className="details-content">
              <p>{selectedStation.局名}</p>
              <div className="map-container">
                <MapContainer
                  key={`${selectedStation.北緯}-${selectedStation.東経}`}
                  center={[parseFloat(selectedStation.北緯), parseFloat(selectedStation.東経)]}
                  zoom={11}
                  style={{ height: '300px', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[parseFloat(selectedStation.北緯), parseFloat(selectedStation.東経)]}
                    icon={selectedStation.状態 === '休止' ? redIcon : blueIcon}
                  >
                    <Popup>
                      {selectedStation.局名}<br />
                      {selectedStation.場所}
                    </Popup>
                  </Marker>
                  {showGreenCircle && (
                    <Circle
                      center={[parseFloat(selectedStation.北緯), parseFloat(selectedStation.東経)]}
                      radius={10000}
                      pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
                    />
                  )}
                  {showBlueCircle && (
                    <Circle
                      center={[parseFloat(selectedStation.北緯), parseFloat(selectedStation.東経)]}
                      radius={20000}
                      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                    />
                  )}
                </MapContainer>
                <div className="circle-buttons">
                  <button
                    onClick={toggleGreenCircle}
                    className={`circle-button green ${showGreenCircle ? 'active' : ''}`}
                  >
                    10km圏
                  </button>
                  <button
                    onClick={toggleBlueCircle}
                    className={`circle-button blue ${showBlueCircle ? 'active' : ''}`}
                  >
                    20km圏
                  </button>
                </div>
              </div>
              <p><strong>場所:</strong> {selectedStation.場所}</p>
              <p><strong>北緯:</strong> {selectedStation.北緯}</p>
              <p><strong>東経:</strong> {selectedStation.東経}</p>
              <p><strong>楕円体高:</strong> {selectedStation.楕円体高}</p>
              <p><strong>サーバアドレス:</strong> {selectedStation.サーバアドレス}</p>
              <p><strong>ポート番号:</strong> {selectedStation.ポート番号}</p>
              <p><strong>データ形式:</strong> {selectedStation.データ形式}</p>
              <p><strong>接続方法:</strong> {selectedStation.接続方法}</p>
              <p><strong>状態:</strong> {selectedStation.状態}</p>
              <p><strong>メール連絡:</strong> {selectedStation.メール連絡}</p>
              <p><strong>コメント:</strong> {selectedStation.コメント}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
