async function startChat()
{
    let message = $('#message').val();

    let messages = sessionStorage.getItem("bot-message");
    if (messages == null) {
      messages = [{ role: "system", content: "You are ChatGPT, a large language model trained by OpenAI." }];
    } else {
      messages = JSON.parse(messages);
    }
    messages.push({ role: "user", content: message });
  
    var es = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_OPEN_API_KEY",
          },
          method: "POST",
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            stream: true,
            stop: ["\n\n"],
          }),
        }
      );
  
      const reader = es.body?.pipeThrough(new TextDecoderStream()).getReader();
  
      while (true) {
        const res = await reader?.read();
        if (res?.done) {
          let text = $("#demo").text();
          messages.push({ role: "assistant", content: text });
          sessionStorage.setItem("bot-message",JSON.stringify(messages));
          break;
        }
        const jsonStrings = res?.value.match(/data: (.*)\n\n/g);

        const jsonData = jsonStrings.map((jsonString) => {
          const startIndex = jsonString.indexOf("{");
          const endIndex = jsonString.lastIndexOf("}") + 1;
          const json = jsonString.substring(startIndex, endIndex);
          let data;
          
          try{
            if(json){
              data = JSON.parse(json);
              if(data.choices[0].delta.finish_reason != 'stop')
              {
                let text = data.choices[0].delta.content;
                if(text){  
                  let i=0;
                  while (i < text.length) {
                    document.getElementById("demo").innerHTML += text.charAt(i);
                    i++;                    
                  }
                }
              }
            }
          }
          catch(ex){
            console.log('error: json');
            console.log(json);
          }
          return data;
        }
      );

    }
}