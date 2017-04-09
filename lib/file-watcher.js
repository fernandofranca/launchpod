var fs   = require('fs');
var path = require('path');
var EventEmitter = require('events');
var emitter = new EventEmitter();

var isWatching = false;
var watcher;
var throttleTimeout;
var throttlingTime = 3000;

function watch(_throttlingTime) {
  isWatching = true;

  throttlingTime = (_throttlingTime && _throttlingTime>50) ? _throttlingTime : throttlingTime;

  watcher = fs.watch(process.cwd(), {recursive:true}, (eventType, fileName) => {
    if (!fileName || !isWatching) return;
    throttleEmitEvent(fileName);
  });

  return emitter;
}

function stop() {
  isWatching = false;
  if (emitter) emitter.removeAllListeners('fileChanged');
  if (watcher) watcher.close();
}

function verifyModuleIsInUse(nameOrPath) {
  try {
    return !!require.cache[require.resolve(nameOrPath)];
  } catch(e) {}
  return false;
}

function throttleEmitEvent(fileName) {
  clearTimeout(throttleTimeout);

  throttleTimeout = setTimeout(() => {
    var filePath = path.join(process.cwd(), fileName);

    var isJsFile = path.extname(filePath) === '.js';
    var isModule = filePath.indexOf('node_modules') > -1;
    var isModuleInUse = verifyModuleIsInUse(path.resolve(fileName));

    if (isModule===false && isJsFile===true && isModuleInUse===true){
      emitter.emit('fileChanged', filePath);
    }
  }, throttlingTime);
}

module.exports = { watch, stop };