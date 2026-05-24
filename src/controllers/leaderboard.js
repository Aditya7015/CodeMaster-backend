
const SolvedProblem = require("../models/submitedProblems");

const leaderboard = async (req, res) => {
    try {
        console.log("leaderboard cl")
        const leaderboard = await SolvedProblem.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalPoints: { $sum: "$pointsEarned" },
                    problemsSolved: { $sum: 1 }
                }
            },
            {
                $lookup:{ 
                    from: "users", // collection name in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.firstName",
                    email: "$user.emailId",
                    totalPoints: 1,
                    problemsSolved: 1
                }
            },
            {
                $sort: { totalPoints: -1 }
            }
        ]);
        console.log(leaderboard);
        res.status(200).json({
            success: true,
            leaderboard
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = leaderboard;