var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var sqlite3 = require('sqlite3').verbose()
var router = express.Router()

const access_token = 'EAACEdEose0cBACl0eSqZAwcUGJip7A3QCYIW63BooW3T6gCv8PCCsKxVOasp1MFB93Hyde4YC2eaL1SEplhUy1MYAerzNDGYSJ8C5yP5esEEpeZAMcK2ovT2hQD4IMZAWZAisBZCVZCqZBJAZB2rNudp0CpXGkMeFBgwT5nfdSel7YDAxiesKPAmBdEmcVO78vEZD'
const fb_version = 'v2.6'

/*
 * Post information route for a company post.
 */
router.get('/post/:id', function (req, res, next) {
  // start timer
  const start_time = new Date()
  const post = req.params.id
  const statistics = req.query.statistics

  if (!post) {
    // check for missing id parameter
    res.json({status: 400, status_text: 'Missing parameter: `id`'})
  } else if (!statistics) {
    // check for missing stats parameter
    res.json({status: 400, status_text: 'Missing parameter: `statistics`'})
  } else {
    fetch(`https://graph.facebook.com/${fb_version}/${post}/?fields=${statistics}&access_token=${access_token}`)
    .then(function (response) {
      // console.log(response)
      if (response.ok) {
        response.json().then(data => {
          if (data.error) {
            res.json({status: 400, status_text: data.error.message})
          } else {
            res.json(responseFormatter(req, response, start_time, data))
          }
        })
      } else {
        response.json().then(data => {
          if (data.error) {
            res.json({status: 400, status_text: data.error.message})
          }
        })
      }
    })
    .catch(error => console.error(error))
  }
})

/*
 * Facebook page information route for a company.
 */
router.get('/:company', function (req, res, next) {
     // start timer
  const start_time = new Date()
  const statistics = req.query.statistics
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
      res.json({status: 400, status_text: 'Invalid date parameters'})
    } else if (!statistics) {
      // check for missing stats parameter
      res.json({status: 400, status_text: 'Missing parameter: `statistics`'})
    } else {
      fetch(graphAPIString(company, start_date, end_date, statistics))
       .then(response => {
         if (response.ok) {
           response.json().then(data => {
             res.json(responseFormatter(req, response, start_time, data))
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
               res.json(responseFormatter(req, response))
             }
           }).then(response => {
             if (response) {
               response.json().then(data => {
                 if (data.error) {
                   res.json({status: 400, status_text: data.error.message})
                 } else {
                   res.json(responseFormatter(req, response, start_time, data))
                 }
               })
             }
           })
         }
       }).catch(error => console.error(error))
    }
  })
  console.log('hi ben')
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
const responseFormatter = (req, api_response, start_time, api_data) => {
  const end_time = new Date()
  return {
    data: api_data,
    dev_team: 'Team Unassigned',
    version: '1.0.0',
    start_time,
    end_time,
    time_elapsed: end_time - start_time,
    params: req.query,
    status: api_response.status,
    status_text: api_response.statusText
  }
}

const db = new sqlite3.Database('allcompanies.db', (err) => {
  if (err) {
    console.error(err.message)
  }
})

module.exports = router
