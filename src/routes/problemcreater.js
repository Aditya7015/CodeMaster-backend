const express= require("express")
const adminmidleware=require("../middleware/adminmiddleware");
const usermidleware = require("../middleware/usermidleware");
const problemRouter= express.Router();

const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,getAllsubmitproblem}= require("../controllers/createProblem");

problemRouter.post("/create",adminmidleware,createProblem);
problemRouter.put("/update/:id",adminmidleware, updateProblem);
problemRouter.delete("/deleteproblem/:id",adminmidleware,deleteProblem);
problemRouter.get("/getproblem/:id",getProblemById);
problemRouter.get("/AllProbmlem", getAllProblem);
problemRouter.get("/getallsubmitproblem",usermidleware,getAllsubmitproblem);

module.exports = problemRouter;