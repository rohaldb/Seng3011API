#!/usr/bin/env python3
from locust import HttpLocust, TaskSet, task
from comp_names_curated import company_names
from CONFIG import UNASSIGNED_TOKEN

# Team Unassigned endpoint generator
def gen_unassigned_endpoint(company_name):
    endpoint = '/{}?statistics=name,fan_count,description,website,posts{{id,type,message,created_time,likes,comments}}&start_date=2018-01-01&end_date=2018-02-01'.format(company_names[company_name]['fbid'])
    tokeniser = '&access_token={}'.format(UNASSIGNED_TOKEN)
    return endpoint + tokeniser

class UserBehavior(TaskSet):
    @task(1)
    def qantas(self):
        self.client.get(gen_unassigned_endpoint('QANTAS'))

    @task(2)
    def anz(self):
        self.client.get(gen_unassigned_endpoint('AUSTRALIA AND NEW ZEALAND BANKING'))

    @task(3)
    def woolworths(self):
        self.client.get(gen_unassigned_endpoint('WOOLWORTHS'))

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000
