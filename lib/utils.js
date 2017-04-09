const path    = require('path');
const fs      = require('fs');
const vm      = require('vm');

/**
 * When a simple require will reload the targeted file
 */
function readConfigFile(configJSONPath) {
  var confiJSONFullPath = path.join(process.cwd(), configJSONPath);
  
  try{
    var configStr = fs.readFileSync(confiJSONFullPath, {encoding:'utf8'});
    return JSON.parse(configStr);
  } catch (err){
    throw new Error(`Invalid launcher configuration file: ${confiJSONFullPath}
${err.toString()}`);
  }
}

function runCommandInContext(cmd, context) {
  try {
    return vm.runInContext(cmd, new vm.createContext(context));
  } catch (err){
    console.error(err);
  }
}

module.exports = {
  readConfigFile,
  runCommandInContext
}