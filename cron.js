const cron = require("node-cron");
const { Client } = require("pg");
const Request = require("./models/request");

// postgresql setup
const client = new Client({
  connectionString: "postgresql://marwan:bonbon@localhost:5432/requestbin"
});
client.connect();

cron.schedule(
  "* * * * *",
  async () => {
    console.log("Running a job at 01:00 at America/Los_Angeles timezone");

    // Fetches all requests from Mongo and sorts them by date
    const requests = await Request.find({}).sort({ createdAt: -1 });

    // Prepare an array of promises representing our queries
    const queryPromises = requests.map(request => {
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

    // Execute all INSERT queries in parallel
    Promise.all(queryPromises)
      .then(() => {
        console.log("Data synced successfully.");

        // ANALYTICS
        const now = new Date();
        const oneSecondAgo = new Date(now.getTime() - 1000);

        // Count GET requests generated per second
        client
          .query(
            `SELECT COUNT(*) FROM requests WHERE method = 'GET' AND created_at >= $1 AND created_at <= $2`,
            [oneSecondAgo, now]
          )
          .then(result => {
            console.log(`GET requests per second: ${result.rows[0].count}`);
          })
          .catch(error => {
            console.error(`Failed to retrieve GET requests: ${error}`);
          });

        // Count POST requests generated per second
        client
          .query(
            `SELECT COUNT(*) FROM requests WHERE method = 'POST' AND created_at >= $1 AND created_at <= $2`,
            [oneSecondAgo, now]
          )
          .then(result => {
            console.log(`POST requests per second: ${result.rows[0].count}`);
          })
          .catch(error => {
            console.error(`Failed to retrieve POST requests: ${error}`);
          });

        // Count requests with non-empty body generated per second
        client
          .query(
            `SELECT COUNT(*) FROM requests WHERE body IS NOT NULL AND created_at >= $1 AND created_at <= $2`,
            [oneSecondAgo, now]
          )
          .then(result => {
            console.log(`Requests with non-empty body per second: ${result.rows[0].count}`);
          })
          .catch(error => {
            console.error(`Failed to retrieve requests with non-empty body: ${error}`);
          });
      })
      .catch(error => {
        console.error(`Failed to sync data: ${error}`);
      });
  },
  {
    scheduled: true,
    timezone: "America/Los_Angeles"
  }
);
