let SMTP = require("./smtp.js");
let Mail = new SMTP();
Mail.on("test@steam.jfagerberg.me", mail=>console.log(mail));