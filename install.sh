#!/bin/bash
cd rtk_list && npm install
cd ..
pip install -r requirements.txt
python get_list.py && cp rtk_stations.csv rtk_list/public/
cd rtk_list && npm run start