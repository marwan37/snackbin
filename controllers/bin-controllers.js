const Request = require("../models/request");
const GithubPayload = require("../models/githubPayload");
const { generateRandomString } = require("./utils/turtle");
const { dbQuery } = require("../lib/pg-persistence");

const createRequestBin = client => async (req, res) => {
  try {
    let endpoint_url = req.params.id;

    const result = await client.query(
      "INSERT INTO bins (endpoint_url, created_at) VALUES ($1, NOW()) RETURNING id, endpoint_url, created_at",
      [endpoint_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while inserting the bin into postgres db." });
  }
};

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

const getBinForId = async (req, res) => {
  let id = req.params.id;

  let requests = await Request.find({ binId: id }).sort({ createdAt: -1 });

  if (!requests.length) {
    res.status(404).send("Bin not found");
    return;
  }

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

module.exports = client => {
  extractRequestData,
    getGihubtPayload,
    getBinForId,
    createRequest,
    deleteRequest,
    createRequestBin(client);
};
