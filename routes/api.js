var fetch = require('isomorphic-fetch')
var express = require('express')
var router = express.Router()

const access_token = 'EAACEdEose0cBAFk3fosTiz7X8AvZC7lzWVqSuewZBFd6tJUPNripJReOhL0zpbdBIpQfNZBQgZAauD1MhmEDUrNrqSiBBYyE317nVgdudTDo9562a9SVZBzqtH8pujhXsF7qwgvBHdcmHlvpIKMZCv4Y3MRO9enG24umSX3XevnulSlVIOPihbhD9sm7D2qffiqQZC5mdcUWwZDZD'

router.get('/', function (req, res, next) {
  fetch(`https://graph.facebook.com/woolworths?access_token=EAACEdEose0cBAFk3fosTiz7X8AvZC7lzWVqSuewZBFd6tJUPNripJReOhL0zpbdBIpQfNZBQgZAauD1MhmEDUrNrqSiBBYyE317nVgdudTDo9562a9SVZBzqtH8pujhXsF7qwgvBHdcmHlvpIKMZCv4Y3MRO9enG24umSX3XevnulSlVIOPihbhD9sm7D2qffiqQZC5mdcUWwZDZD`)
  .then(function (response) {
    if (response.ok) {
      response.json().then(json => {
        res.json(json)
      })
    }
  })
  .catch(error => console.error(error))
})

module.exports = router
