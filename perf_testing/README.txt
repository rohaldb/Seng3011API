==========================
Performance Testing README
==========================

===========
Result Data
===========
- There are two spreadsheets in this directory:
  "API Speed Comparison.xlsx" and "API Load Testing Comparison.xlsx", each
  respectively summarising the results data for speed testing and load testing.
- Raw result data can be found in the results/ subdirectory.

Requirements
============
- Python 3.5+
- Python library dependencies: requests, locustio

===========
Quick Start
===========
IMPORTANT - DON'T SKIP STEP 2 OR THE TESTING WILL NOT WORK!
1. Run `make setup` - this will install the requests and locustio libraries.
   Alternatively you can run `pip install requests locustio`.
   You may need to refer to https://docs.locust.io/en/stable/installation.html for additional LocustIO installation instructions.
2. Get a Facebook Graph API Token from https://developers.facebook.com/tools/explorer/ and insert it in the file CONFIG.py (replace "INSERT TOKEN HERE").
3. Run speed/load testing as specified below.

=============
Speed Testing
=============
This will require you to run the Python speed testing script, which will query each API multiple times and write all timing data
to two csv files (perf_summary_{TEAM}.csv and perf_raw_{TEAM}.csv).

To run each speed test, use:
    - make speed_unassigned
    - make speed_cb
    - make speed_pv
    - make speed_moose

============
Load Testing
============
This will run LocustIO to conduct the load testing. After running one of the below commands to start a Locust server,
open a web browser window and navigate to http://127.0.0.1:8089/ where the LocustIO web interface will be running.
Select the number of users to simulate and hatch rate (users spawned/second), then click "Start Swarming".
You can download the load test data in the "Download Data" tab of the web interface.

To run each load test, use:
    - make load_unassigned
    - make load_cb
    - make load_pv
    - make load_moose

================
File explanation
================
API *.xlsx       | Summary spreadsheets of result data
requirements.txt | Requirements file for pip (Python package manager)
CONFIG.py        | Configuration file for speed/load testing
Makefile         | Makefile with various helper scripts
Test.py          | Helper Python class to track speed testing information
perf_test_*.py   | Speed testing scripts for each tested team
load_test_*.py   | Load testing scripts (LocustIO) for each tested team
README.txt       | This file!
