
const { response } = require("express");
/**
 * Imports
 */
const fs = require("fs");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000");
const {messageValidation} = require("../models/message");
const Message = require("../models/messageModelDB");
let array = [];

/**
 * Method that generates a message body based on the parameters.
 */
const makeMessage = (message) => {
  let msgNew = {
    message: message.message,
    author: message.author,
    ts: new Date().getTime(),
  };
  return msgNew;
};

/**
 * Method that updates the jsonfile based on the messages array.
 */
const save = () => {
  fs.writeFileSync("./messagesArray.json", JSON.stringify(messages));
};

/**
 * Method that add a message to the array.
 * @param {message} message 
 */
const pushMessage = (message) => {
  let msgToPersist = makeMessage(message);
  Message.create({message: msgToPersist.message, author: msgToPersist.author, ts:msgToPersist.ts}).then((response)=>{
    return response;
  });
};

exports.wsCreateMessage = pushMessage;

/**
 * Method that gets all messages in the database.
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 */
exports.getAllMessages = (req, res, next) => {
  Message.findAll().then((result) => {
    console.log(result);
    res.status(200).send(result);
  }).catch((err)=>{
    console.log(err);
  });
};

/**
 * Method that validates, creates and saves a message with the given information.
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 */
exports.createMessage = (req, res, next) => {
  const { error } = messageValidation.validate(req.body);
  if (error){
    return res.status(400).send(error);
  }
    // Sequelize persistence
    let msgToPersist = makeMessage(req.body);

    Message.create({message: msgToPersist.message, author: msgToPersist.author, ts:msgToPersist.ts}).then((response)=>{
      console.log("Entra promesa crear");
      console.log(response);
      res.status(200).send(response);
    });
  //pushMessage(req.body);
  //Update
  ws.send("");
};

/**
 * Method that gets a message with the given id or timestamp.
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 */
exports.getMessageById = (req, res, next) => {
  let message = messages.find((item) => item.ts === parseInt(req.params.ts));
  if(!message){
    return res.status(400).send("The message with the given id was not found.");
  }
  res.status(200).send(message);
};

/**
 * Method that deletes a message with the given id or timestamp.
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 */
exports.deleteMessage = (req, res, next) => {
  let i = messages.findIndex(
    (item) => item.ts === parseInt(req.params.ts)
  );
  if (i < 0) {
    return res.status(400).send("The message with id provided was not deleted");
  }
  messages.splice(i, 1);
  save();
  res.status(200).send(messages);
  //Update
  ws.send("");
};

/**
 * Method that updates a message with the given information.
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 */
exports.updateMessage = (req, res, next) => {
  let i = messages.findIndex(
    (item) => item.ts === parseInt(req.body.ts)
  );
  const { error } = messageValidation.validate(req.body);
  if (i < 0){
    return res.status(400).send("The message with id provided was not updated.");
  }
  if (error){
    return res.status(400).send(error);
  }
  messages[i] = makeMessage(req.body);
  save();
  res.status(200).send(messages);
  //Update
  ws.send("");
};