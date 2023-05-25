const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
  async createRequestBin(endpointIdentifier) {
    const CREATE_ENDPOINT = "INSERT INTO bins" + "  (endpoint_url)" + "  VALUES ($1)";

    let result = await dbQuery(CREATE_ENDPOINT, endpointIdentifier);
    return result.rowCount > 0;
  }

  async existsEndpoint(endpointIdentifier) {
    const FIND_ENDPOINT = "SELECT null FROM bins" + " WHERE endpoint_url = $1";
    let result = await dbQuery(FIND_ENDPOINT, endpointIdentifier);
    return result.rowCount > 0;
  }
};
