const {getLanguageById,submitBatch,submittoken}=require("../utils/problemUtility");
const Problem=require("../models/problem");
const Submitproblem= require("../models/submissions");
const User = require("../models/user");


const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const createProblem = async (req, res) => {
  const {
    title,
    description,
    tags,
    difficulty,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution
  } = req.body;

  console.log("createproblem data :",req.body);

  try {
    for (const { language, completeCode } of referenceSolution) {

      const languageId = getLanguageById(language);
 
      const submissions = visibleTestCases.map((testcase) => ({
        language_id: languageId,
        source_code: completeCode,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

     
      // 1. Submit batch
      const submitResult = await submitBatch(submissions);
      const tokens = submitResult.map((val) => val.token);

      console.log("tokens" , tokens);
      let tokenresult = [];

      // 2. Poll until results are ready
      for (let i = 0; i < 10; i++) {
        tokenresult = await submittoken(tokens);

        const allDone = tokenresult.every(
          (val) => val.status.id !== 1 && val.status.id !== 2
        );

        if (allDone) break;

        await wait(1000); // wait 1 sec before retry
      }

      console.log("token result",tokenresult);
      // 3. Validate results
      for (const val of tokenresult) {

       

        // compilation error
        if (val.compile_output) {
          console.log("compilation error")
          return res.status(400).json({
            error: "Compilation error in reference solution",
            details: val.compile_output
          });
        }

        // runtime error
        if (val.stderr) {
          console.log("runtime error");
          return res.status(400).json({
            error: "Runtime error in reference solution",
            details: val.stderr
          });
        }

        // still not processed (edge case)
        console.log("still not processed");
        if (val.status.id === 1 || val.status.id === 2) {
          return res.status(400).json({
            error: "Judge0 did not finish processing in time"
          });
        }

        // wrong answer
        console.log("wrong answered");
        if (val.status.id !== 3) {
          return res.status(400).json({
            error: "Reference solution failed on test case",
            expected: val.expected_output,
            received: val.stdout,
            status: val.status.description
          });
        }
      }
    }

    console.log("process to save ");
    // 4. Save problem
    const userProblem = await Problem.create({
      title,
      description,
      tags,
      difficulty,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
      // problemCreator: req.result._id
    });

  
    console.log("problems saved");

    res.status(201).json({
      message: "Problem saved successfully"
    });

  } catch (err) {
    console.error("Create Problem Error:", err);

    res.status(500).json({
      error: "Something went wrong while creating problem"
    });
  }
};


const validateReferenceSolution = async (referenceSolution, visibleTestCases) => {

  for (const { language, completeCode } of referenceSolution) {

    const languageId = getLanguageById(language);

    const submissions = visibleTestCases.map((testcase) => ({
      language_id: languageId,
      source_code: completeCode,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(val => val.token);

    const tokenresult = await submittoken(tokens);

    for (const val of tokenresult) {
      if (val.status.id !== 3) {
        return {
          success: false,
          details: val
        };
      }
    }
  }

  return { success: true };
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("Invalid ID");
    }

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    const result = await validateReferenceSolution(
      req.body.referenceSolution,
      req.body.visibleTestCases
    );

    if (!result.success) {
      return res.status(400).json({
        error: "Reference solution failed",
        details: result.details.status
      });
    }

    await Problem.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true
    });

    return res.status(201).send("Problem updated successfully");

  } catch (err) {
    return res.status(500).send("error " + err);
  }
};

// const updateProblem = async (req,res)=>{
 
//     const {id}=req.params;
//     console.log("upading",id,req.body);
//     const {title,description,tags,difficulty,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator}=req.body;
    
//     try{
//         if(!id){
//             return res.status(400).send("this is not valid field");
//         }
//         const DsaProblem =  await Problem.findById(id);
//         if(!DsaProblem)
//         {
//            return res.status(404).send("ID is not persent in server");
//         }
//         for(const {language,completeCode} of referenceSolution ){

//         const languageId=getLanguageById(language);

//         const submissions=visibleTestCases.map((testcase)=>({
//             language_id:languageId,
//             source_code:completeCode,
//             stdin:testcase.input,
//             expected_output:testcase.output
//         }))

//         const submitResult = await submitBatch(submissions);
        
//         const tokens=submitResult.map((value)=>{
//             return value.token;
//         })

//         const tokenresult = await submittoken(tokens);
//         console.log("tokenresult:",tokenresult);
//         for(const val of tokenresult){
//             if(val.status.id !==3){
//                return res.status(400).send("error occured");
//             }
//         }
//       }
//       console.log("trying to update");
//       const updatedproblem=await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
//       console.log("problem updated");
//       res.status(201).send("Problem updated Successfully");
//     }
//     catch(err){
//         res.status(400).send("error" + err);
//     }
// }

const deleteProblem = async (req,res)=>{
    const {id}=req.params;
    console.log("heelo",id)
    try{
        if(!id){
            return res.status(400).send("invalid field");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
        return res.status(404).send("Problem is Missing");


        res.status(200).send("Successfully Deleted");
    }
    catch(err){
        res.status(400).send(err);
    }
}

const getProblemById = async (req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id);

   if(!getProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async (req,res)=>{
 
  try{
     
    const getProblem = await Problem.find({});
    
   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");

   
   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllsubmitproblem= async(req,res)=>{
    try{
        const userid = req.result._id;
        const user = await User.findById(userid).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        })

        res.send(user.problemSolved);
    }
    catch(err){
        res.send(err);
    }
}


module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem ,getAllsubmitproblem};