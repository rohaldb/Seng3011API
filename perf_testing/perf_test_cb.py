#!/usr/bin/env python3
import requests, urllib, json, csv
from comp_names_curated import company_names
from CONFIG import CB_ROOT, NUM_RUNS, SUMMARY_FILE_CB, RAW_FILE_CB
from Test import Test

with open(SUMMARY_FILE_CB, 'w') as summary_output, open(RAW_FILE_CB, 'w') as raw_output:
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
        endpoint = '/fbstats?pageid={}&stats=name,fan_count,description,website,post_type,post_message,post_created_time,post_like_count,post_comment_count&startdate=2018-1-1T0:0:0&enddate=2018-2-1T0:0:0'.format(company_names[name]['fbid'])
        url = CB_ROOT + endpoint

        t = Test(company_names[name]['code'], name, CB_ROOT, endpoint)

        for run_count in range(1, NUM_RUNS + 1):
            print("COMPANY {}/{} | {} - RUN: {}/{} | {}".format(company_count, len(company_names), name, run_count, NUM_RUNS, endpoint))
            r = requests.get(url)

            if r:
                # print(json.dumps(r.json(), indent=2))
                t.responses.append(r)
                raw_writer.writerow(t.gen_response_row(r))

        summary_writer.writerow(t.summarise(check_ok_status=False))
        company_count += 1
