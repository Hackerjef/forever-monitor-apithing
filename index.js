var forever = require("forever-monitor");

//state what child is
var child = new (forever.Monitor)("second-js.js", {
  max: 1,
  watch: false,
  silent: true,
  cwd: "./bot"
});

//status function
const childmemory = function (child, method) {
  var cache = require("memory-cache");
  switch (method) {
  case "startup": {
    cache.put("state","off");
    cache.put("restartcount", "0");
    cache.put("botstartTime", "null");
    cache.put("botstopTime", "null");
    child.start();
    break;
  }
  case "start": {
    cache.put("state", "on");
    cache.put("botstartTime", Date.now());
    break;
  }
  case "stop": {
    cache.put("botstopTime", Date.now());
    cache.put("state", "off");
    break;
  }
  case "data": {
    var uptime = function(start, stop) {
      var secConverter = require("seconds-converter");
      return secConverter(`${(stop - start) / 1000}`, "sec");
    };
    return {
      "Status": cache.get("state"),
      "Start_Date": cache.get("botstartTime"),
      "Stop_Date": cache.get("botstopTime"),
      "CurrentUptime": uptime(cache.get("botstartTime"), cache.get("botstopTime"))
    };
  }
  case "status": {
    return cache.get("state");
  }
  default: {
    return "novaluesent";
  }
  }
};
//do if child exited
child.on("exit", function () {
  console.log("the program stoped");
  childmemory(child, "stop");
  console.log(childmemory("data"));
});

//do if child started
child.on("start", function () {
  console.log("the program start");
  childmemory(child, "start");
});

//do if child was restarted 
child.on("restart", function () {
  console.error("Forever restarting script for " + child.times + " time");
});

//do if child was closed (with code)
child.on("exit:code", function (code) {
  console.error("Forever detected script exited with code " + code);
});

child.on("stdout", function (data) {
  console.log("stdout: " + data);
});

child.on("stderr", function (data) {
  console.log("stderr: " + data);
});

child.on("error", function (err) {
  console.log("error: " + err);
});

childmemory(child, "startup");