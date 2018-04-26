var fetch = require('isomorphic-fetch');
var express = require('express');
var moment = require('moment');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();

/*
 * Use Heroku REDIS_URL or default to local redis server.
 */
var REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
var cache = require('express-redis-cache')({
  client: require('redis').createClient(REDIS_URL),
  expire: 300,
});

var access_token = ''
const fb_version = 'v2.6'
const start_time = new Date()
const defaultPostParams = 'id, type, message, created_time, likes, comments'
const defaultCompanyParams = `id, name, website, description, category, fan_count, posts \{${defaultPostParams}\}`

/*
 * Report error if unspecified endpoint.
 */
router.get('/', cache.route(), function (req, res, next) {
  res.status(400)
  res.json(failureResponseFormatter(req, 400, 'No endpoint specified'))
})
router.get('/api', cache.route(), function (req, res, next) {
  res.status(400)
  res.json(failureResponseFormatter(req, 400, 'No endpoint specified'))
})

/*
 * Post information route for a company post.
 */
router.get('/post/:id', cache.route(), function (req, res, next) {
  const post = req.params.id
  let statistics = req.query.statistics || defaultPostParams

  if (!req.query.access_token || req.query.access_token.length < 10) {
    /* ensure an access token is provided */
    res.status(400)
    res.json(failureResponseFormatter(req, 400, 'Missing parameter `access_token`'))
  } else if (validPostStats(statistics) !== '') {
    /* check for valid stats parameter */
    res.status(400)
    res.json(failureResponseFormatter(req, 400, validPostStats(statistics)))
  }
  statistics = preprocessQuery(statistics)
  access_token = req.query.access_token;

  fetch(`https://graph.facebook.com/${fb_version}/${post}/?fields=${statistics}&access_token=${access_token}`)
  .then(function (response) {
    if (response.ok) {
      response.json().then(data => {
        if (data.error) {
          res.status(400)
          res.json(failureResponseFormatter(req, 400, data.error.message))
        } else {
          res.status(400)
          res.json(successResponseFormatter(req, response, formatPostInfo(data)))
        }
      })
    } else {
      response.json().then(data => {
        if (data.error) {
          res.status(400)
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
  let statistics = req.query.statistics || defaultCompanyParams

  if (!req.query.access_token || req.query.access_token.length < 10) {
    /* ensure an access token is provided */
    res.status(400)
    res.json(failureResponseFormatter(req, 400, 'Missing parameter `access_token`'))
  } else if (validCompanyStats(statistics) != '') {
    /* check for valid stats parameter */
    res.status(400)
    res.json(failureResponseFormatter(req, 400, validCompanyStats(statistics)))
  }
  statistics = preprocessQuery(statistics)
  access_token = req.query.access_token;

  const has_start = req.query.start_date ? true : false
  const has_end = req.query.end_date ? true : false
  const start_date = moment(req.query.start_date)
  const end_date = moment(req.query.end_date)

  /* allow for .ax suffix on company stock code */
  var c = req.params.company.replace(/\.ax$/i, '').toUpperCase()
  db.each(`SELECT *, COUNT(1) > 0
    FROM ASXListedCompanies
    WHERE (Code = '${c}' OR (Company = '${c}' OR Company LIKE '${c} %'))
    AND Pageid != '' LIMIT 1`, (err, row) => {
    if (err) {
      console.error(err.message)
    }
    const company = (row && row.Pageid) ? row.Pageid : c

    if (!start_date.isValid() || !end_date.isValid()) {
      /* check for valid date parameters */
      res.status(400)
      res.json(failureResponseFormatter(req, 400, 'Invalid date parameters'))
    } else {
      console.log(companyAPIString(company, statistics))
      fetch(companyAPIString(company, statistics))
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            if (!statistics.match(/posts/)) {
              res.json(successResponseFormatter(req, response, formatPostInfo(data)))
            } else {
              console.log(postAPIString(company, start_date, end_date, has_start && has_end, statistics.replace(/.*posts\ *\{|}.*/g, '')))
              fetch(postAPIString(company, start_date, end_date, has_start && has_end, statistics.replace(/.*posts\ *\{|}.*/g, '')))
              .then(response => {
                if (response.ok) {
                  response.json().then(posts => {
                    if (posts) data['posts'] = posts /* combine posts with company data */
                    res.json(successResponseFormatter(req, response, formatPostInfo(data)))
                  }).catch(error => console.error(error))
                } else {
                  /* some unknown error occured - this is very unlikely */
                  res.status(400)
                  res.json(failureResponseFormatter(req, 400, 'An unknown error occured'))
                }
              })
            }
          }).catch(error => console.error(error))
        } else {
          response.json().then(data => {
            if (data && data.error && data.error.message && data.error.message.match(/access token/)) {
              /* inform users of invalid or expired access token */
              res.status(400)
              res.json(failureResponseFormatter(req, 400, 'Access token invalid or expired'))
            } else {
              /* somewhat informative error */
              res.status(400)
              res.json(failureResponseFormatter(req, 400, `Unknown company \`${req.params.company}\``))
            }
          }).catch(error => console.error(error))
        }
      }).catch(error => console.error(error))
    }
  })
})

/*
 * Returns URL to pass to Facebook Graph API for company info.
 */
const companyAPIString = (company, statistics) => {
  return `https://graph.facebook.com/${fb_version}/${company}?fields=${statistics}&access_token=${access_token}`
}

/*
 * Returns URL to pass to Facebook Graph API for company posts.
 */
const postAPIString = (company, start_date, end_date, pass_date, statistics) => {
  if (pass_date) {
    return `https://graph.facebook.com/${fb_version}/${company}/posts?since=${start_date.unix()}&until=${end_date.unix()}&fields=${statistics}&access_token=${access_token}`
  } else {
    return `https://graph.facebook.com/${fb_version}/${company}/posts?fields=${statistics}&access_token=${access_token}`
  }
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

/*
 * Returns error response JSON containing metadata and empty data.
 */
const failureResponseFormatter = (req, response_code, status_text) => {
  const metadata = metaDataGen(req, response_code, status_text)
  return {
    data: [],
    ...metadata
  }
}

/*
 * Returns metadata for the current API query.
 */
const metaDataGen = (req, response_code, status_text, api_data = null) => {
  const end_time = new Date()
  return {
    dev_team: 'Team Unassigned',
    version: '3.0.0',
    start_time,
    end_time,
    time_elapsed: end_time - start_time,
    params: req.query,
    status: response_code,
    status_text: status_text
  }
}

/*
 * Converts user's paramaters for likes and comments into Facebook's equivalent.
 */
const preprocessQuery = (params) => {
  /* first, request all fields of posts by default */
  params = params.replace(/posts\ *(,|$)/, `posts\{${defaultPostParams}\}$1`)

  params = params.replace(/\blikes\b/, 'likes.limit(0).summary(true)')
  params = params.replace(/\bcomments\b/, 'comments.limit(0).summary(true)')
  return params
}

/*
 * Reformats JSON result for post information.
 * Used to tidy the output returned by the Facebook Graph API.
 */
const formatPostInfo = (data) => {
  /* tidy likes and comments for a single post */
  if (data.likes !== undefined) data.likes = data.likes.summary.total_count
  if (data.comments !== undefined) data.comments = data.comments.summary.total_count

  /* recursively tidy posts array */
  if (data.posts === undefined) return data
  var newPosts = []
  for (post of data.posts.data) {
    newPosts.push(formatPostInfo(post))
  }

  data.posts = newPosts
  return data
}

/*
 * Returns custom error text for unknown/unsupported company statistic.
 */
const validCompanyStats = (statistics) => {
  /* validate post params first */
  var stats = statistics
  var s = ''
  var i = 0
  while (s = statistics.match(/posts\{.+?\}/)) {
    if (i > 0) {
      return 'Statistic `posts` specified more than once (not allowed since version 2)'
    }
    if (!(s[0].match('^posts\ *\{[^,]+(,[^,]+)*\}$') && validPostStats(s[0]) === '')
) {
      return `Unknown statistic: \`${s[0]}\``
    }
    statistics = statistics.replace(/posts\ *\{.+?\}/, '');
    i++
  }
  statistics = statistics.replace(/posts\ *(\{.+\})/g, '')
  if (statistics.match(/posts/) && i > 0) {
    return 'Statistic `posts` specified more than once (not allowed since version 2)'
  }

  var seen = {}
  for (s of statistics.split(',')) {
    if (s === '' || s === ' ') continue;
    if (seen[s]) {
      return `Statistic \`${s}\` specified more than once (not allowed since version 2)`
    } else if (!s.match('^\ *(id|name|website|description|category|fan_count|posts)\ *$')) {
      return `Unknown statistic: \`${s}\``
    } else {
      seen[s] = 1
    }
  }
  if (stats.match(/^,|,$/) || stats.match(/,,/)) return `Malformed statistics: \`${stats}\``
  return ''
}

/*
 * Returns custom error text for unknown/unsupported post statistic.
 */
const validPostStats = (statistics) => {
  var stats = statistics
  statistics = statistics.replace(/\{|\}/g, '').replace(/^posts/, '')
  var seen = {}
  for (s of statistics.split(',')) {
    if (seen[s]) {
      return `Statistic \`${s}\` specified more than once (not allowed since version 2)`
    } else if (!s.match('^\ *(id|type|message|created_time|likes|comments)\ *$')) {
      return `Unknown statistic: \`${s}\``
    } else {
      seen[s] = 1
    }
  }
  if (stats.match(/^,|,$/) || stats.match(/,,/)) return `Malformed statistics: \`${stats}\``
  return ''
}

/*
 * Open database connection to company mapping database.
 */
const db = new sqlite3.Database('curatedCompanies.db', (err) => {
  if (err) {
    console.error(err.message)
  }
})

module.exports = router
