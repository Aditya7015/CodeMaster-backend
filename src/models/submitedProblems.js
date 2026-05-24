const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const solvedProblemSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true
    },
    pointsEarned: {
        type: Number,
        required: true
    }
}, { timestamps: true });

solvedProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const SolvedProblem = mongoose.model("solvedProblem",solvedProblemSchema);

module.exports = SolvedProblem;