const cron = require("node-cron");
const { Client } = require("pg");

// MongoDB setup
const Request = require("./models/request.model");

// PostgreSQL setup
const client = new Client({
  connectionString: "postgresql://marwan:bonbon@localhost:5432/requestbin"
});
client.connect();

/* Cron job running every minute
Each asterisk (*) represents a field
order: minute, hour, day of the month, month, day of the week. 

In this case, all fields are set to asterisks, which means the job will run every minute.
*/

cron.schedule(
  "* * * * *",
  async () => {
    console.log("Running a job at 01:00 at America/Pacific timezone");

    // Fetches all requests from Mongo and sorts them by date
    const requests = await Request.find({}).sort({ createdAt: -1 });

    // Prepare an array of promises representing our INSERT queries
    const queryPromises = requests.map(request => {
      const { binId, headers, body, method, path, query, createdAt } = request;

      // Prepare SQL query
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

      // Return the promise representing this query
      return client.query(text, values);
    });

    // Execute all INSERT queries in parallel
    Promise.all(queryPromises)
      .then(() => console.log("Data synced successfully."))
      .catch(error => console.error(`Failed to sync data: ${error}`));
  },
  {
    scheduled: true,
    timezone: "America/Pacific"
  }
);
