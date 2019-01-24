'use strict'

global.WebSocket = require('ws')
require('es6-promise').polyfill()
require('isomorphic-fetch')

const querystring = require('querystring')
const https = require('https')
const schedule = require('node-schedule')
require('dotenv').config()

// Require exports file with endpoint and auth info
const aws_exports = require('./aws-exports').default

// Require AppSync module
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE
const AWSAppSyncClient = require('aws-appsync').default

const url = aws_exports.ENDPOINT
const region = aws_exports.REGION
const type = AUTH_TYPE.API_KEY

// If you want to use AWS...
const AWS = require('aws-sdk')
AWS.config.update({
    region: aws_exports.REGION,
    credentials: new AWS.Credentials({
        accessKeyId: aws_exports.AWS_ACCESS_KEY_ID,
        secretAccessKey: aws_exports.AWS_SECRET_ACCESS_KEY
    })
})
const credentials = AWS.config.credentials

// Set up Apollo client
const client = new AWSAppSyncClient({
    url: url,
    region: region,
    auth: {
        type: type,
        credentials: credentials
    }
})

client.hydrated().then((client) => {
    const postData = JSON.stringify({ 'query': `query aTest($arg1: Int!) { test(id: ${process.env.DB_MACHINE_ID}) }` })

    const options = {
        hostname: url,
        port: 443,
        path: '/ping',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    }

    schedule.scheduleJob('*/1 * * * *', () => {
        const req = https.request(options, (res) => {
            console.log('statusCode:', res.statusCode)
            console.log('headers:', res.headers)

            res.on('data', (data) => {
                process.stdout.write(data)
            })
        })

        req.on('error', (error) => {
            console.error(error)
        })

        req.write(postData)
        req.end()
    })
})