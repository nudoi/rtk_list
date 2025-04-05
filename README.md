# 公開RTK基準局掲示板

## インストール

```
git clone https://github.com/nudoi/rtk_list.git
cd rtk_list/rtk_list
npm install
```

## 基準局一覧の取得

```
cd ..
pip install -r requirements.txt
python get_list.py && cp rtk_stations.csv rtk_list/public/
```

## 起動

```
cd rtk_list
npm run start
```