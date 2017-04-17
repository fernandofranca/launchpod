const cluster  = require('cluster');
var replWorker = require('./lib/repl-worker.js');
var worker;

launch(process.argv[2] || null, process.argv[3] || null);

function launch(appPath, configJSONPath) {
  if (!appPath) {
    throw new Error(`Application path is invalid. Provided path: ${appPath}`);
    return;
  }

  if (cluster.isMaster) {
    forkNewWorker(appPath, configJSONPath);
  } else {
    replWorker.launch();
  }
}

function forkNewWorker(appPath, configJSONPath) {
  if (worker) {
    worker.process.removeAllListeners('message'); // remove worker process listeners to prevent "Error: IPC channel is already disconnected"

    // Waits for the exit event before forking a new worker
    worker.once('exit', (code, signal) => {
      _forkNewWorker(appPath, configJSONPath);
    });

    try{
      worker.disconnect();
      worker.kill();
    } catch(err){ console.log(err); }

    return;
  }

  _forkNewWorker(appPath, configJSONPath);
}

function _forkNewWorker(appPath, configJSONPath) {
  worker = cluster.fork({appPath:appPath, configJSONPath:configJSONPath});

  worker.process.on('message', (msg) => {
    if (msg.type==="CMD" && msg.value==="QUIT"){
      process.exit();
      return;
    }

    if (msg.type==="CMD" && msg.value==="RESTART"){
      forkNewWorker(appPath, configJSONPath);
      return;
    }
  });
}

module.exports = {
  launch
}