require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const audio_file = fs.createReadStream("C:\Users\tashu\gpt_test_project\test.m4a");
const form = new FormData();
form.append('model', 'whisper-1');
form.append('file', audio_file, { filename: "test.m4a" });
form.append('response_format', 'text');

function voiceTest(){ 
  return fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...form.getHeaders()
    },
    body: form
  })
  .then((res) => res.json())
  .then((data) => { console.log(data) })
  .catch((err) => {console.error(err); voiceTest()});
}

//voiceTest();

console.log('아에이오우 안녕하세요');