const util = require('util');
const vm   = require('vm');
const repl = require('repl');

/**
 * Can I haz colorz?
 * Does objects pretty printing
 */
function replWriter(output) {
  if (output){
    if (output.constructor && output.constructor.name !== "String"){
      return util.inspect(output, {colors:true}) + '\n';
    }
  }

  return output + '\n';
}

function replEvaluatorBuilder(app) {
  return function replEvaluator(cmd, context, filename, callback) {
    if (cmd==='\n') return; // Ignore empty commands

    let result;

    try {
      result = vm.runInContext(cmd, new vm.createContext(app));
    } catch (err) {
      if (isRecoverableError(err)) {
        return callback(new repl.Recoverable(err));
      } else {
        return callback(null, err);
      }
    }

    if (result instanceof Promise) {
      return result
      .then((res) => callback(null, res))
      .catch((res) => callback(null, res));
    }

    if (result instanceof Function) {
      return callback(null, result.toString());
    } 

    return callback(null, result);
  }
}

function isRecoverableError(error) {
  if (error.name === 'SyntaxError') {
    return /^(Unexpected end of input|Unexpected token)/.test(error.message);
  }
  return false;
}

module.exports = {
  replWriter,
  replEvaluatorBuilder,
}