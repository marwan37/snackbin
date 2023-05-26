const cron = require("node-cron");
const { Client } = require("pg");
const Request = require("./models/request");
const Analytics = require("./models/analytics");
const config = require("./utils/config");

// postgresql setup
const client = new Client({
  connectionString: config.POSTGRES_URL
});
client.connect();

// cron.js
const axios = require("axios");

cron.schedule(
  "* * * * *",
  async () => {
    try {
      console.log("Running a job at 01:00 at America/Los_Angeles timezone");

      await axios.post("http://localhost:3001/api/analytics");

      console.log("Data synced successfully.");
    } catch (error) {
      console.error(`Failed to sync data: ${error}`);
    }
  },
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);
