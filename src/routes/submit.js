const express = require("express");
const submitrouter= express.Router();
const {submitProblembyUser,runProblembyUser,submittedSolution} = require("../controllers/submissions");
const  usermidleware = require("../middleware/usermidleware");
const submitlimiter = require("../ratelimiter/submitlimiter")


submitrouter.post("/submitproblem/:id",usermidleware , submitlimiter ,submitProblembyUser);
submitrouter.post("/runproblem/:id",usermidleware,runProblembyUser);
submitrouter.get("/submittedSolution/:id",usermidleware,submittedSolution);
module.exports = submitrouter;