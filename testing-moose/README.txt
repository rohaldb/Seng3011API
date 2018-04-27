==============================
Team Moose Testing README
==============================

============
Requirements
============
-Newman - used to run our test suite on the command-line 

===========
Quick Start
===========
1. Install Newman - refer to https://www.getpostman.com/docs/v6/postman/collection_runs/command_line_integration_with_newman for installation instructions. 
3. Run `newman run moose-tests.json -e Test-Env-Moose.json` to execute the test cases on v3 of Team Moose's API.

================
File Explanation
================
moose-output.txt             | The output of the test suite run on Version 3 of Team Moose’s API.
tests/                       | Directory containing all of our test cases
tests-summary.txt            | A summary/description of the tests
moose-tests.json             | A JSON dump of the test cases in tests/ as exported by Postman. 
moose-tests-pretty.json      | A more readable version of moose-tests.json
Test-Env-Moose.json          | Test configuration file used to run the test suite on v3 of Team Moose's API
