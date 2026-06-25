"use strict";

const { Router } = require("express");
const { sortTicket } = require("../controllers/ticket.controller");

const router = Router();

router.post("/sort-ticket", sortTicket);

module.exports = router;
