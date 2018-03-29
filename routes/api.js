var fetch = require('isomorphic-fetch');
var express = require('express');
var moment = require('moment');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();

// Use Heroku REDIS_URL or default to local redis server
var REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"; 
var cache = require('express-redis-cache')({
  client: require('redis').createClient(REDIS_URL)
});

const access_token = 'EAACEdEose0cBACz2JgeNU3V8CBuPZBSCbHo3Gnw6Jnm8GGxFNW6QbphiwZCZAlST18826JqzBhUKQCT4Dstro5BryFYjYpP1FL17ZCLlZCj3uFsxWqc37CwqhLTDJwtkDWAmoGTBdXGBQvAUKe1Yq7vMHs4VpyLUzHs9Gvez3GCKXa2n9tntQFWZCBM1hQh1XFuZCUS6XJt5QZDZD';
const fb_version = 'v2.6';
const start_time = new Date()

/*
 * Post information route for a company post.
 */
router.get('/post/:id', cache.route(), function (req, res, next) {
  // start timer
  const post = req.params.id
  let statistics = req.query.statistics ? req.query.statistics : 'id, type, message, created_time, likes'

  fetch(`https://graph.facebook.com/${fb_version}/${post}/?fields=${statistics}&access_token=${access_token}`)
  .then(function (response) {
    // console.log(response)
    if (response.ok) {
      response.json().then(data => {
        if (data.error) {
          res.json(failureResponseFormatter(req, 400, data.error.message))
        } else {
          res.json(successResponseFormatter(req, response, data))
        }
      })
    } else {
      response.json().then(data => {
        if (data.error) {
          res.json(failureResponseFormatter(req, 400, data.error.message))
        }
      })
    }
  })
  .catch(error => console.error(error))
})

/*
 * Facebook page information route for a company.
 */
router.get('/:company', cache.route(), function (req, res, next) {
     // start timer

  const statistics = req.query.statistics ? req.query.statistics : 'id, name, website, description, category, fan_count, posts'

  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  db.each(`SELECT *, COUNT(1) > 0
         FROM ListedCompanies
         WHERE Code = '${req.params.company}' LIMIT 1`, (err, row) => {
    if (err) {
      console.error(err.message)
    }

    const company = row.Code ? row.Company : req.params.company

    if (!start_date.isValid() || !end_date.isValid()) {
      // check for valid date parameters
      res.json(failureResponseFormatter(req, 400, 'Invalid date parameters'))
    } else if (!statistics) {
      // check for missing stats parameter
      res.json(failureResponseFormatter(req, 400, 'Missing parameter: `statistics`'))
    } else {
      fetch(graphAPIString(company, start_date, end_date, statistics))
       .then(response => {
         if (response.ok) {
           response.json().then(data => {
             res.json(successResponseFormatter(req, response, data))
           })
         } else {
           return fetch(`https://graph.facebook.com/${fb_version}/search?q=${company}&type=page&fields=name,fan_count&access_token=${access_token}`)
         }
       }).then(response => {
         if (response) {
           response.json().then(data => {
             if (data.data[0]) {
               const companyId = data.data[0].id
               return fetch(graphAPIString(companyId, start_date, end_date, statistics))
             } else {
               res.json(successResponseFormatter(req, response))
             }
           }).then(response => {
             if (response) {
               response.json().then(data => {
                 if (data.error) {
                   res.json(failureResponseFormatter(req, 400, data.error.message))
                 } else {
                   res.json(successResponseFormatter(req, response, data))
                 }
               })
             }
           })
         }
       }).catch(error => console.error(error))
    }
  })
})

/*
 * Returns URL to pass to Facebook Graph API for company info.
 */
const graphAPIString = (company, start_date, end_date, statistics) => {
  return `https://graph.facebook.com/${fb_version}/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`
}

/*
 * Returns response JSON containing result data and metadata.
 */
const successResponseFormatter = (req, api_response, api_data) => {
  const metadata = metaDataGen(req, api_response.status, api_response.statusText, api_data)
  return {
    data: api_data,
    ...metadata
  }
}

failureResponseFormatter = (req, response_code, status_text) => {
  const metadata = metaDataGen(req, response_code, status_text)
  return {
    data: [],
    ...metadata
  }
}

const metaDataGen = (req, response_code, status_text, api_data = null) => {
  const end_time = new Date()
  return {
    dev_team: 'Team Unassigned',
    version: '1.0.0',
    start_time,
    end_time,
    time_elapsed: end_time - start_time,
    params: req.query,
    status: response_code,
    status_text: status_text
  }
}

const db = new sqlite3.Database('allcompanies.db', (err) => {
  if (err) {
    console.error(err.message)
  }
})

module.exports = router
