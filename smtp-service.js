#!/usr/bin/env node
let SMTP = require("./smtp.js");
let Mail = new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});