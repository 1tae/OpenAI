require('dotenv').config();

const model = 'ft:gpt-3.5-turbo-0125:ddat::91n2KmmZ';
console.log(`현재 사용중인 모델 : ${model}`);

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const messages = [
  {
    role: "system", 
    content :
      `
      대동그룹과 농업에 관련한 정보를 제공하는 대동AI입니다.
      `
    }
];

async function chat(question) {
  messages.push({ role: "user", content: question });

  var res = await fetch(
    "https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0,
        stream : true
      }),
    }
  );
  
  const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();
  let result = '';
  while(true){
    const res = await reader?.read();
    if(res?.done){
      console.log();
      messages.push({role:'assistant',content : result});
      break;
    }
    
    const jsonStrings = res?.value.match(/data: (.*)\n\n/g);
    if(jsonStrings == null) continue;
    
    const jsonData = jsonStrings.map((jsonString) => {
      const startIndex = jsonString.indexOf("{");
      const endIndex = jsonString.lastIndexOf("}") + 1;
      const json = jsonString.substring(startIndex, endIndex);
      let data;

      try {
        if(json){
          data = JSON.parse(json);
          if(data.choices[0].delta.finish_reason != 'stop'){
            let text = data.choices[0].delta.content;
            if(text){
              let i=0;
              while(i < text.length){
                process.stdout.write(text.charAt(i));
                result += text.charAt(i)
                i++;
              }
            }
          }
        }
      }catch(e){
        console.log(e);
        console.log(json);
      }
      return data;
    })
  }
}

console.log("💬 ChatGPT 터미널 챗앱 💬\n");
rl.prompt();
rl.on("line",(q) => {
  chat(q).then(() => {
    console.log(messages);
    rl.prompt();
  });
});
