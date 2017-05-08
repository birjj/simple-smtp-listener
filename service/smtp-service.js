#!/usr/bin/env node
let SMTP = require("../src/smtp.js");
new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});