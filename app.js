const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const config = require("./utils/config");

const binRoutes = require("./routes/bin-routes");
const analyticsRoutes = require("./routes/analytics-routes");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

io.on("connection", socket => {
  console.log("a user connected");
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

const mongoose = require("mongoose");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(error => console.log("error connecting to MongoDB:", error.message));

app.use("/api/analytics", analyticsRoutes);
app.use("/", binRoutes);

app.use(express.static("build"));

// Catch-all handler -> return index.html
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

const PORT = config.PORT || 3001;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
