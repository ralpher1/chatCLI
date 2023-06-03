
function processCodeBlocks(string) {
  const codeBlocks = string.match(/```([\s\S]*?)```/g) || [];
  let currentIndex = 0;

  function saveCodeBlock(codeBlock) {
    rl.question('Do you want to save this code block? (y/n): ', answer => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter the filename to save: ', filename => {
          fs.writeFile(filename, codeBlock, err => {
            if (err) {
              console.error('Error saving code block:', err);
            } else {
              console.log('Code block saved successfully!');
            }
            processNextCodeBlock();
          });
        });
      } else if (answer.toLowerCase() === 'n') {
        processNextCodeBlock();
      } else {
        console.log('Invalid input. Please enter "y" or "n".');
        saveCodeBlock(codeBlock);
      }
    });
  }

  function processNextCodeBlock() {
    if (currentIndex < codeBlocks.length) {
      const codeBlock = codeBlocks[currentIndex].replace(/```/g, '');
      console.log('Code block found:');
      console.log(codeBlock);
      currentIndex++;
      saveCodeBlock(codeBlock);
    } else {
      console.log('No more code blocks found.');
      rl.close();
    }
  }
return codeBlocks;
//return codeBlocks[0].replace(/```/g,'');
}
module.exports=processCodeBlocks;
