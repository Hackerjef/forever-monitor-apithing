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
  var timediff = require("timediff");
  let date = require("date-and-time");
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
    let now = new Date();
    cache.put("state", "on");
    cache.put("botstartTime", date.format(now, "YYYY-MM-DD HH:mm:ss"));
    cache.put("botstopTime", "null");
    break;
  }
  case "stop": {
    let now = new Date();
    cache.put("botstopTime", date.format(now, "YYYY-MM-DD HH:mm:ss"));
    cache.put("state", "off");
    break;
  }
  case "data": {
    var stoptime = function (botstoptime) {
      if (botstoptime == "null") return "Bot currently Running, No Stop time.";
      return botstoptime;
    };
    var uptime = function(start, stoptime) {
      let now = new Date();
      if (stoptime == "Bot currently Running, No Stop time.") stoptime = date.format(now, "YYYY-MM-DD HH:mm:ss");
      return timediff(start, stoptime, "YDHms");
    };
    return {
      "Status": cache.get("state"),
      "Start_time": cache.get("botstartTime"),
      "Stop_time": stoptime(cache.get("botstopTime")),
      "uptime": uptime(cache.get("botstartTime"), stoptime(cache.get("botstopTime")))
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
  console.log(childmemory(child, "data"));
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