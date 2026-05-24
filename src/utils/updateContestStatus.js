// utils/updateContestStatus.js

module.exports = function updateContestStatus(contest) {
  const now = Date.now();

  if (now < new Date(contest.startTime)) {
    contest.status = "upcoming";
  } else if (now > new Date(contest.endTime)) {
    contest.status = "past";
  } else {
    contest.status = "live";
  }

  return contest;
};