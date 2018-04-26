#!/usr/bin/env python3
from locust import HttpLocust, TaskSet, task
from comp_names_curated import company_names

# Crushing Beasts endpoint generator
def gen_cb_endpoint(company_name):
    endpoint = '/fbstats?pageid={}&stats=name,fan_count,description,website,post_type,post_message,post_created_time,post_like_count,post_comment_count&startdate=2018-1-1T0:0:0&enddate=2018-2-1T0:0:0'.format(company_names[company_name]['fbid'])
    return endpoint

class UserBehavior(TaskSet):
    @task(1)
    def qantas(self):
        self.client.get(gen_cb_endpoint('QANTAS'))

    @task(2)
    def anz(self):
        self.client.get(gen_cb_endpoint('AUSTRALIA AND NEW ZEALAND BANKING'))

    @task(3)
    def woolworths(self):
        self.client.get(gen_cb_endpoint('WOOLWORTHS'))

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000
