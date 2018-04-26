#!/usr/bin/env python3
import requests, urllib, json, csv
from comp_names_curated import company_names
from CONFIG import POSITIVE_VIBES_ROOT, NUM_RUNS, SUMMARY_FILE_POSITIVE_VIBES, RAW_FILE_POSITIVE_VIBES
from Test import Test

with open(SUMMARY_FILE_POSITIVE_VIBES, 'w') as summary_output, open(RAW_FILE_POSITIVE_VIBES, 'w') as raw_output:
    # csv headers for raw and summary output files
    summary_fieldnames = ['company', 'endpoint', 'num_ok', 'num_err', 'avg_resp_time']
    raw_fieldnames = ['company', 'endpoint', 'status', 'resp_time', 'json']

    # Initialise csv writers for both files
    summary_writer = csv.DictWriter(summary_output, fieldnames=summary_fieldnames, quoting=csv.QUOTE_ALL)
    raw_writer = csv.DictWriter(raw_output, fieldnames=raw_fieldnames, quoting=csv.QUOTE_ALL)

    # Write csv headers for both files
    summary_writer.writeheader()
    raw_writer.writeheader()

    company_count = 1
    for name in company_names:
        endpoint = '/company/{}?includePosts=true&startDate=2018-01-01&endDate=2018-02-01'.format(company_names[name]['fbid'])
        url = POSITIVE_VIBES_ROOT + endpoint

        t = Test(company_names[name]['code'], name, POSITIVE_VIBES_ROOT, endpoint)

        for run_count in range(1, NUM_RUNS + 1):
            print("COMPANY {}/{} | {} - RUN: {}/{} | {}".format(company_count, len(company_names), name, run_count, NUM_RUNS, endpoint))
            r = requests.get(url)

            if r:
                #print(json.dumps(r.json(), indent=2))
                t.responses.append(r)
                raw_writer.writerow(t.gen_response_row(r))

        summary_writer.writerow(t.summarise(check_ok_status=False))
        company_count += 1
