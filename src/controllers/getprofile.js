// controllers/user.controller.js
const mongoose = require("mongoose");
const User = require("../models/user");
const SolvedProblem = require("../models/submitedProblems");
const Submission = require("../models/submissions");

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const objectId = new mongoose.Types.ObjectId(userId);

    // 🔹 1. USER BASIC INFO
    const user = await User.findById(userId).select("firstName lastName role emailId");

    // 🔹 2. SOLVED STATS (AGGREGATION)
    const solvedStats = await SolvedProblem.aggregate([
      { $match: { userId: objectId } },

      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem"
        }
      },
      { $unwind: "$problem" },

      {
        $group: {
          _id: null,
          totalSolved: { $sum: 1 },
          easy: {
            $sum: {
              $cond: [{ $eq: ["$problem.difficulty", "easy"] }, 1, 0]
            }
          },
          medium: {
            $sum: {
              $cond: [{ $eq: ["$problem.difficulty", "medium"] }, 1, 0]
            }
          },
          hard: {
            $sum: {
              $cond: [{ $eq: ["$problem.difficulty", "hard"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const solved = solvedStats[0] || {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0
    };

    // 🔹 3. SUBMISSION STATS
    const submissions = await Submission.find({ userId });

    const totalSubmissions = submissions.length;
    const accepted = submissions.filter(s => s.status === "accepted").length;

    const acceptanceRate =
      totalSubmissions === 0 ? 0 : ((accepted / totalSubmissions) * 100).toFixed(1);

    // 🔹 4. LAST YEAR ACTIVITY
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const submissionsLastYear = submissions.filter(
      s => new Date(s.createdAt) >= oneYearAgo
    );

    // 🔹 5. STREAK CALCULATION
    const datesSet = new Set(
      submissions.map(s => new Date(s.createdAt).toDateString())
    );

    const dates = [...datesSet].sort((a, b) => new Date(a) - new Date(b));

    let maxStreak = 0, currentStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const diff =
          (new Date(dates[i]) - new Date(dates[i - 1])) /
          (1000 * 60 * 60 * 24);

        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // 🔹 FINAL RESPONSE
    res.json({
      user,
      solved,
      totalSubmissions,
      accepted,
      acceptanceRate,
      submissionsLastYear: submissionsLastYear.length,
      maxStreak
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports =  getUserProfile ;