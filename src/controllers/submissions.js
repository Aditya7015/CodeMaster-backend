const {getLanguageById,submitBatch,submittoken}= require("../utils/problemUtility");
const  Problem = require("../models/problem");
const User= require("../models/user");
const Submitproblem = require("../models/submissions");
const SolvedProblem = require("../models/submitedProblems");
const Contest = require("../models/contest");

// const submitProblembyUser = async (req,res)=>{

    
   
//     try{


//         const difficultyPoints = {
//     easy: 2,
//     medium: 4,
//     hard: 8
// };
//         const problemId=req.params.id;
        
//         const user_id=req.result._id;
//         const {code, language ,contestId}=req.body;
      

       
//         // if( !problemId || !user_id || !code || !language){
//         //     return res.status(400).send("something is missed");
//         // }
        
        
//         let lang = language;

//         if(language == "cpp"){
//             lang = 'c++';
//         }
       
//         const  problem = await Problem.findById(problemId);
       
//         const submittedResult = await Submitproblem.create({
//             userId:user_id,
//             problemId:problemId,
//             code:code,
//             language:lang,
//             status:"pending",
//             testCasesTotal:problem.hiddenTestCases.length,
//             contestId: contestId || null
//         })

//         const language_id = getLanguageById(language);
       

//         const submissions = problem.hiddenTestCases.map((testcase)=>({
//         source_code:code,
//         language_id: language_id,
//         stdin: testcase.input,
//         expected_output: testcase.output
//         }));
       

//         const sumissionresult= await submitBatch(submissions);
//         console.log(sumissionresult)
//         const tokens = sumissionresult.map((val)=>{
//             return val.token;
//         }) 

//         const tokenresult = await submittoken(tokens);
        
//         // submittedResult ko update karo
        
//     let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = 'accepted';
//     let errorMessage = null;


//     for(const test of tokenresult){
//         if(test.status_id==3){
//            testCasesPassed++;
//            runtime = runtime + parseFloat(test.time)
//            memory = Math.max(memory,test.memory);
//         }else{
//           if(test.status_id==4){
//             status = 'error'
//             errorMessage = test.stderr
//           }
//           else{
//             status = 'wrong'
//             errorMessage = test.stderr
//           }
//         }
//     }

    

// if (contestId) {
//     const contest = await Contest.findById(contestId);

//     if (!contest) {
//         return res.status(404).json({ message: "Contest not found" });
//     }

//     const now = new Date();

//     if (now < new Date(contest.startTime)) {
//         return res.status(400).json({
//             message: "Contest has not started yet"
//         });
//     }

//     if (now > new Date(contest.endTime)) {
//         return res.status(400).json({
//             message: "Contest has ended"
//         });
//     }
// }

// if (contestId) {
//     await Contest.findByIdAndUpdate(
//         contestId,
//         { $addToSet: { participants: user_id } }
//     );
// }

//     // Store the result in Database in Submission
//     submittedResult.status   = status;
//     submittedResult.testCasesPassed = testCasesPassed;
//     submittedResult.errorMessage = errorMessage;
//     submittedResult.runtime = runtime;
//     submittedResult.memory = memory;
//     await submittedResult.save();

//     // 👇 SOCKET EMIT 
// if (submittedResult.contestId) {
//     global.io
//         .to(submittedResult.contestId.toString())
//         .emit("leaderboardUpdate");
// }
    
//     //store the problem in coresponding user 
//     const user=await User.findById ( user_id);

//     if(! user.problemSolved.includes(problemId)){
//        user.problemSolved.push(problemId);
//        await user.save();
//     }
    
//     if (status === "accepted") {
    
//     const alreadySolved = await SolvedProblem.findOne({
//         userId:user_id,
//         problemId:problemId
//     });
 
//     console.log("alreadySolved",alreadySolved);
//     if (!alreadySolved) {
//         await SolvedProblem.create({
//             userId: user_id,
//             problemId:problemId,
//             pointsEarned: difficultyPoints[problem.difficulty]
//         });
//     }
// }
    
// console.log(submittedResult);
    
//     return res.status(201).send(submittedResult);
//     }
//     catch(err){
//         console.log("error",err);
//         res.send(err);
//     }
// }

// const runProblembyUser = async (req,res)=>{
   
//     try{

        
      
//         const problemId=req.params.id;
        
//         const user_id=req.result._id;
//         const {code, language}=req.body;
      

       
//         // if( !problemId || !user_id || !code || !language){
//         //     return res.status(400).send("something is missed");
//         // }
       
//         const  problem = await Problem.findById(problemId);
       
                  
       
//         const language_id = getLanguageById(language);
        

//         const submissions = problem.visibleTestCases.map((testcase)=>({
//         source_code:code,
//         language_id: language_id,
//         stdin: testcase.input,
//         expected_output: testcase.output
//         }));
       
//         console.log(JSON.stringify(submissions, null, 2));
//         const sumissionresult= await submitBatch(submissions);
        
       
//         const tokens = sumissionresult.map((val)=>{
//             return val.token;
//         }) 

//         const tokenresult = await submittoken(tokens);
        
//         // submittedResult ko update karo
   

    
    
//     return res.status(201).send(tokenresult);
//     }
//     catch(err){
//         res.send(err);
//     }
// }

//different submittion for one problem


const submitProblembyUser = async (req, res) => {
  try {
    const difficultyPoints = {
      easy: 2,
      medium: 4,
      hard: 8,
    };

    const problemId = req.params.id;
    const user_id = req.result._id;
    const { code, language, contestId } = req.body;

    if (!problemId || !user_id || !code || !language) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let lang = language === "cpp" ? "c++" : language;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // ✅ create submission entry
    const submittedResult = await Submitproblem.create({
      userId: user_id,
      problemId: problemId,
      code: code,
      language: lang,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
      contestId: contestId || null,
    });

    const language_id = getLanguageById(language);

    // ✅ prepare submissions
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: language_id,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // ✅ send to Judge0
    const submissionResult = await submitBatch(submissions);
    const tokens = submissionResult.map((val) => val.token);

    // ✅ wait for results (your fixed polling function)
    const tokenresult = await submittoken(tokens);

    // -------------------------------
    // ✅ evaluate results
    // -------------------------------
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of tokenresult) {
      if (test.status.id === 3) {
        // Accepted
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        // ❗ stop early (important)
        if (test.status.id === 4) {
          status = "error";
          errorMessage = test.stderr || test.compile_output;
        } else {
          status = "wrong";
          errorMessage = test.stderr || test.stdout;
        }
        break;
      }
    }

    // -------------------------------
    // ✅ contest validation
    // -------------------------------
    if (contestId) {
      const contest = await Contest.findById(contestId);

      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      const now = new Date();

      if (now < new Date(contest.startTime)) {
        return res.status(400).json({
          message: "Contest has not started yet",
        });
      }

      if (now > new Date(contest.endTime)) {
        return res.status(400).json({
          message: "Contest has ended",
        });
      }

      await Contest.findByIdAndUpdate(contestId, {
        $addToSet: { participants: user_id },
      });
    }

    // -------------------------------
    // ✅ update submission
    // -------------------------------
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // -------------------------------
    // ✅ socket update
    // -------------------------------
    if (submittedResult.contestId) {
      global.io
        .to(submittedResult.contestId.toString())
        .emit("leaderboardUpdate");
    }

    // -------------------------------
    // ✅ update user solved problems
    // -------------------------------
    const user = await User.findById(user_id);

    if (!user.problemSolved.includes(problemId)) {
      user.problemSolved.push(problemId);
      await user.save();
    }

    // -------------------------------
    // ✅ award points (only if accepted)
    // -------------------------------
    if (status === "accepted") {
      const alreadySolved = await SolvedProblem.findOne({
        userId: user_id,
        problemId: problemId,
      });

      if (!alreadySolved) {
        await SolvedProblem.create({
          userId: user_id,
          problemId: problemId,
          pointsEarned: difficultyPoints[problem.difficulty],
        });
      }
    }

    return res.status(201).json(submittedResult);

  } catch (err) {
    console.error("Submit Error:", err);
    return res.status(500).json({ message: "Submission failed" });
  }
};

const runProblembyUser = async (req, res) => {
  try {
    const problemId = req.params.id;
    const user_id = req.result._id;
    const { code, language } = req.body;
    console.log("run",req.body);

    // basic validation
    if (!problemId || !user_id || !code || !language) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const language_id = getLanguageById(language);

    // ✅ prepare submissions (NO base64 here because submitBatch uses base64_encoded: false)
    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: language_id,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // ✅ Step 1: send batch
    const submissionResult = await submitBatch(submissions);

    // ✅ Step 2: extract tokens
    const tokens = submissionResult.map((val) => val.token);

    // ✅ Step 3: wait + get final results (your fixed function)
    const finalResults = await submittoken(tokens);
    

    // optional: format response (clean for frontend)
    const formatted = finalResults.map((r, index) => ({
      testCase: index + 1,
      status: r.status.description,
      passed: r.status.id === 3, // 3 = Accepted
      output: r.stdout,
      expected: r.expected_output,
      error: r.stderr || r.compile_output,
      time: r.time,
      memory: r.memory,
    }));
    
    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Run Problem Error:", err);
    return res.status(500).json({ message: "Error running code" });
  }
};

const submittedSolution= async(req,res)=>{
   
    try{
        const problemId= req.params.id;
        const userId = req.result._id;
        const solutions =await Submitproblem.find({userId,problemId});
       
        if(solutions.length==0)
            res.status(200).send("No Submission is persent");
        
        res.status(200).send(solutions);
    }
    catch(err){
        res.status(400).send(err);
    }
}

module.exports = {submitProblembyUser,runProblembyUser,submittedSolution};