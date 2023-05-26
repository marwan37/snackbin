const config = require("../utils/config");
const Request = require("../models/request");
const GithubPayload = require("../models/github-payload");
const Queue = require("../models/queue");
const randomizer = require("../utils/randomizer").generateRandomString;
const { Client } = require("pg");
const BasecampPayload = require("../models/basecamp");

// postgresql setup
const client = new Client({
  connectionString: config.POSTGRES_URL
});
client.connect();

const extractRequestData = async (req, res) => {
  let id = req.params.id;
  let binExists = await client.query("SELECT EXISTS (SELECT 1 FROM bins WHERE endpoint_url = $1)", [
    id
  ]);
  if (!binExists.rows[0].exists) {
    res.status(404).send("Bin not found");
    return;
  }
  let requestExists = await Request.exists({ binId: id });
  if (!requestExists) {
    res.status(404).send("Bin not found");
    return;
  }
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
};

const getBinForId = async (req, res) => {
  let id = req.params.id;

  let binExists = await client.query("SELECT EXISTS (SELECT 1 FROM bins WHERE endpoint_url = $1)", [
    id
  ]);
  if (!binExists.rows[0].exists) {
    res.status(404).send("Bin not found");
    return;
  }
  let requests = [];
  let githubs = [];
  try {
    requests = await Request.find({ binId: id }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching requests:", error);
  }

  try {
    githubs = await GithubPayload.find({ binId: id }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching github payloads:", error);
  }

  const data = { requests, githubs };

  req.io.emit("update", data);

  res.json(data);
};

const createRequestBin = async (req, res) => {
  let endpointCandidate;

  while (true) {
    endpointCandidate = randomizer();
    let binExists = await client.query(
      "SELECT EXISTS (SELECT 1 FROM bins WHERE endpoint_url = $1)",
      [endpointCandidate]
    );
    if (!binExists.rows[0].exists) break;
  }

  let created = await client.query("INSERT INTO bins (endpoint_url) VALUES ($1)", [
    endpointCandidate
  ]);
  if (created.rowCount === 0) {
    res.status(500).json({ message: "Internal server error" });
  } else {
    res.status(201).json({ endpoint_url: endpointCandidate });
  }
};

const getGithubPayload = async (req, res) => {
  const id = req.params.id;
  let githubPayloadInstance = new GithubPayload({ binId: id, payload: req.body });
  
  await githubPayloadInstance.save().then(savedDocument => {
    let queueInstance = new Queue({mongoReference: savedDocument._id})
    queueInstance.save();
  })
  .catch(error => {
    console.log(error)
  });;

  res.send("GitHub payload received and saved");
};

const createBasecampPayload = async (req, res) => {
  const id = req.params.id;
  let payload = new BasecampPayload({ binId: id, payload: req.body });

  await payload.save();

  let basecamps = [];
  try {
    basecamps = await BasecampPayload.find({ binId: id }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching basecamp payloads:", error);
  }

  req.io.emit("update", basecamps);

  res.send("Basecamp payload received and saved");
};

const createRequest = async (req, res) => {
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

  const requests = await Request.find({ binId: id }).sort({ createdAt: -1 });
  const githubs = await GithubPayload.find({ binId: id }).sort({ createdAt: -1 });

  req.io.emit("update", { requests, githubs });

  res.send(request);
};

const getBasecampPayloads = async (req, res) => {
  const id = req.params.id;

  console.log("BasecampPayloadID", req.params.id);

  let binExists = await client.query("SELECT EXISTS (SELECT 1 FROM bins WHERE endpoint_url = $1)", [
    id
  ]);
  if (!binExists.rows[0].exists) {
    res.status(404).send("Bin not found");
    return;
  }
  let basecamps = [];
  try {
    basecamps = await BasecampPayload.find({ binId: id }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching basecamp payloads:", error);
  }

  req.io.emit("update", basecamps);

  res.json(basecamps);
};

const deleteRequest = async (req, res) => {
  const reqId = req.params.rid;

  try {
    let request = await Request.findById(reqId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await Request.deleteOne({ _id: reqId });
    req.io.emit("deleted_request", request);
    res.status(200).json({ message: "Deleted request" });
  } catch (err) {
    console.error("Error occurred while deleting request", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteGithubRequest = async (req, res) => {
  const reqId = req.params.rid;

  try {
    let request = await GithubPayload.findById(reqId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await GithubPayload.deleteOne({ _id: reqId });
    req.io.emit("deleted_request", request);
    res.status(200).json({ message: "Deleted request" });
  } catch (err) {
    console.error("Error occurred while deleting request", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBasecampRequest = async (req, res) => {
  const reqId = req.params.rid;

  try {
    let request = await BasecampPayload.findById(reqId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await BasecampPayload.deleteOne({ _id: reqId });
    req.io.emit("deleted_request", request);
    res.status(200).json({ message: "Deleted request" });
  } catch (err) {
    console.error("Error occurred while deleting request", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  extractRequestData,
  getGithubPayload,
  getBinForId,
  createRequest,
  deleteRequest,
  deleteBasecampRequest,
  deleteGithubRequest,
  createRequestBin,
  createBasecampPayload,
  getBasecampPayloads
};
