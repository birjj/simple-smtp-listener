#!/usr/bin/env node
let SMTP = require("../Server");
let server = new SMTP(25, {debug: true});