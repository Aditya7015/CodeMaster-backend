// models/contest.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestSchema = new Schema({
  title: { type: String, required: true },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  problems: [
    { type: Schema.Types.ObjectId, ref: "problem" }
  ],

  participants: [
    { type: Schema.Types.ObjectId, ref: "user" }
  ],

  status: {
    type: String,
    enum: ["upcoming", "live", "past"],
    default: "upcoming"
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const Contest = mongoose.model("contest", contestSchema);
module.exports = Contest;