
const pc=require('./processCodeBlocks');

let currentIndex=0
function processString(string) {


  const blocks=pc(string);

  function processNextCodeBlock(blocks) {
    if (currentIndex < blocks.length) {
      const codeBlock = blocks[currentIndex].replace(/```/g, '');
      console.log('Code block found:');
      console.log(codeBlock);
      currentIndex++;
      processNextCodeBlock(blocks);
    } else {
      console.log('No more code blocks found.');
    }
  }

  processNextCodeBlock(blocks);
}
module.exports=processString;
