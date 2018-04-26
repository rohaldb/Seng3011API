import requests
# Helper Test class to store information related to speed testing
class Test:
    def __init__(self, company_code, company_name, root, endpoint):
        self.company_code = company_code
        self.company_name = company_name 

        self.root = root
        self.endpoint = endpoint

        self.responses = []

    def summarise(self, check_ok_status=False):
        num_ok, num_err = 0, 0

        # Only count HTTP OK responses in average time calculation
        average_response_time = 0
        for response in self.responses:
            if check_ok_status:
                status_code = response.json()['status']

                if status_code == requests.codes.ok:
                    num_ok += 1
                    average_response_time += response.elapsed.total_seconds()
                else:
                    num_err += 1
            else:
                average_response_time += response.elapsed.total_seconds()
                num_ok = len(self.responses)

        if num_ok:
            average_response_time /= num_ok

        summary = {
            'company': self.company_name,
            'endpoint': self.endpoint, 
            'num_ok': num_ok, 
            'num_err': num_err, 
            'avg_resp_time': average_response_time
        }
        return summary

    def gen_response_row(self, response):
        row = {
            'company': self.company_name,
            'endpoint': self.endpoint,
            'status': response.status_code,
            'resp_time': response.elapsed.total_seconds(),
            'json': response.json()
        }
        return row


