"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    AWS_ACCESS_KEY_ID: process.env.DB_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.DB_AWS_SECRET_ACCESS_KEY,
    HOST: process.env.DB_HOST,
    REGION: 'us-east-1',
    PATH: '/graphql',
    ENDPOINT: '',
};
config.ENDPOINT = "https://" + config.HOST + config.PATH;
exports.default = config;