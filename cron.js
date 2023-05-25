const cron = require("node-cron");
const { Client } = require("pg");
const Request = require("./models/request");
const Analytics = require("./models/analytics");

// postgresql setup
const client = new Client({
  connectionString: "postgresql://marwan:bonbon@localhost:5432/requestbin"
});
client.connect();

cron.schedule(
  "* * * * *",
  async () => {
    console.log("Running a job at 01:00 at America/Los_Angeles timezone");

    const requests = await Request.find({}).sort({ createdAt: -1 });

    console.log("CRON", requests);

    const queries = requests.map(request => {
      const { binId, headers, body, method, path, query, createdAt } = request;

      const text = `
      INSERT INTO requests(bin_id, headers, body, method, path, query, created_at)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `;
      const values = [
        binId,
        JSON.stringify(headers),
        JSON.stringify(body),
        method,
        path,
        JSON.stringify(query),
        createdAt
      ];

      return client.query(text, values);
    });

    console.log("CRON", queries);

    // Execute all INSERT queries in parallel
    try {
      await Promise.all(queries);
      console.log("Data synced successfully.");

      // ANALYTICS
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000); // 60000 milliseconds = 1 minute

      const getRequests = await client.query(
        `SELECT COUNT(*) FROM requests WHERE method = 'GET' AND created_at >= $1 AND created_at <= $2`,
        [oneMinuteAgo, now]
      );

      const postRequests = await client.query(
        `SELECT COUNT(*) FROM requests WHERE method = 'POST' AND created_at >= $1 AND created_at <= $2`,
        [oneMinuteAgo, now]
      );

      const requestsWithBody = await client.query(
        `SELECT COUNT(*) FROM requests WHERE body IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
        [oneMinuteAgo, now]
      );

      // Store analytics in MongoDB
      const analytics = new Analytics({
        getRequestsPerSecond: parseInt(getRequests.rows[0].count),
        postRequestsPerSecond: parseInt(postRequests.rows[0].count),
        requestsWithBodyPerSecond: parseInt(requestsWithBody.rows[0].count),
        createdAt: now
      });

      console.log("CRON", analytics);

      await analytics.save();
      console.log("Analytics saved successfully.");
    } catch (error) {
      console.error(`Failed to sync data: ${error}`);
    }
  },
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);
