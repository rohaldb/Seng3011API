var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var router = express.Router()

const access_token = 'EAACEdEose0cBAMCFi4y8CgVgXsjwju7vnobZBJy4oNhT60ZC0ZB30WUiRhOXKnLvt9SP8GWMqHdzQ9109QjdnjiCtgQPXvTMKRwRtvdwZBgsIUNcz6800zHoARZBNfIugJ1OBTZCCpBulIf1b7FZBNSIgMCo1Fq4M1nm9p5dZCoan5ZBNkCdVTuqFmozvqs6Unhp8Q7XK14m1QQZDZD'

router.get('/', function (req, res, next) {
    // start timer
  const start_time = new Date()

    // console.log(req.query)

  let { company, statistics } = req.query
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  if (!start_date.isValid() || !end_date.isValid() || !company) {
    // the params are invalid, need to respond with invalid field
    res.json({status: 400, message: 'bad request'})
  } else {
    fetch(graphAPIString(company, start_date, end_date, statistics))
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          res.json(responseFormatter(req, response, start_time, data))
        })
      } else {
        return fetch(`https://graph.facebook.com/v2.12/search?q=${company}&type=page&fields=name,fan_count&access_token=${access_token}`)
      }
    }).then(response => {
      if (response != undefined) {
        response.json().then(data => {
          if (data.data[0]) {
            var companyId = data.data[0].id
            return fetch(graphAPIString(companyId, start_date, end_date, statistics))
          } else {
            res.json(responseFormatter(req, response))
          }
        }).then(response => {
          if (response != undefined) {
            response.json().then(data => {
              res.json(responseFormatter(req, response, start_time, data))
            })
          }
        })
      }
    }).catch(error => console.error(error))
  }
})

let graphAPIString = (company, start_date, end_date, statistics) => {
  return `https://graph.facebook.com/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`
}

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
