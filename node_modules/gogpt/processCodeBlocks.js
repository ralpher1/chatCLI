
function processCodeBlocks(string) {
  const codeBlocks = string.match(/```([\s\S]*?)```/g) || [];
  let currentIndex = 0;
  //NONE OF THE FOLLOWING IS USED HERE YET ! THIS JUST OUTPUTS THE RESULTS OF STRING.MATCH FOR NOW


  return codeBlocks;
  //return codeBlocks[0].replace(/```/g,'');
}
module.exports = processCodeBlocks;
