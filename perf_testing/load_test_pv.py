#!/usr/bin/env python3
from locust import HttpLocust, TaskSet, task
from comp_names_curated import company_names

# Positive Vibes endpoint generator
def gen_pv_endpoint(company_name):
    endpoint = '/company/{}?includePosts=true&startDate=2018-01-01&endDate=2018-02-01'.format(company_names[company_name]['fbid'])
    return endpoint

class UserBehavior(TaskSet):
    @task(1)
    def qantas(self):
        self.client.get(gen_pv_endpoint('QANTAS'))

    @task(2)
    def anz(self):
        self.client.get(gen_pv_endpoint('AUSTRALIA AND NEW ZEALAND BANKING'))

    @task(3)
    def nvidia(self):
        self.client.get(gen_pv_endpoint('NVIDIA'))

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000
