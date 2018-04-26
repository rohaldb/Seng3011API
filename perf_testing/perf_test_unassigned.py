#!/usr/bin/env python3
import requests, urllib, json, csv
from comp_names_curated import company_names
from CONFIG import UNASSIGNED_TOKEN, UNASSIGNED_ROOT, NUM_RUNS, SUMMARY_FILE_UNASSIGNED, RAW_FILE_UNASSIGNED
from Test import Test

# Check that FB API Token has been updated
if UNASSIGNED_TOKEN == "INSERT TOKEN HERE":
    raise ValueError("Error: No FB API Token in CONFIG! Please view README.txt for instructions.")

with open(SUMMARY_FILE_UNASSIGNED, 'w') as summary_output, open(RAW_FILE_UNASSIGNED, 'w') as raw_output:
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
        endpoint = '/{}?statistics=name,fan_count,description,website,posts{{id,type,message,created_time,likes,comments}}&start_date=2018-01-01&end_date=2018-02-01'.format(company_names[name]['fbid'])
        tokeniser = '&access_token={}'.format(UNASSIGNED_TOKEN)
        url = UNASSIGNED_ROOT + endpoint + tokeniser

        t = Test(company_names[name]['code'], name, UNASSIGNED_ROOT, endpoint)

        for run_count in range(1, NUM_RUNS + 1):
            r = requests.get(url)

            print("COMPANY {}/{} | {} - RUN: {}/{} | {}".format(company_count, len(company_names), name, run_count, NUM_RUNS, endpoint))
            if r:
                # print(json.dumps(r.json(), indent=2))
                t.responses.append(r)
                raw_writer.writerow(t.gen_response_row(r))

        summary_writer.writerow(t.summarise(check_ok_status=True))
        company_count += 1
