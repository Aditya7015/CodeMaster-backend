const axios = require('axios');

const getLanguageById = (lang)=>{

   
    if(lang == 'cpp'){
      lang = "c++";
    }
    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }


    return language[lang.toLowerCase()];
}

// const submitBatch = async ( submissions)=>{
  
//   console.log(submissions);
// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.RAPID_API_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error + "submit error");
// 	}
// }

// return fetchData();
// }

const submitBatch = async (submissions) => {

  try {
    const response = await axios({
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
      params: {
        base64_encoded: false
      },
      headers: {
        "x-rapidapi-key":process.env.RAPID_API_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      data: {
        submissions
      }
    });

    return response.data;

  } catch (error) {
    console.error("Submit Error:", error.response?.data || error.message);
    throw error;
  }
};

async function timedley(time){
    setTimeout(()=>{ 
      return 1 ;
    },time);
}

// const submittoken = async (tokens) => {
//   const options = {
//     method: 'GET',
//     url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//     params: {
//       tokens: Array.isArray(tokens) ? tokens.join(",") : tokens,   // good
//       base64_encoded: 'true',     // ✅ FIX
//       fields: '*'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.RAPID_API_KEY, // ⚠️ don't hardcode
//       'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//     }
//   };

//   try {
//     const res = await axios.request(options);

//     // safety check (prevents your crash)
//     if (!res.data || !res.data.submissions) {
//       throw new Error("Invalid response from Judge0");
//     }

//     // decode base64 outputs
//     const decoded = res.data.submissions.map(sub => ({
//       ...sub,
//       stdout: sub.stdout
//         ? Buffer.from(sub.stdout, "base64").toString("utf-8")
//         : null,
//       stderr: sub.stderr
//         ? Buffer.from(sub.stderr, "base64").toString("utf-8")
//         : null,
//       compile_output: sub.compile_output
//         ? Buffer.from(sub.compile_output, "base64").toString("utf-8")
//         : null
//     }));

//     return decoded;

//   } catch (err) {
//     console.error("Judge0 error:", err.response?.data || err.message);
//     throw err;
//   }
// }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submittoken = async (tokens) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: Array.isArray(tokens) ? tokens.join(",") : tokens,
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  try {
    while (true) {
      const res = await axios.request(options);

      if (!res.data || !res.data.submissions) {
        throw new Error("Invalid response from Judge0");
      }

      const results = res.data.submissions;

      // ✅ check if all finished
      const allDone = results.every(
        (r) => r.status.id !== 1 && r.status.id !== 2
      );

      if (allDone) {
        // ✅ decode here (backend handles decoding)
        const decoded = results.map(sub => ({
          ...sub,
          stdout: sub.stdout
            ? Buffer.from(sub.stdout, "base64").toString("utf-8")
            : null,
          stderr: sub.stderr
            ? Buffer.from(sub.stderr, "base64").toString("utf-8")
            : null,
          compile_output: sub.compile_output
            ? Buffer.from(sub.compile_output, "base64").toString("utf-8")
            : null
        }));

        return decoded;
      }

      // ⏳ wait before retry
      await delay(1000);
    }

  } catch (err) {
    console.error("Judge0 error:", err.response?.data || err.message);
    throw err;
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}

  while(true){//if value of statuseId less then 3 that means it has not ran
    const resultdata=await fetchData();
      const IsResultObtained =  resultdata.submissions.every((r)=>r.status_id>2);

    if(IsResultObtained)
    return resultdata.submissions;

    await timedley(1000);//we want to run after one sec
  }
}

module.exports = {getLanguageById,submitBatch,submittoken};