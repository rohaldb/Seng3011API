#!/usr/bin/env python3
import requests, urllib, json, csv
from comp_names_curated import company_names
from CONFIG import MOOSE_ROOT, NUM_RUNS, SUMMARY_FILE_MOOSE, RAW_FILE_MOOSE
from Test import Test

with open(SUMMARY_FILE_MOOSE, 'w') as summary_output, open(RAW_FILE_MOOSE, 'w') as raw_output:
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
        endpoint = '/company?id={}&start_date=2018-01-01T00:00:00.000Z&end_date=2018-02-01T00:00:00.000Z&stats=name,fan_count,description,website,post_message,post_type,post_created_time,post_like_count,post_comment_count'.format(company_names[name]['fbid'])
        url = MOOSE_ROOT + endpoint

        t = Test(company_names[name]['code'], name, MOOSE_ROOT, endpoint)

        for run_count in range(1, NUM_RUNS + 1):
            print("COMPANY {}/{} | {} - RUN: {}/{} | {}".format(company_count, len(company_names), name, run_count, NUM_RUNS, endpoint))
            r = requests.get(url)

            if r:
                # print(json.dumps(r.json(), indent=2))
                t.responses.append(r)
                raw_writer.writerow(t.gen_response_row(r))

        summary_writer.writerow(t.summarise(check_ok_status=False))
        company_count += 1
