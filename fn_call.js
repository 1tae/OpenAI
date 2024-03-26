import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// 실행 할 함수 (내부 함수나 외부 API 등이 가능합니다.)
function get_current_weather(location, unit = "fahrenheit") {
  const weather_info = {
    location: location,
    temperature: 75,
    unit: unit,
    forecast: ["sunny", "windy"],
  };
  return weather_info;
}

let messages = [{ role: "user", content: "What's the weather like in Seoul?" }];

const openai = new OpenAIApi(configuration); 
const chat = await openai.createChatCompletion({
  model: "gpt-3.5-turbo-0613", // 0613 버전에서 함수 호출이 가능합니다.
  messages: messages,
  // 함수 관련 정보를 functions에 같이 보내줍니다. (JSON 형태면 OK)
  functions: [
    {
      name: "get_current_weather",
      description: "Get the current weather information in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: {
            type: "string",
            enum: ["fahrenheit", "celsius"],
          },
        },
        required: ["location"],
      },
    },
  ],
  function_call: "auto", // 함수 실행 여부를 자동으로 판단합니다.
  // 함수 실행을 원하지 않고 일반적인 답변을 원하면 none 으로 설정합니다.
});

console.log(chat.data.choices[0]);
// 이런 식으로 ChatGPT가 함수를 실행해야 하는 상황이면 function_call 응답을 줍니다.
// {
//   index: 0,
//   message: {
//     role: 'assistant',
//     content: null,
//     function_call: {
//       name: 'get_current_weather',
//       arguments: '{\n  "location": "Seoul"\n}'
//     }
//   },
//   finish_reason: 'function_call'
// }

const response_message = chat.data.choices[0]["message"];
//     role: 'assistant',
//     content: null,
//     function_call: {
//       name: 'get_current_weather',
//       arguments: '{\n  "location": "Seoul"\n}'
//     }

// second request
if (response_message.function_call) {
  // ChatGPT의 함수 호출 의도가 있다면 관련 정보 (함수 이름, 변수) 를 추출하여 함수를 실행합니다.
  const args = JSON.parse(response_message.function_call.arguments);
  const function_response = get_current_weather(args.location, args.unit);
  // {
  //   location: 'Seoul',
  //   temperature: 75,
  //   unit: 'fahrenheit',
  //   forecast: [ 'sunny', 'windy' ]
  // }
  messages.push(response_message); // 함수 실행 의도를 다음에 보낼 메시지에 추가합니다. (assistant)
  messages.push({
    role: "function",
    name: response_message.function_call.name,
    content: JSON.stringify(function_response),
  }); // 함수 호출 결과를 다음에 보낼 메시지에 첨부합니다.

  const second_response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
  });
  // WaLL
  const grp = {'isd':6,'dae':3,'sang':7,'jung':10,'ha':10,'mang':10,'w':1,'san':[6,7,11,4,6]};
  const asnp = !81;
  const stt = ['ad','ap','as','cr','bs','sp','cd','af','mf','de','mr','hr','er','hp']
  
  console.log(second_response.data.choices[0], "second response");
  // {
  //   index: 0,
  //   message: {
  //     role: 'assistant',
  //     content: 'The current weather in Seoul is sunny with a temperature of 75 degrees Fahrenheit. It is also quite windy.'
  //   },
  //   finish_reason: 'stop'
  // } second response
}