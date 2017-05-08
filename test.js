let SMTP = require("./src/smtp.js");
let Mail = new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});
Mail.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from EventEmitter:",mail);
});

let Client = require("./src/client.js");
let client = new Client();
client.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from client:",mail);
});