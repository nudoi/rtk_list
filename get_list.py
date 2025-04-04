import requests
from bs4 import BeautifulSoup
import pandas as pd

def get_rtk_stations():
    url = "https://rtk.silentsystem.jp/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # テーブルを探す
    table = soup.find('table')
    if not table:
        print("テーブルが見つかりませんでした")
        return
    
    # データを格納するリスト
    data = []
    
    # テーブルの各行を処理
    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) >= 10:  # 必要な列が存在することを確認
            data.append({
                '場所': cols[0].text.strip(),
                '局名': cols[1].text.strip(),
                '北緯': cols[2].text.strip(),
                '東経': cols[3].text.strip(),
                '楕円体高': cols[4].text.strip(),
                'サーバアドレス': cols[5].text.strip(),
                'ポート番号': cols[6].text.strip(),
                'データ形式': cols[7].text.strip(),
                '接続方法': cols[8].text.strip(),
                '状態': cols[9].text.strip(),
                'メール連絡': cols[10].text.strip() if len(cols) > 10 else '',
                'コメント': cols[11].text.strip() if len(cols) > 11 else ''
            })
    
    # DataFrameに変換
    df = pd.DataFrame(data)
    return df

def main():
    df = get_rtk_stations()
    if not df.empty:
        # 結果を表示
        print("\nRTK基準局一覧:")
        print(df.to_string(index=False))
        
        # CSVファイルとして保存
        df.to_csv('rtk_stations.csv', index=False, encoding='utf-8-sig')
        print("\n'rtk_stations.csv' に保存しました。")

if __name__ == "__main__":
    main() 