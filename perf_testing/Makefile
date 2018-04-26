# Install dependencies for speed and load testing
setup:
	pip install -r requirements.txt

# Speed testing for teams: Unassigned, Crushing Beasts, Positive Vibes and Moose
speed_unassigned:
	./perf_test_unassigned.py

speed_cb:
	./perf_test_cb.py

speed_pv:
	./perf_test_pv.py

speed_moose:
	./perf_test_moose.py

# Load testing for teams: Unassigned, Crushing Beasts, Positive Vibes and Moose
load_unassigned:
	locust -f load_test_unassigned.py --host='https://unassigned-api.herokuapp.com/api'

load_cb:
	locust -f load_test_cb.py --host='http://188.166.238.3/api/v1'

load_pv:
	locust -f load_test_pv.py --host='https://positive-vibes.seng3011.com/v2.0/api'

load_moose:
	locust -f load_test_moose.py --host='http://seng3011-moose.herokuapp.com/v3'
