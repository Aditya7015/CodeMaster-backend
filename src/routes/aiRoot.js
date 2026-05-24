const express = require("express")
const Airouter= express.Router();
const  usermidleware = require("../middleware/usermidleware");
const  DoubtSolver = require("../controllers/doubtsolver");
Airouter.post("/Ai",usermidleware,DoubtSolver);

module.exports = Airouter;