const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./utils/config");

const binControllers = require("./routes/bin-controllers")(client);
const binRoutes = require("./routes/bin-routes")(binControllers);

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

app.use("/", binRoutes);

app.post("/payload", async (req, res) => {
  let collection = await db.collection("test2");
  await collection.insertOne(req.body);
  res.send("ok");
});

app.get("/requests", async (req, res) => {
  let collection = await db.collection("test2");
  let list = await collection.find().toArray();
  console.log(list);
  res.send(list);
});

// app.use(express.static("build"));
// Catch-all handler -> return index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "build", "index.html"));
// });

// Function to close server on 'SIGTERM' and 'SIGINT' signals
const shutdown = signal => async () => {
  console.log(`${signal} signal received. Closing http server.`);

  try {
    await client.end();
    console.log("PostgreSQL client disconnected.");
  } catch (err) {
    console.error("Error during disconnection:", err.stack);
  }

  server.close(err => {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  });
};

const PORT = config.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
