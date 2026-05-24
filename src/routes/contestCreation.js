const express = require("express");
const Contest = require("../models/contest");
const adminmiddleware = require("../middleware/adminmiddleware");
const updateContestStatus = require('../utils/updateContestStatus');
const Submitproblem = require("../models/submissions")
const User=require("../models/user")
const contestRouter = express.Router();


//contest creation
contestRouter.post("/create",adminmiddleware, async (req, res) => {

    try{
      console.log("creae contest",req.body);
        const { title, startTime, endTime, problems } = req.body;

        console.log("starttime and endtime",startTime," ",endTime);

        if (!title || !startTime || !endTime || !problems?.length) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const contest = await Contest.create({
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            problems
        });

        res.json(contest);
    }
    catch(err){
        console.log("error in creation " , err);
        res.json({
            message:"contest did not created",
            error:err
        })
    }
  
});

//update
contestRouter.put("/update/:id",adminmiddleware, async (req, res) => {
  console.log("update page");
  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Not found" });

  // ❌ prevent editing if started
  if (Date.now() > new Date(contest.startTime)) {
    return res.status(400).json({
      message: "Cannot edit started contest"
    });
  }

  Object.assign(contest, req.body);
  await contest.save();

  res.json(contest);
});

//dlete
contestRouter.delete("/delete/:id",adminmiddleware,  async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Not found" });

  if (contest.status === "live") {
    return res.status(400).json({
      message: "Cannot delete live contest"
    });
  }

  contest.isDeleted = true;
  await contest.save();

  res.json({ message: "Deleted" });
});


contestRouter.get("/getAllContest", async (req, res) => {
  const contests = await Contest.find({ isDeleted: false });

  const updated = contests.map(c => {
    const updatedContest = updateContestStatus(c);
    return updatedContest;
  });

  res.json(updated);
});

contestRouter.get("/:contestId", async (req, res) => {
  const { contestId } = req.params;

  const contest = await Contest.findById(contestId)
    .populate("problems");

  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  res.json(contest);
});
// same logic, but optimized structure
//leaderboard
contestRouter.get("/:contestId/leaderboard", async (req, res) => {
  const { contestId } = req.params;

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  const submissions = await Submitproblem.find({ contestId })
    .sort({ createdAt: 1 });

  const map = {};

  // ✅ Step 1: Build leaderboard WITHOUT user DB calls
  for (let sub of submissions) {
    const u = sub.userId.toString();
    const p = sub.problemId.toString();

    if (!map[u]) {
      map[u] = { solved: 0, penalty: 0, problems: {} };
    }

    if (!map[u].problems[p]) {
      map[u].problems[p] = { attempts: 0, solved: false };
    }

    const prob = map[u].problems[p];

    if (prob.solved) continue;

    prob.attempts++;

    if (sub.status === "accepted") {
      prob.solved = true;
      map[u].solved++;

      const time =
        (new Date(sub.createdAt) - new Date(contest.startTime)) / 1000;

      map[u].penalty += time + (prob.attempts - 1) * 1200;
    }
  }

  // ✅ Step 2: Fetch all users in ONE query
  const userIds = Object.keys(map);

  const users = await User.find({
    _id: { $in: userIds }
  }).select("firstName emailId");

  // Convert to lookup map
  const userMap = {};
  users.forEach(user => {
    userMap[user._id.toString()] = user;
  });

  // ✅ Step 3: Merge user data
  const result = Object.entries(map).map(([userId, data]) => {
    const user = userMap[userId];

    return {
      userId,
      firstName: user?.firstName || "Unknown",
      emailId: user?.emailId || "",
      solved: data.solved,
      penalty: data.penalty,
    };
  });

  console.log("result",result);
  // ✅ Step 4: Sort leaderboard
  result.sort((a, b) =>
    b.solved - a.solved || a.penalty - b.penalty
  );

  res.json(result);
});


module.exports = contestRouter;