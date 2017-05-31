let Server = require("../Server");
let Client = require("..");

let server = new Server(2525, {debug: true});
server.on("ready", ()=>{
    let client = new Client({debug: true});
    client.on("*", (mail)=>{
        console.log("Received email:", mail);
    });
});