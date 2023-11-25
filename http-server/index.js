const http = require("http");
const fs = require("fs");

let homeContent = "";
let projectContent = "";
let RegistrationContent = "";

fs.readFile("home.html", (err, home) => {
  if (err) {
    throw err;
  }
  homeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) {
    throw err;
  }
  projectContent = project;
});
fs.readFile("registration.html", (err, registration) => {
  if (err) {
    throw err;
  }
  RegistrationContent =registration;
});
http
  .createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, { "Content-Type": "text/html" });
    switch (url) {
      case "/project":
        response.write(projectContent);
        response.end();
            break;
      case "/registration":
        response.write(RegistrationContent);
        response.end();
            break;  
      default:
        response.write(homeContent);
        response.end();
        break;
    }
  })
    .listen(3000, () => {
        console.log("app is listening");
  });