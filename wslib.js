const messageController = require("./controllers/message");
const WebSocket = require("ws");
const fs = require("fs");
const Message = require("./models/messageModelDB");


const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        messageController.wsCreateMessage(
          { message: message.split("::")[0], author: message.split("::")[1]}
        );

      //this.messages = messageController.wsGetMessages;
    });
  });
};
exports.wsConnection = wsConnection;