# LaunchPod

LaunchPod  is a lightweight and flexible Node.js module which aims to ease the development process. Think Nodemon + REPL.

<div align="center">
    <img width=240px src="https://github.com/fernandofranca/launchpod/raw/master/artwork/icon.svg">
</div>

## Instalation

`npm install launchpod`

and

`node launchpod your-app.js`

or

`node launchpod your-app your-config-file`

## Features
### REPL
- Type `this` and see which properties and methods are exposed at your app.
- Run/evaluate functions, promises and properties.
- Objects are pretty printed with Node's `util.inspect`.
- Execute a function returning a promise and receive the resolved value.
- Type a function name and see it's String representation.

### Remote REPL
- Send commands to your app from another application, terminal or script. Eg.: Restart you app from Sublime Text with a single shortcut.

### Uncaught Exception handling
- launchpod will ask if it  should quit or restart on Uncaught Exceptions.

### (Simple) file watching and restart
- launchpod can be set to restart your application if any .js file was created or modified.

### More
- No strings attached. No need to keep this module while in production.
- Lifecycle events - a `beforeShutdownCmd` function can be set to run before quitting or restarting the app.
- Lightweight, just native dependencies.


## Default commands
Type `.help` while in REPL to list available commands.


|.command| action|
|---|---|
| `.quitApp`     |Quit application |
| `.qa`          |Quit application (**alias**) |
|`.restart`      |Restart application|
|`.rs`           |Restart application (**alias**)|
|`.watcherOff`   |Disable restart on file changes|
|`.wof`          |Disable restart on file changes (**alias**)|
|`.watcherOn`    |Enable restart on file changes|
|`.won`         |Enable restart on file changes (**alias**)|


## Configuration file reference

A configuration can be specified as follows: `node launchpod your-app your-config-file`

Config files are simple JSON files.

| property| effect |
|---|---|
|`welcomeMessage` | String - Sets the welcome message displayed when an user connects on REPL. Eg.: "We have liftoff!" |
|`promptSymbol` | String - Sets a custom prompt symbol. Eg.: `"⚡️  "`. Default: `'_ '`  |
|`beepOnUncaughtException` | Bool - Enable terminal bell on Uncaught Exceptions. Default: `false` |
|`beforeShutdownCmd` | String - Sets a script to be evaluated before the app's shutdown. Eg.: `beforeShutdown(); bye();` |
|`watchFileChange` | Bool - Enables app restart on file changes. Default: `false` |
|`watcherThrottleTime` | Number - Delay of app restart in milliseconds |


## How to...

### Use REPL from another terminal instance
While in the app directory, use NetCat: `nc -U ./socket-ctl`

Type `.exit` to quit remote REPL.

### Restart with a script or from another app
`echo ".restart" | nc -U ./socket-ctl`

### Restart app from Sublime Text
- Create a new Build System with the following content:

```
{
  "shell_cmd": "echo \".restart\" | nc -U ./socket-ctl",
  "working_dir": "${project_path:${folder}}"
}

```

- Save the build file
- Set the build system with your new file
- `Command+B` or `Control+B` will trigger the build system, restarting your app. ;-)


### Load a script once
- Connect to the REPL: `nc -U ./socket-ctl`
- Type: `.load your-script`

### Scope, globals, etc...
The REPL scope is restricted to you app, there is no access to any of Node's globals.

If you wish any of this, expose it in your app's module.

#### Example
```
var app = {
  console,
  require,
  beforeShutdown: () => {
    console.log("beforeShutdown stuff is being done ...");
  },
}

module.exports = app;
```



### Restart on file changes
Set `true` for the key `watchFileChange` at your configuration file. Don't forget to use the config file:

```
node launchpod your-app your-config-file
```

## Credits
Icon designed by Freepik