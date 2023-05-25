const Request = require("../models/request");
const GithubPayload = require("../models/github-payload");
const randomizer = require("../utils/randomizer").generateRandomString;
const { Client } = require("pg");

// postgresql setup
const client = new Client({
  connectionString: "postgresql://marwan:bonbon@localhost:5432/requestbin"
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
    console.log(githubs);
  } catch (error) {
    console.error("Error fetching github payloads:", error);
  }

  res.json({ requests, githubs });
};

const createRequestBin = async (_req, res) => {
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

const getGihubtPayload = async (req, res) => {
  const id = req.params.id;
  let githubPayloadInstance = new GithubPayload({ binId: id, payload: req.body });

  await githubPayloadInstance.save();

  res.send("GitHub payload received and saved");
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

  res.send(request);
};

const deleteRequest = async (req, res) => {
  const reqId = req.params.rid;

  try {
    let request = await Request.findById(reqId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await Request.deleteOne({ _id: reqId });
    res.status(200).json({ message: "Deleted request" });
  } catch (err) {
    console.error("Error occurred while deleting request", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  extractRequestData,
  getGihubtPayload,
  getBinForId,
  createRequest,
  deleteRequest,
  createRequestBin
};
