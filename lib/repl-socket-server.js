const fs   = require('fs');
const repl = require('repl');
const path = require('path');
const net  = require('net');
const util = require('util');

const replWriter           = require('./repl-utils.js').replWriter;
const replEvaluatorBuilder = require('./repl-utils.js').replEvaluatorBuilder;

var socketServer;

/**
 * Starts an IPC socket server
 * Every new socket connection will be piped to a REPL
 */
function start(config, setDefaultREPLCommands, getAppInstance) {

  // Defines the IPC socket file path
  var socketAddr = path.join(process.cwd(), 'socket-ctl');

  // Deletes the file if already exists
  if (fs.existsSync(socketAddr)) fs.unlinkSync(socketAddr);

  // Create and start the socket server
  socketServer = net.createServer(function(socket) {

    if(config.replStartMessage) socket.write(config.replStartMessage+"\n");

    // Instantiates a new REPL for this socket
    var socketReplServer = repl.start({
      prompt: config.promptSymbol,
      eval: replEvaluatorBuilder(getAppInstance()),
      input: socket,
      output: socket,
      writer: replWriter,
      terminal: true
    })
    .on("exit", () => {
      socket.end();
    });

    socket.on("error", (err) => {
      console.error(err);
    });

    socketReplServer.context.app = getAppInstance();

    setDefaultREPLCommands(socketReplServer);
  });
  socketServer.listen(socketAddr);
}

function close() {
  if(socketServer) socketServer.close();
}

module.exports = {
  start,
  close
}