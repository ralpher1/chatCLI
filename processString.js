
const pc = require('./processCodeBlocks');

let currentIndex = 0
function processString(string) {

  //also maybe add a defaulted autosaved file for conversations? And let them say y (So default it starts anew) but that way someone can say y and we grab a default conversation file we are always building from etc etc want to 
  //clear that though eventuallly so also maybe make option to clear as well lke /clear m new convewrsation? I like that
  //gotta think do I want this to ask for a number for which block to save or numbers or what? gotta think about this inpute logic

  //next
  //add /clear and /cb and also some kind of default filename and way to autosave on quit so its easy to jump back in and pick up back and forth etc etc

  //ALSO ADD AN OPTION TO COPY TO CLIPBOARD OR TO CREATE FILE (Do it in that loop/logic right there after they choose the block) and then add to clipboard with node processses
  //use defaultSave.txt as my defaulty on ctrl and make them ctrl c maybe not to save?


  const blocks = pc(string);

  function processNextCodeBlock(blocks) {
    if (currentIndex < blocks.length) {
      const codeBlock = blocks[currentIndex].replace(/```/g, '');
      console.log(" ");
      console.log(" ");
      console.log(`# ${currentIndex + 1} Code block found:`);
      console.log("---------------------");
      console.log(" ");
      console.log(codeBlock);
      console.log("---------------------");
      console.log(`******END BLOCK #${(currentIndex + 1)} **`);
      console.log("---------------------");
      console.log(" ");
      console.log(" ");
      currentIndex++;
      processNextCodeBlock(blocks);
    } else {
      console.log('No (more) code blocks found.');
      //WHY would i do this and use a module level currentindex?
      console.log(`${(currentIndex)} Code Blocks Found`)
      currentIndex = 0;
    }
  }

  processNextCodeBlock(blocks);
  return blocks;
}
module.exports = processString;
