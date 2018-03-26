var fetch = require('isomorphic-fetch')
var express = require('express')
var moment = require('moment')
var router = express.Router()

const access_token = 'EAACEdEose0cBAOcAKM2oSP9X0KPZBdAiYBIWZCPqCTh7nZA1knFZCYgXsT8z7WuzZBMeO4xdglSYUA7kfW44ZBZCJdvaykGtF4TYRSypo5PLv7mXK272vjR6xEFhCjhGYfy9u94hgBLyrR08Dqex6NWfHpeajHrMRUGqq6OjSQkIuwwHHtiMHfzMssZA5c7J0y0ZD'

router.get('/', function (req, res, next) {
  console.log(req.query)

  const { company, statistics } = req.query
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  if (!start_date.isValid() || !end_date.isValid() || !company) {
    // the params are invalid, need to respond with invalid field
    res.json({status: 400, message: 'bad request'})
  } else {
    fetch(`https://graph.facebook.com/${company}?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`)
    .then(function (response) {
      if (response.ok) {
        response.json().then(json => {
          res.json(json)
        })
      }
    })
    .catch(error => console.error(error))
  }
})

module.exports = router
