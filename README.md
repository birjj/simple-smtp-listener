# simple-smtp-listen

A NodeJS script that acts as a simple SMTP listen server. Accepts all emails, and emits them both as an EventEmitter and optionally through RabbitMQ.

## Usage (single access)

If only 1 script needs to receive mails:

```javascript
let SMTPServer = require("simple-smtp-listen").Server;
let server = new SMTPServer(25 /* port */);
server.on("test@example.com", (mail)=>{
    ...
});
```

## Usage (multi access)

If multiple scripts need to receive mails, create a symlink at `/var/dev/simple-smtp-listen/` pointing to the working directory, then create a symlink at `/etc/systemd/system/simple-smtp-listen.service` pointing to `./service/simple-smtp-listen.service`. Finally run `sudo systemctl start simple-smtp-listen`. This starts the server and keeps it running should it crash.

If you aren't running systemd, do the equivalent on your system.

Then in your scripts do

```javascript
let SMTPClient = require("simple-smtp-listen");
let client = new SMTPClient();
client.on("test@example.com", ()=>{
    ...
});
```

This requires you to have RabbitMQ installed and running on localhost, with the `guest:guest` user active (for other users edit [`service/smtp-service.js`](service/smtp-service.js) as needed).

## Mail object

All listeners receive a single response, a `Mail` object. This is simply the email parsed by [Nodemailer's Mailparser](https://nodemailer.com/extras/mailparser/). See their documentation for details.

## Socket

If you need access to mails from non-JS code (or you don't want to use `SMTPClient`), you can instead listen to the UNIX/Windows socket (default UNIX location: `/tmp/app.simple-smtp-listener`).

The server emits emails as UTF8-encoded JSON to all clients, using [`node-ipc`](https://github.com/RIAEvangelist/node-ipc).