require("dotenv").config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const DEV_PROXY = process.env.PROXY_URL;
const PROD_PROXY = process.env.PROD_PROXY;
const PROXY_URL = process.env.NODE_ENV === "production" ? PROD_PROXY : DEV_PROXY;
const POSTGRES_URL = process.env.POSTGRES_URI;

module.exports = {
  MONGODB_URI,
  PORT,
  PROXY_URL,
  POSTGRES_URL
};
