Performance Testing README
==========================

Requirements
============
-Python 3.5+
-Python library dependencies: requests, locustio

Quick Start
===========
1. Run `make setup` - this will install requests and locustio. Alternatively you can run `pip install requests locustio`.
2. Get a Facebook Graph API Token from https://developers.facebook.com/tools/explorer/ and insert it in the file CONFIG (replace "INSERT TOKEN HERE").

Speed Testing
=============
This will run the Python speed testing script, which will query each API multiple times and write all timing data to two csv files (perf_summary_{TEAM}.csv and perf_raw_{TEAM}.csv). 

To run each speed test, use: 
    - make speed_unassigned
    - make speed_cb
    - make speed_pv
    - make speed_moose

Load Testing
============
This will run LocustIO to perform load testing. After running the below command to start a Locust server, open a web browser window and navigate to http://127.0.0.1:8089/ where the LocustIO web interface will be running. Select the number of users to simulate and hatch rate, then click "Start Swarming". You can download the load test data in the "Download Data" tab of the web interface.

To run each load test, use: 
    - make load_unassigned
    - make load_cb
    - make load_pv
    - make load_moose
