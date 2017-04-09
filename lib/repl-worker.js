const path    = require('path');
const fs      = require('fs');
const cluster = require('cluster');
const repl    = require('repl');
const net     = require('net');
const util    = require('util');
const vm      = require('vm');

const socketServer         = require('./repl-socket-server.js');
const replWriter           = require('./repl-utils.js').replWriter;
const replEvaluatorBuilder = require('./repl-utils.js').replEvaluatorBuilder;
const readConfigFile       = require('./utils.js').readConfigFile;
const runCommandInContext  = require('./utils.js').runCommandInContext;
var fileWatcher = require('./file-watcher.js');

var replServer;
var appContext;
var app;
var config;

var defaults = require('./defaults.js');


function launch() {
  if (!cluster.isWorker) return false;
  
  process.on('uncaughtException', uncaughtExceptionHandler);
  
  getConfig();

  // Should restart after file changes?
  if (config.watchFileChange) setupFileChangeWatcher(config);

  // Instantiate the app
  app = require(path.join(process.cwd(), process.env.appPath));

  welcomeUser(config);

  startReplServer(config, app);

  defineDefaultREPLCommands(replServer);
  
  socketServer.start(config, defineDefaultREPLCommands, getAppInstance);
}

function getConfig() {
  config = defaults;
  // Get configuration object, merge with defaults
  if (process.env.configJSONPath && process.env.configJSONPath!=='null'){
    var configFileObj = readConfigFile(process.env.configJSONPath);
    config = Object.assign(config, configFileObj);
  }
}

function setupFileChangeWatcher(_config) {
  fileWatcher
    .watch(_config.watcherThrottleTime)
    .on('fileChanged', (filePath) => {
      sendRestartMessage();
    });
}

function welcomeUser(_config) {
  console.log(_config.welcomeMessage);
}

function startReplServer(_config, _app) {
  replServer = repl.start({
    prompt: _config.promptSymbol, 
    eval: replEvaluatorBuilder(_app),
    writer: replWriter,
  });

  replServer.on('exit', () => {
    console.log("REPL Ended. \n");;
    process.send({type:"REPL", value:"ENDED"});
  });

  // assign context to the REPL
  replServer.context.app = _app;
}

function defineDefaultREPLCommands(replServer) {
  replServer.defineCommand('quitApp', {
    help:'Quit application',
    action: sendQuitMessage
  });
  replServer.defineCommand('qa',      {
    help:'Quit application (alias)',
    action: sendQuitMessage
  });
  replServer.defineCommand('restart', {
    help:'Restart application',
    action: sendRestartMessage
  });
  replServer.defineCommand('rs',      {
    help:'Restart application (alias)',
    action: sendRestartMessage
  });
  replServer.defineCommand('watcherOn',      {
    help:'Enable restart on file changes',
    action: watcherStart
  });
  replServer.defineCommand('watcherOff',      {
    help:'Disable restart on file changes',
    action: watcherStop
  });
  replServer.defineCommand('won',      {
    help:'Enable restart on file changes (alias)',
    action: watcherStart
  });
  replServer.defineCommand('wof',      {
    help:'Disable restart on file changes (alias)',
    action: watcherStop
  });
}

function sendQuitMessage() {
  beforeAppShutdown();
  socketServer.close();
  process.send({type:"CMD", value:"QUIT"});
}

function sendRestartMessage() {
  beforeAppShutdown();
  socketServer.close();
  process.send({type:"CMD", value:"RESTART"});
}

function watcherStart() {
  setupFileChangeWatcher(config);
  return console.log("File watcher is on");
}
function watcherStop() {
  fileWatcher.stop();
  return console.log("File watcher is off");
}

function beforeAppShutdown() {
  if (app && config && config.beforeShutdownCmd){
    runCommandInContext(config.beforeShutdownCmd, app);
  }
}

function uncaughtExceptionHandler(err) {
  if (config.beepOnUncaughtException===true){
    console.error('\u0007\u0007');
  }

  console.error("😱  Uncaught Exception !!!\n");
  console.error(err);

  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Type \'quit\' or <enter> to restart. ', (answer) => {
    rl.close();
    if (answer==='') return sendRestartMessage();
    if (answer.toLowerCase()==='quit') return sendQuitMessage();
  });
}

function getAppInstance() {
  return app;
}


module.exports = {
  launch
}