"use strict"

global.WebSocket = require('ws')
require('es6-promise').polyfill()
require('isomorphic-fetch')

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

// Import gql helper and craft a GraphQL query
const gql = require('graphql-tag');
const query = gql(`
query listRemoteMachineModels {
    listRemoteMachineModels {
      items {
        id
        dateTime
      }
    }
}`)

// Set up Apollo client
const client = new AWSAppSyncClient({
    url: url,
    region: region,
    auth: {
        type: type,
        credentials: credentials,
    }
})

client.hydrated().then((client) => {
    schedule.scheduleJob('*/5 * * * *', () => {
        https.get(url + `/ping?query={id{${process.env.DB_MACHINE_ID}}}`, (resp) => {
            let data = ''

            resp.on('data', (chunk) => {
                data += chunk
            })

            resp.on('end', () => {
                console.log(JSON.parse(data))
            })

        }).on('error', (err) => {
            console.log('Error: ' + err.message)
        })

        //Now run a query
        client.query({ query: query })
            .then((data) => {
                console.log('results of query: ', data)
            })
            .catch(console.error)
    })
})