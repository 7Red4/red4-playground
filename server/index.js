const express = require("express");
const consola = require("consola");
const { Nuxt, Builder } = require("nuxt");
const request = require("request");
const app = express();

// Import and Set Nuxt.js options
const config = require("../nuxt.config.js");
config.dev = !(process.env.NODE_ENV === "production");

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server
  let server = app.listen(port, host);
  socketStart(server);
  console.log("Socket.IO starts");
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}

var onlineUsers = [];

function socketStart(server) {
  const io = require("socket.io").listen(server);
  io.on("connection", socket => {
    io.emit("EFB_init-send-user-list", onlineUsers);
    socket.on("EFC_user-in", userName => {
      onlineUsers.push(userName);
      var resData = {
        onlineUsers: onlineUsers,
        userName: userName
      };
      io.emit("EFB_user-in", resData);
    });
    socket.on("EFC_anonymous-in", userName => {
      onlineUsers.push(userName);
      var resData = {
        onlineUsers: onlineUsers,
        userName: userName
      };
      io.emit("EFB_anonymous-in", resData);
    });
    socket.on("EFC_user-out", userName => {
      onlineUsers.splice(onlineUsers.indexOf(userName), 1);
      var resData = {
        onlineUsers: onlineUsers,
        userName: userName
      };
      io.emit("EFB_user-out", resData);
    });
    socket.on("EFC_message", msg => {
      if (msg.type == "url") {
        request(msg.message, (err, res, body) => {
          if (res.headers["content-type"].includes("image")) {
            msg.type = "img";
          }
          io.emit("EFB_message", msg);
        });
      } else {
        io.emit("EFB_message", msg);
      }
    });
  });
}

start();
