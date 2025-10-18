const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const db = require("./server/core").database;
const mqttClient = require("./server/core").mqttClient;
const apiRouter = require("./server/api").router;
const config = require("./config");
const mongoose = require("mongoose");
const { database } = require("./server/core");
const https = require("https"); ///for ssl https
const http = require("http"); //for ssl http
const fs = require("fs");
const path = require("path");
const socketIo = require("socket.io");
const uoStopMeter = require("./server/utils/uoStopMeter");

const port = Number(config.HTTP_PORT);
const app = express();

const httpsOptions = {
  cert: fs.readFileSync(
    path.resolve(__dirname, "./TempSSL/5ee9c109bde61749.crt")
  ),
  // ca: fs.readFileSync(path.resolve(__dirname, './TempSSL/gd_bundle-g2.crt')),
  key: fs.readFileSync(path.resolve(__dirname, "./TempSSL/ssl.key")),
};
const allowedOrigins = [
  "http://testdomain.elliotsystemsonline.com",
  "http://ec2-3-135-178-120.us-east-2.compute.amazonaws.com",
  "https://ec2-3-135-178-120.us-east-2.compute.amazonaws.com",
  "http://localhost:3000",
  "http://iot.elliotsystemsonline.com",
  "https://iot.elliotsystemsonline.com",
  "http://iiot.elliotsystemsonline.com",
  "https://iiot.elliotsystemsonline.com",
  "https://uo.elliotsystemsonline.com",
  "http://localhost:8081",
  "http://uo.elliotsystemsonline.com",
  "https://localhost:8081",
  "https://elliot-iiot-frontend-user.vercel.app",
  "https://elliot-iiot-frontend-admin.vercel.app",
  "https://elliot-frontend-super-admin.vercel.app",
  /^https:\/\/elliot-iiot-frontend-user-[a-z0-9]+-mahendra-jadamals-projects\.vercel\.app$/,
  /^https:\/\/elliot-iiot-frontend-admin-[a-z0-9]+-mahendra-jadamals-projects\.vercel\.app$/,
  "https://elliot-iiot-frontend-admin.onrender.com",
  "https://elliot-iiot-frontend-user.onrender.com",
  "https://elliot-iiot-frontend-user-vrfg.onrender.com",
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server or tools like curl (no Origin header)
      if (!origin) return callback(null, true);

      // check if origin matches any string or regex in the array
      const isAllowed = allowedOrigins.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return pattern === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/", apiRouter);

const httpsServer = https.createServer(httpsOptions, app);
const httpServer = http.createServer(app);
httpsServer.listen(config.HTTPS_PORT);
httpServer.listen(config.HTTP_PORT);
const io = socketIo(httpsServer, {
  cors: {
    origin: [
      "https://iiot.elliotsystemsonline.com",
      "http://localhost:3000",
      "http://uo.elliotsystemsonline.com",
      "https://uo.elliotsystemsonline.com",
      "https://elliot-iiot-frontend-user-vrfg.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
uoStopMeter.socketConnection(io);

// app.listen(port, function() {
//     console.log('server connected on port:-', port);
// })
