const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./utils/config");

const binRoutes = require("./routes/bin-routes");

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(error => console.log("error connecting to MongoDB:", error.message));

app.use("/", binRoutes);

app.use(express.static("build"));

// Catch-all handler -> return index.html
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});
const PORT = config.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
