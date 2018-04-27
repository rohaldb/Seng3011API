==============================
Team Unassigned Testing README
==============================

============
Requirements
============
-Newman - used to run our test suite on the command-line

===========
Quick Start
===========
IMPORTANT - DON'T SKIP STEP 1 OR THE TESTING WILL NOT WORK!
1. Get a Facebook Graph API Token from https://developers.facebook.com/tools/explorer/ and insert it in the file Test-Env-Deploy.json (replace "INSERT FB TOKEN HERE").
2. Install Newman - refer to https://www.getpostman.com/docs/v6/postman/collection_runs/command_line_integration_with_newman for installation instructions. 
3. Run `newman run api-tests.json -e Test-Env-Deploy.json` to execute the test cases on the latest version of the API.

================
File Explanation
================
unassigned-output.txt        | The output of the test suite run on the latest deployed version of the API (v3)
tests/                       | Directory containing all of our test cases
tests-summary.txt            | A summary/description of our test cases
api-tests.json               | A JSON dump of the test cases in tests/ as exported by Postman. 
api-tests-pretty.json        | A more readable version of api-tests.json
pre-commit                   | Shell script used to run the test suite automatically using a Git pre-commit hook
Test-Env-[Deploy|Local].json | Test configuration files used to run the test suite on the deployed/local version of the API, respectively.
