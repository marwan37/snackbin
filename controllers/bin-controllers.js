const Request = require("./models/request");
const config = require("../utils/config");

const extractRequestData = async (req, res, next) => {
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

const getBinForId = async (req, res, next) => {
  let id = req.params.id;

  let requests = await Request.find({ binId: id }).sort({ createdAt: -1 });

  if (!requests.length) {
    res.status(404).send("Bin not found");
    return;
  }

  res.json(requests);
};

const createRequest = async (req, res, next) => {
  router.post("/bin", async (req, res) => {
    let id = uuidv4();
    let request = new Request({
      binId: id
    });
    await request.save();
    res.send(`http://localhost:${config.PORT}/bin/${id}`);
  });
};

module.exports = {
  extractRequestData,
  getBinForId,
  createRequest
};
