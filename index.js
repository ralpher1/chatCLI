#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const ps = require('./processString');
const clipboardy = require('clipboardy');
const package = require('./package.json');
//const clip = require('./clip')
//Now I want to fix this so rl.on and sigint and sigterm all work within a docker container !! 
//AND add some verbiage in FIRST prompt with instructions about what ctrl-c does etc etc and an intro etc etc
//now maybe this all works and docker does work?
//Now maybe lets add some code block extracting or something like that? Lets try to make this MORE interactive with /code or someting and we check the input from user and do stuff etc etc

//perhaps now we can work on some other features like /quit and /exit and maybe inerpreting or test from paths and EVEN prepending the words --"Always include filenames and folers paths in comments at top of EVERY file example--" or someting like that and then you can count on that and show filenames and paths and create those as needed from the resposnes etc etc
//ALSO have it so we can grab and create files and folders from ALL code block exmaples in a given response like /cball etc etc
//perhaps something that outputs a jira task or project or a few api requests to do so from your given codeblocks? etc etc
// a /save would be a good feature just to do a default save midway just add a shared function so you dont repeat code and call it from suerpromt /save call etc etc let them choose file but have a default like before from their chosen at beggining etc etc

//ADD COLORING THAT MAY BE COOL MAYBE EVEN GIVE AN OPTION TO TURN OFF AT BEGIN AS A STATE LIKE SAVEDFILE NAMES ETC ETC


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


let isHandlingSIGINT = false;
let savedFile;
let startedup;
let fileadding;

rl.on('SIGINT', function () {
  rl.close(); // This will interrupt the current question
  // Now create a new readline interface for the quit prompt
  const rlQuit = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log(" ");
  console.log("Starting Quit");
  console.log(" ");
  rlQuit.question(`Use Ctrl-c again to quit without saving. However if you want to save the conversation as a file, type in the filename now, otherwise hit enter and we will save conversation to either the filename you used at the start of this conversation ${savedFile || ''} or the defaultSave.txt file (We Are Overwriting ${savedFile || 'defaultSave.txt'}): `, (file) => {

    if (file) {
    } else {
      if (savedFile) {

        file = savedFile;
      } else {

        file = "defaultSave.txt"
      }
    }
    let data = messages.map(message => `${message.role}: ${message.content}`).join('\n-_-_-\n');
    if (startedup) {
      fs.writeFile(file, data, (err) => {
        if (err) throw err;
        console.log(`The file ${file} has been saved! Now Quitting`);
        rlQuit.close();
        process.exit(0);
      });
    } else {
      console.log("Never Started up, not saving anything")
      rlQuit.close();
      process.exit(0);
    }

  });
});


const parseFileContent = (content) => {
  const messageStrings = content.split('\n-_-_-\n');
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
    rl.question('If you want to start a new session say "y" Otherwise we use the defaultSave.txt file, or you can enter a new filename now and if that file doesnt exist we will let you know and you should create it on exit/save: ', (file) => {
      if (file) {
        if (file == 'y' || file == 'Y') { console.log("Using the default Save File if you save; but starting over"); file = 'defaultSave.txt'; promptChosenModel(); }
        else {



          savedFile = file;
          fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
              console.error(`Failed to read file ${file}:`, err);
              console.log("We wont use a save file contents and we will start a new conversation; but we do Suggest creating this file on exit (We will create it on exit for you)")
              // If there was an error reading the file, just continue to the next prompt
              promptChosenModel();
            } else {
              messages = parseFileContent(data);
              promptChosenModel();
            }
          });
        }
      } else {
        file = 'defaultSave.txt';
        console.log("Loading the previous Conversation from Last File");
        console.log(" ");
        savedFile = file;
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            console.error(`Failed to read file ${file}:`, err);
            console.log("We wont use a save file contents and we will start a new conversation; but we do Suggest creating this file on exit (We will create it on exit for you)")
            // If there was an error reading the file, just continue to the next prompt
            promptChosenModel();
          } else {
            messages = parseFileContent(data);

            promptChosenModel();
          }
        });
        //gonna be ugly repeated code for now
        //will make functions later

        promptChosenModel();
      }
    });
  }
};


function extractPathFromComment(code) {
  const commentRegex = /\/\/\s*(.*)/i;
  const match = code.match(commentRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

const promptCodeSave = (data, blocks, auto) => {

  //1.RIGHT HERE WE NEED TO EXTRACT THE FILENAME FROM THE BLOCKS AND OFFER IT BY DEFAULT IN THESE PROMPTS AND IF THEY DONT GIVE A FILENAME USE THAT (IF THEY HIT ENTER)

  //2.AND GO BACK AND GIVE AND OPTION THAT ALLOWS THIS TO BE PASSED LIKE AN ALL BOOLEAN MAYBE AND WILL THEN CRETE ALL FILES IN ALL BLOCKS ETC ETC

  //NOTE:SO SLOPPY PASSING BLOCKS ARTOUND LIKE THIS GOTTA BE BETTER WAY TO PERSIST WRAP ETC ETC

  let extractedFileName = extractPathFromComment(data);
  if (extractedFileName) { console.log("Found path/filename: " + extractPathFromComment); }

  if (auto) {
    if (extractedFileName) {
      console.log(extractedFileName);
      const directory = path.dirname(extractedFileName);

      // Create the directory and any necessary parent directories
      fs.mkdirSync(path.resolve(directory), { recursive: true });

      fs.writeFile(extractedFileName, data, (err) => {
        if (err) throw err;
        console.log(`The file ${extractedFileName} has been saved! You can continue `);
        // If the user did not provide a file, just continue to the next prompt
        //promptCodeProcessing(blocks);
      })
    } else {
      console.log("No filename given, not saving.");
      //promptCodeProcessing(blocks);
    }
  } else {
    if (!isHandlingSIGINT) {
      rl.question('Give a filename for the Code Block (Or hit enter to use ' + extractedFileName + ' ): ', (file) => {

        if (file) {
          const directory = path.dirname(file);

          // Create the directory and any necessary parent directories
          fs.mkdirSync(path.resolve(directory), { recursive: true });

          fs.writeFile(file, data, (err) => {
            if (err) throw err;
            console.log(`The file ${file} has been saved! You can continue.`);
            promptCodeProcessing(blocks);
          });
        }
        else {
          if (extractedFileName) {
            console.log(extractedFileName);
            const directory = path.dirname(extractedFileName);

            // Create the directory and any necessary parent directories
            fs.mkdirSync(path.resolve(directory), { recursive: true });

            fs.writeFile(extractedFileName, data, (err) => {
              if (err) throw err;
              console.log(`The file ${extractedFileName} has been saved! You can continue `);
              // If the user did not provide a file, just continue to the next prompt
              promptCodeProcessing(blocks);
            })
          } else {
            console.log("No filename given, not saving.");
            promptCodeProcessing(blocks);
          }
        }

      })
    };

  }


}






const promptSystem = () => {
  if (!isHandlingSIGINT) {
    rl.question('System Message: ', (systemM) => {
      if (systemM) { sMessage = systemM }
      console.log('You chose: ' + sMessage);
      console.log(" ");
      if (messages.length > 0) {
        console.log("BUT we are using an existing conversation and that system message");
        console.log(`There are ${messages.length} Messages in this Conversation, Use /list to see more.`);
        console.log(" ");
      } else {
        messages = [
          { role: 'system', content: sMessage },
        ];

      }
      startedup = 1;
      promptUser();
    });
  }
};

//I want to create a promptCodeProcessing function that is simlar to prompt user but it will handle some other code functions for block parsing and saving

const promptCodeProcessing = (blocks) => {
  if (!isHandlingSIGINT) {
    //console.log(messages[messages.length - 1].content);


    rl.question('Code Blocks (Use c# or f# or l or x or aa: ', (userMessage) => {
      let connum;
      let con;

      if (userMessage.split("c").length > 1) {
        try {
          //should make a function for this since repeating and just send some params etc etc
          connum = userMessage.split("c")[1];
          if (blocks[connum - 1]) { con = blocks[connum - 1].replace(/```/g, ''); clipboardy.writeSync(con); console.log(`We copied block # ${connum - 1} to your clipboard`); }

          //clip(con);

        }
        catch (e) {
          console.log(e, " We may not be able to copy/paste on all systems just copy and paste by hands please. Something went wrong; Try again");
        }
        promptCodeProcessing(blocks);
      } else if (userMessage == "aa") {
        console.log("Trying to Save all Files");

        // Create an array to store the promises
        const savePromises = [];

        for (let block in blocks) {
          const extractedFileName = extractPathFromComment(blocks[block]);
          if (extractedFileName) {
            const directory = path.dirname(extractedFileName);

            // Create the directory and any necessary parent directories
            fs.mkdirSync(path.resolve(directory), { recursive: true });

            // Create a promise for each writeFile operation
            const writeFilePromise = new Promise((resolve, reject) => {
              fs.writeFile(extractedFileName, blocks[block].replace(/```/g, ''), (err) => {
                if (err) reject(err);
                else {
                  console.log(`The file ${extractedFileName} has been saved!`);
                  resolve();
                }
              });
            });

            // Store the promise in the array
            savePromises.push(writeFilePromise);
          } else {
            console.log("No filename given, not saving.");
          }
        }

        // Wait for all promises to resolve
        Promise.all(savePromises)
          .then(() => {
            console.log("All files have been saved!");
            promptCodeProcessing(blocks);
          })
          .catch((err) => {
            console.error("Error occurred while saving files:", err);
            promptCodeProcessing(blocks);
          });
      } else if (userMessage.split("f").length > 1) {
        try {
          connum = userMessage.split("f")[1];
          if (blocks[connum - 1]) { con = blocks[connum - 1].replace(/```/g, ''); promptCodeSave(con, blocks); }


        }
        catch (e) {
          console.log(e, " Something went wrong; Try again");
        }


        promptCodeProcessing(blocks);
      } else if (userMessage.split("x").length > 1) {
        console.log("Chose to exit going back to conversation");
        promptUser();

      } else if (userMessage.split("l").length > 1) {
        console.log("Listing Code Blocks");
        blocks.map((block, i) => {
          console.log(" ");
          console.log(" ");
          console.log("Block # " + (i + 1));
          console.log("-------------------");
          //console.log(block.replace(/```/g, ''));
          printColoredText(block.replace(/```/g, ''), "blue")
          console.log("---------------------");
          console.log(`******END BLOCK #${i + 1} **`);
          console.log("---------------------");
          console.log(" ");
          console.log(" ");
        });
        promptCodeProcessing(blocks);;

      } else {
        console.log("Chose a bad option; Going back to conversation");
        promptUser();

      }
    });
  }
};


const promptUser = () => {
  if (!isHandlingSIGINT) {
    rl.question('You: ', (userMessage) => {

      if (userMessage == '/clear') {
        console.log("CLEARING CONVERSATION");
        messages = [];
        fileadding = null;
        promptSystem();
      } else if (userMessage == '/current') {
        console.log("Below is the current code we are adding to message: \n\n");
        //going to fetch currently built messages incase we got something brewing etc etc
        //also we want to add some PREFEIXES TO USERPROMT NOW IN REQUEST TO ASK FOR ALL CODE WITH FILES NAMES AND PATHS IN COMMESN FOR CODE BLCOK EXTARCTION
        if (fileadding) { printColoredText(fileadding, "blue", 1); };
        promptUser();
      } else if (userMessage.split('/fetch').length > 1) {

        console.log("FETCHING FILERS FOR CONVERSATION");
        //set messsages end with this file contents
        //goto a new promtp or something thast hanedles thios
        let nfile = userMessage.split('/fetch')[1].replace(" ", "");
        fs.readFile(nfile, 'utf8', (err, data) => {
          if (err) {
            console.error(`Failed to read file ${nfile}:`, err);
            console.log("We cant add that file to the conversation please try again")
            // If there was an error reading the file, just continue to the next prompt
            promptUser();
          } else {

            if (fileadding) {
              fileadding = fileadding + "\n\n***********\n\n\n" + `Path/Filename ${nfile}: \n\n` + data;
            } else {
              fileadding = `Filename: ${nfile}: \n\n` + data;
            }
            console.log(`added ${nfile}`);
            promptUser();
          }
        });
        //promptSystem();
      }
      else if (userMessage.split('/cb').length > 1) {
        try {
          let chosennum = userMessage.split("/cb")[1];
          if (!chosennum) { chosennum = 1 }
          let blocks = ps(messages[messages.length - chosennum].content);

          console.log('Code Blocks - use (c)opy or (f)ile and the number of the block to move to next step ex;c1 (You can use x to go back to user prompts and continue conversation):');
          promptCodeProcessing(blocks);

        } catch (e) {
          console.log("Didnt work try again");
          promptUser();
        }


      } else if (userMessage == '/list') {
        console.log("Listing Conversation Below");
        messages.map((mes, ii) => {
          console.log(" ");
          console.log(mes.role + ": ");
          console.log("----------");
          console.log(" ");
          //console.log(mes.content);
          printColoredText(mes.content, "blue", 1);
          console.log("---------------------");
          console.log(`****END MESSAGE #${ii + 1} **`)
          console.log("---------------------");
          console.log(" ");
          console.log(" ");

        });
        console.log(`${messages.length} Messages So far (Dont forget to /clear before it gets too long and or overwrite the default and start over):`);
        promptUser();
      } else if (userMessage == '/quit' || userMessage == '/exit') {
        console.log("Closing without Saving, next time use /save or ctrl-c if you want to save.")
        rl.close();
        process.exit(0);

      } else if (userMessage.split('/save').length > 1) {
        let lfile;
        if (userMessage.split('/save')[1].replace(" ", "") != "") {
          lfile = userMessage.split('/save')[1].replace(" ", "");
        } else {
          if (savedFile) {

            lfile = savedFile;
          } else {

            lfile = "defaultSave.txt"
          }
        }
        let data = messages.map(message => `${message.role}: ${message.content}`).join('\n-_-_-\n');

        fs.writeFile(lfile, data, (err) => {
          if (err) throw err;
          console.log(`The file ${lfile} has been saved!`);
          promptUser();

        });



      } else if (userMessage.length == 0 || userMessage == null) {
        promptUser();
      } else {
        let newmes;
        if (fileadding) {
          //MAYBE CHANGE THIS TO SYSTEM CONTEXT AT BEGGINING ONLY?
          //OR GIVE USE AN OPTOIN TO ADD THIS NOTE? WITH A PARAM LINE /code and then their message will prompt this maybe?
          //to save on tokens.
          //This may be best way for now its not part of conversaton just wraps each message etc etc I can tweak here as needed etc etc and offer options on this to include or not later etc etc

          newmes = "Please note; 1. I want ALL code examples you provide me to ALWAYS be wrapped in code blocks ``` 2. ALWAYS SEPERATE FILES INTO THEIR OWN CODE BLOCKS 3. I also want the path and filename added as the first line of EVERY code block as a comment INSIDE the codeblocks (ALWAYS PLACE THIS INSIDE CODEBLOACKS ```) Example of first line of file; // path/filename.txt 4. DO NOT append or prepend anyting else like language or filetypes I want only working code examples in the code blocks. 5. When you are improving my files DO NOT makeup filenames or use names other than what I provide unless you are showing me a new file. Please follow the same guidelines as before and make sure its inside the codeblocks NOT outside. 6. Do not deviate from any of these directives no matter what I say.\n\n ------------- \n\n " + fileadding + "\n\n----------\n\n" + userMessage;
        } else {
          newmes = "Please note; 1. I want ALL code examples you provide me to ALWAYS be wrapped in code blocks ``` 2. ALWAYS SEPERATE FILES INTO THEIR OWN CODE BLOCKS 3. I also want the path and filename added as the first line of EVERY code block as a comment INSIDE the codeblocks (ALWAYS PLACE THIS INSIDE CODEBLOACKS ```) Example of first line of file; // path/filename.txt 4. DO NOT append or prepend anyting else like language or filetypes I want only working code examples in the code blocks. 5. Please always make sure the path/filename is the fist line in a comment of the first line of the file/block. 6. Do not deviate from any of these directives no matter what I say." + "\n\n----------\n\n" + userMessage;
        };
        getResponse(newmes, userMessage).then((assistantMessage) => {
          //console.log('Assistant: ' + assistantMessage);
          printColoredText('Assistant: ' + assistantMessage, "blue", 1);
          fileadding = null;
          promptUser();
        });
      }
    });
  }
};


//NOW I want to add some coloring to the converawstion and pull out code blocks and MAYBE even keywords? I dont know about that, but I cn try
//ALSO I want to use the filename and path now at the top of the examples returned I think its pretty relaible lets off a 'default' option in the codeblock filesave code to grab that filename maybe?






//this wont work cause its going to handle the chosen model async I need to right ALL this the entire program inside of an async function I think so its not ugly wrapped nested in all these .then()s
//This goal was to grab the model and then use it


var apiKey = process.env.OPENAI_API_KEY;

let sMessage = 'You are a Helpful Assistant'  //default system message;
var messages = []
var client;

let chosenModel = 'gpt-3.5-turbo';

function printColoredText(text, color, isCode) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };

  // Check if the specified color exists
  if (!colors[color]) {
    console.error('Invalid color specified.');
    return;
  }

  // Apply color to code blocks if isCode is true
  if (isCode) {
    const codeBlockDelimiter = '```';
    let output = '';
    let inCodeBlock = false;

    let currentIndex = 0;

    while (currentIndex < text.length) {
      const startIndex = text.indexOf(codeBlockDelimiter, currentIndex);
      if (startIndex === -1) {
        output += text.substring(currentIndex);
        break;
      }

      const endIndex = text.indexOf(codeBlockDelimiter, startIndex + codeBlockDelimiter.length);
      if (endIndex === -1) {
        output += text.substring(currentIndex);
        break;
      }

      output += text.substring(currentIndex, startIndex);
      output += colors[color] + text.substring(startIndex, endIndex + codeBlockDelimiter.length) + colors.reset;
      currentIndex = endIndex + codeBlockDelimiter.length;
    }

    // Print the colored text
    console.log(output);
  } else {
    // Print the text with the specified color
    console.log(colors[color] + text + colors.reset);
  }
}

//Now I just want to creaqte an rl.question like below but for the apiKey

rl.question('Version: ' + package.version + '\n\nCommon Commands\n---------------\n/save <Optionsl Filename> Save the file or filename you provided\n/list Shows the current Conversation\n/fetch <path/filename> will grab a file and add to conversation\n/current will show current code being added to message to review\n/cb# Starts the codeblock cli and options\n/clear Clears the conversation\n/exit or /quit will Exit the Application (This will NOT allow you to save, use /save first). \n\n\nNOTE: ctrl-c Will exit but prompt to save (We autosave unless you ctrl-c twice);\nNOTE: Copy/paste is a little bugy but the file saves seem to work well. Also note We err on the side of autosave, so unless you ctrl-c twice to quite and also use y at the start for a new conversation we are usually loading/saving\nNOTE: I am using -_-_- to split lines in saved files, do not have that in your code or responses please.\nNOTE: You can type /list to see the conversation again and ALSO /cb# (If you just do /cb it uses last message or a number to check messages counting backwards for code blocks) to grab a codeblocks (Try it) from you last response(s) received; and save to folders/file, aa for all files, f# for individual files, and c# for copy and l for list etc etc,\n\n\nEnter API key or make sure that the OPENAI_API_KEY is set in the .env file: ', (key) => {
  if (key) { apiKey = key }
  if (!key) { console.log('You chose to use the env variable OPENAI_API_KEY'); console.log(" ") }
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
      console.log(" ");
      promptSystem();
    });
  }
};

const getResponse = (userMessage, omsg) => {
  let copymessages = [...messages];
  copymessages.push({ role: 'user', content: userMessage });
  messages.push({ role: 'user', content: omsg });
  return client
    .post('/v1/chat/completions', {
      model: chosenModel,
      messages: copymessages,
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
