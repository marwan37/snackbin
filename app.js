const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./utils/config");

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");
const Request = require("./models/request");
const GithubPayload = require("./models/github-payload");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(error => console.log("error connecting to MongoDB:", error.message));

// Route to handle GitHub webhook payloads
app.post("/github-webhook", async (req, res) => {
  let githubPayloadInstance = new GithubPayload({ payload: req.body });

  await githubPayloadInstance.save();

  res.send("GitHub payload received and saved");
});

// Middleware: Route to handle POST requests to the bins & stores requests in the respective bin
app.post("/bin/:id", async (req, res) => {
  let id = req.params.id;

  let requestInfo = {
    binId: id,
    headers: req.headers,
    body: req.body,
    method: req.method,
    path: req.path,
    query: req.query
  };

  let request = new Request(requestInfo);
  await request.save();

  res.send("Request received");
});

// Route to view bin's content
app.get("/bin/:id", async (req, res) => {
  let id = req.params.id;

  let requests = await Request.find({ binId: id }).sort({ createdAt: -1 });
  console.log("app.get", requests);

  if (!requests.length) {
    res.status(404).send("Bin not found");
    return;
  }

  res.json(requests);
});

app.use(express.static("build"));

// Catch-all handler -> return index.html
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

const PORT = config.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
