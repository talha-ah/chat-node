const express = require("express");
const router = express.Router();

const isAuth = require("../utils/isAuth");
const messengerController = require("../controllers/messenger");

router.get("/chats", isAuth, messengerController.getChats);
router.get("/chat/:chatId", isAuth, messengerController.getChat);

router.post("/chats", isAuth, messengerController.createChat);
router.post("/chat/:chatId", isAuth, messengerController.createMessage);

router.delete("/chat/:chatId", isAuth, messengerController.deleteChat);

module.exports = router;
