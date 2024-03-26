require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function chat(question){
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const result = await model.generateContent(question);
  const response = await result.response;
  const text = response.text();
  console.log(`\n🤖\n ${text}\n`);
}

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("💬 Gemini 터미널 챗앱 💬\n");
rl.prompt();
rl.on("line",(q) => {
  chat(q).then(() => {
    rl.prompt();
  })
})