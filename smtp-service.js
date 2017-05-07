let smtp = require("./smtp.js");
let Mail = new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});