export const getJudge0languageId = (language) => {
    const languageMap = {
        "C": 50,
        "C++": 54,
        "Java": 62,
        "Python": 71,
        "JavaScript": 63,
        "Ruby": 72,
        "Go": 60,
        "Swift": 83,
        "Kotlin": 78,
    };
    return languageMap[language.toUppercase()] || null;
}

export const submitbatchToJudge0 = async (submissions) => {
        const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base_64_encoded=false`,{
            submissions,
        });


        console.log("Subbmision Results from Judge0", data);
        return data;
}

// Sleep utility

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// creating the polling mechanism
export const pollBatchResultsFromJudge0 = async (tokens) => {
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base_64_encoded:false,
            } 
        });
        const results = data.submissions;
        const isAllDone = results.every((result)=>
            result.ststus.id  !==1 && result.status.is!== 2)
        if(isAllDone){
            return results;
        }
      await sleep(1000) // waiting for 2 seconds before next poll
    }

}
