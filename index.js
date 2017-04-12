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
    worker.disconnect(); // should disconnect to prevent "Error: IPC channel is already disconnected"
    worker.kill();
  }

  worker = cluster.fork({appPath:appPath, configJSONPath:configJSONPath});

  worker.process.on('message', (msg) => {
    if (msg.type==="CMD" && msg.value==="QUIT"){
      process.exit();
    }

    if (msg.type==="CMD" && msg.value==="RESTART"){
      forkNewWorker(appPath, configJSONPath);
    }

  });
}

module.exports = {
  launch
}