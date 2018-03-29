var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var router = express.Router()

const access_token = 'EAACEdEose0cBACp14l1b0G1RCQR7uW4ypBcQrGxZA6gRbfE5iAZCavZAHdaqzxpuT8ABmfwseol68ZAZAI1XCCvPdKBIT293dHvzHuSYHnTN85l1tgg6dvgwKA9Cj9U1Xb8uUTyqolNm218KksPlQarfoGprcurgpdi7t3GFfeqiJR4FXYTUy1LXy8ZBur2iwZD'
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
    res.json({status: 400, message: 'Missing parameter: `id`'})
  } else if (!statistics) {
    // check for missing stats parameter
    res.json({status: 400, message: 'Missing parameter: `statistics`'})
  } else {
    fetch(`https://graph.facebook.com/${fb_version}/${post}/?fields=${statistics}&access_token=${access_token}`)
    .then(function (response) {
      // console.log(response)
      if (response.ok) {
        response.json().then(data => {
          if (data.error) {
            res.json({status: 400, message: data.error.message})
          } else {
            res.json(responseFormatter(req, response, start_time, data))
          }
        })
      } else {
        response.json().then(data => {
          if (data.error) {
            res.json({status: 400, message: data.error.message})
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

  // console.log(req.query)

  const company = req.params.company
  const statistics = req.query.statistics
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  if (!start_date.isValid() || !end_date.isValid()) {
    // check for valid date parameters
    res.json({status: 400, message: 'Invalid date parameters'})
  } else if (!statistics) {
    // check for missing stats parameter
    res.json({status: 400, message: 'Missing parameter: `statistics`'})
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
                res.json({status: 400, message: data.error.message})
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
    metadata: {
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
}

module.exports = router
