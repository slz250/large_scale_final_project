const { Pool, Client } = require('pg');

const user = "admin";
const pw = "12345";
const dbName = "largeScaleDB";

const connectionString = "postgresql://" + user + ":" + pw + "@localhost/" + dbName;

const client = new Client({
    connectionString: connectionString
});
client.connect();


const pool = new Pool({
    connectionString: connectionString
});


module.exports = {
  query: (text, params) => pool.query(text, params)
};
