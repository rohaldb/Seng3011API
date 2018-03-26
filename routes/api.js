var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var router = express.Router()

const access_token = 'EAACEdEose0cBAGo2ZCsH8KkjEiLiUM2YKsxKyDZB0VHTngfbgxZBqNyQjFOyQb1CGILZAZA53LybE32mdJlAtGAQQPCArhvQjAs0aVE1i8e4ZC84KKlqCfLwQkBKN9WlPRO9NKQJn7SKgbVQ8IlZA24PXy2TwbToQQF4eziFQrSrkqXEIZAwt4FHvhV5hEV0je8ZD'

router.get('/', function (req, res, next) {
  // start timer
  const start_time = new Date()

  console.log(req.query)

  const { company, statistics } = req.query
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  if (!start_date.isValid() || !end_date.isValid() || !company) {
    // the params are invalid, need to respond with invalid field
    res.json({status: 400, message: 'bad request'})
  } else {
    // .fetch(url for company name to id mapping)
    // .then(
    //   extract the appropriate value
    //   and pass it into the below string
    //   return fetch(`https://graph.facebook.com/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`)
    // )
    fetch(`https://graph.facebook.com/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`)
    .then(function (response) {
      if (response.ok) {
        response.json().then(data => {
          res.json(responseFormatter(req, response, start_time, data))
        })
      } else {
        res.json(responseFormatter(req, response, start_time))
      }
    })
    .catch(error => console.error(error))
  }
})

const responseFormatter = (req, api_response, start_time, api_data = null) => {
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
