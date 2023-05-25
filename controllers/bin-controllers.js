const Request = require("../models/request");
const GithubPayload = require("../models/github-payload");
const { generateRandomString } = require("../utils/turtle");
const pgClass = require("../lib/pg-persistence");
const randomizer = require("../utils/turtle").generateRandomString
const pg = new pgClass()

const extractRequestData = async (req, res) => {
  let id = req.params.id;

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


const createRequestBin = async (_req, res) => {
  let endpointCandidate;

  while (true) {
    endpointCandidate = randomizer()
    binExists = await pg.existsEndpoint(endpointCandidate);
    if (!binExists) break;
  }
  let created = await pg.createRequestBin(endpointCandidate)
  if (!created) {
    res.status(500).json({ message: "Internal server error" });
  } else {
    res.status(201).json({ "endpoint_url": endpointCandidate })
  }
}

const getBinForId = async (req, res) => {
  let id = req.params.id;
  let binExists = await pg.existsEndpoint(id);
  if (!binExists) {
    res.status(404).send("Bin not found");
    return;
  }
  let requests = await Request.find({ binId: id }).sort({ createdAt: -1 });
  res.json(requests);
};

const getGihubtPayload = async (req, res) => {
  let githubPayloadInstance = new GithubPayload({ payload: req.body });

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
  createRequestBin,
};
