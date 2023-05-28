#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const fs = require('fs');

//Now I want to fix this so rl.on and sigint and sigterm all work within a docker container !! 
//AND add some verbiage in FIRST prompt with instructions about what ctrl-c does etc etc and an intro etc etc
//now maybe this all works and docker does work?
//Now maybe lets add some code block extracting or something like that? Lets try to make this MORE interactive with /code or someting and we check the input from user and do stuff etc etc


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


let isHandlingSIGINT = false;


rl.on('SIGINT', function () {
  rl.close(); // This will interrupt the current question
  // Now create a new readline interface for the quit prompt
  const rlQuit = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("Starting Quit");
  rlQuit.question('If you want to save the conversation as a file, type in the filename now otherwise hit enter: ', (file) => {
    if (file) {
      let data = messages.map(message => `${message.role}: ${message.content}`).join('\n---\n');

      fs.writeFile(file, data, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
        rlQuit.close();
        process.exit(0);
      });
    } else {
      console.log("Quitting");
      rlQuit.close();
      process.exit(0);
    }
  });
});


const parseFileContent = (content) => {
  const messageStrings = content.split('\n---\n');
  return messageStrings.map(messageString => {
    let [role, ...contentParts] = messageString.split(/:(.+)/);
    role = role.trim().toLowerCase();

    // Ensure the role is one of the valid values
    if (!['system', 'user', 'assistant'].includes(role)) {
      throw new Error(`Invalid role '${role}' in message '${messageString}'`);
    }

    const content = contentParts.join(':').trim(); // join the content parts to allow for colons in the message content
    return { role, content };
  });
};

const promptSessionFile = () => {
  if (!isHandlingSIGINT) {
    rl.question('Do you want to use an existing file/session? If yes, enter the filename: ', (file) => {
      if (file) {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            console.error(`Failed to read file ${file}:`, err);
            // If there was an error reading the file, just continue to the next prompt
            promptChosenModel();
          } else {
            messages = parseFileContent(data);
            promptChosenModel();
          }
        });
      } else {
        // If the user did not provide a file, just continue to the next prompt
        promptChosenModel();
      }
    });
  }
};






const promptSystem = () => {
  if (!isHandlingSIGINT) {
    rl.question('System Message: ', (systemM) => {
      if (systemM) { sMessage = systemM }
      console.log('You chose: ' + sMessage);
      if (messages.length > 0) {
        console.log("BUT we are using an existing conversation and that system message")
      } else {
        messages = [
          { role: 'system', content: sMessage },
        ];

      }
      promptUser();
    });
  }
};

const promptUser = () => {
  if (!isHandlingSIGINT) {
    rl.question('You: ', (userMessage) => {
      getResponse(userMessage).then((assistantMessage) => {
        console.log('Assistant: ' + assistantMessage);
        promptUser();
      });
    });
  }
};



//this wont work cause its going to handle the chosen model async I need to right ALL this the entire program inside of an async function I think so its not ugly wrapped nested in all these .then()s
//This goal was to grab the model and then use it


var apiKey = process.env.OPENAI_API_KEY;

let sMessage = 'You are a Helpful Assistant'  //default system message;
var messages = []
var client;

let chosenModel = 'gpt-3.5-turbo';

//Now I just want to creaqte an rl.question like below but for the apiKey

rl.question('v1.07; Enter API key or make sure that the OPENAI_API_KEY is set in the .env file: ', (key) => {
  if (key) { apiKey = key }
  if (!key) { console.log('You chose to use the env variable OPENAI_API_KEY'); }
  client = axios.create({
    baseURL: 'https://api.openai.com',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
  });

  promptSessionFile();
})


const promptChosenModel = () => {
  if (!isHandlingSIGINT) {
    rl.question('Choose a model (gpt-3.5-turbo, gpt-3.5, gpt-3, davinci): ', (model) => {
      if (model) { chosenModel = model }
      console.log('You chose: ' + chosenModel);
      promptSystem();
    });
  }
};

const getResponse = (userMessage) => {
  messages.push({ role: 'user', content: userMessage });
  return client
    .post('/v1/chat/completions', {
      model: chosenModel,
      messages: messages,
    })
    .then((result) => {
      const assistantMessage = result.data.choices[0].message.content;
      messages.push({ role: 'assistant', content: assistantMessage });
      return assistantMessage;
    })
    .catch((err) => {
      console.error(err);
    });
};

//promptUser();
