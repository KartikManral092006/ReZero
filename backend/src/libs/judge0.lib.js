import axios from "axios";

export const getJudge0languageId = (language) => {
  const languageMap = {
        python: 71,
        cpp: 54,
        javascript: 63,
        java: 62,
    };
    return languageMap[language.toLowerCase()] || null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log(process.env.RAPIDAPI_KEY);
const JUDGE0_CONFIG = {
  baseURL: 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Your RapidAPI key
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};



export const submitBatchToJudge0 = async (submissions) => {
     const { data } = await axios.post(
            `${JUDGE0_CONFIG.baseURL}/submissions/batch?base64_encoded=false`,
            { submissions },
            { headers: JUDGE0_CONFIG.headers }
        );

    console.log("Submission Results from Judge0", data);
    return data;
};


export const pollBatchResultsFromJudge0 = async (tokens) => {
    const url = `${JUDGE0_CONFIG.baseURL}/submissions/batch`;

    while (true) {
        const { data } = await axios.get(url, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            },
            headers: JUDGE0_CONFIG.headers
        });

        const results = data.submissions;
        const isAllDone = results.every(
            (result) => result.status.id !== 1 && result.status.id !== 2
        );

        if (isAllDone) return results;

        await sleep(1000);
    }
};


// Utility Function  to get language name from language ID
export function getLanguageName(LanguageId)
{
    const Language_Name = {
        71: "Python",
        54: "C++",
        63: "JavaScript",
        62: "Java",
    };
    return Language_Name[LanguageId] || "Unknown Language";
}
