#!/usr/bin/env python3
from locust import HttpLocust, TaskSet, task
from comp_names_curated import company_names

# Moose endpoint generator
def gen_moose_endpoint(company_name):
    endpoint = '/company?id={}&start_date=2018-01-01T00:00:00.000Z&end_date=2018-02-01T00:00:00.000Z&stats=name,fan_count,description,website,post_message,post_type,post_created_time,post_like_count,post_comment_count'.format(company_names[company_name]['fbid'])
    return endpoint

class UserBehavior(TaskSet):
    @task(1)
    def qantas(self):
        self.client.get(gen_moose_endpoint('QANTAS'))

    @task(2)
    def anz(self):
        self.client.get(gen_moose_endpoint('AUSTRALIA AND NEW ZEALAND BANKING'))

    @task(3)
    def nvidia(self):
        self.client.get(gen_moose_endpoint('NVIDIA'))

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000
