var app = {
  beforeShutdown: () => {
    console.log("beforeShutdown stuff is being done ...");
  },
  getAlert: (alertDescription) => {
    return "ALERT!!! " + alertDescription;
  },
  getArray: () => {
    return [1,2,3, new Date()];
  },
  getPromise: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("A promise was resolved!");
      }, 1000);
    });
  },
  foo: "bar-"+Date.now(),
  makeErr: (err) => {
    throw new Error('OMG!!!! ' + err);
  },
}

console.log("App is alive. \u0007");

module.exports = app;