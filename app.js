"use strict";

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fetch from 'isomorphic-fetch';
import crypto from 'crypto';
import xmlhttprequest from "xmlhttprequest";
import textEncoding from 'text-encoding';
import nconf from 'nconf';
//import indexRouter from './routes/index.js';
const __dirname = path.resolve();

nconf.env([
    "SF_PROXY_APPLICATION_PORT",
    "SF_PROXY_PRIVATE_KEY_PATH",
    "SF_CONNECTED_APP_CLIENT_ID",
]);
nconf.defaults({ conf: `${__dirname}/config.json` });
nconf.file(nconf.get("conf"));

if (typeof window === "undefined") {
    global.window = typeof window !== "undefined" ? window : global;
    global.window.location = { host: {} };
    global.window.self = {};
    global.fetch = fetch;
    global.crypto = crypto;
    global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest;
    global.TextEncoder = textEncoding.TextEncoder;
    global.navigator = {};
}

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

//app.use('/', indexRouter);


export default app;
