#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "../app.js";
import parseArgs from "minimist";
import debugLib from "debug";
import jsforce from "jsforce";
import http from "http";
import fs from "fs";
import https from "https";

const debug = debugLib("your-project-name:server");

const args = process.argv.slice(2);
const argv = parseArgs(args);

const conn = new jsforce.Connection({
  loginUrl: "https://test.salesforce.com",
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3005");
app.set("port", port);

/**
 * Create HTTP server.
 */

app.get("/", async (req, res) => {
  res.json({
    message: "root",
  });
});

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Run Core Scripts
 */

async function asyncTasks(options) {
  try {
    await conn.login("username", "password");

    const sourceContentVersionFile =
      await conn.query(`SELECT Id, Title, ContentSize, VersionData, PathOnClient
                    FROM ContentVersion 
                    Where Id = '0680D000000uXbyQAE'
                    LIMIT 1`);

    const contentVersionRecord = sourceContentVersionFile.records[0];

    const fileName = "123" + "_summary_report.pptx";
    const file = fs.createWriteStream("./" + fileName);
    const assessmentDetails = {
      headers: {
        Authorization: `Bearer ${conn.accessToken}`,
      },
    };

    const request = https.get(
      conn.instanceUrl + contentVersionRecord.VersionData,
      assessmentDetails,
      (response) => {
        response.pipe(file);
      }
    );
  } catch (err) {
    console.log(`Error running Tasks => ${err}`);
  }
}

asyncTasks(argv);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * @description Event listener for HTTP server "error" event.
 * @param {*} error
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log(`Express Server Listening on ${bind}`);
  debug("Listening on " + bind);
}

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
