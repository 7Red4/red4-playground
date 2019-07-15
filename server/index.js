const express = require("express");
const consola = require("consola");
const { Nuxt, Builder } = require("nuxt");
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
    socket.on("disconnect", function() {});
    socket.on("EFC_user-in", function(userName) {
      onlineUsers.push(userName);
      var resData = {
        onlineUsers: onlineUsers,
        userName: userName
      };
      console.log(123);
      io.emit("EFB_user-in", resData);
    });
    socket.on("EFC_user-out", function(userName) {
      onlineUsers.splice(onlineUsers.indexOf(userName), 1);
      var resData = {
        onlineUsers: onlineUsers,
        userName: userName
      };
      io.emit("EFB_user-out", resData);
    });
    socket.on("EFC_message", function(msg) {
      io.emit("EFB_message", msg);
    });
  });
}

start();
