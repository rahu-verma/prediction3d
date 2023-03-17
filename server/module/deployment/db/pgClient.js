const dotenv = require("dotenv");
const path = require("path");
const { Client } = require("pg");

dotenv.config({ path: path.join(__dirname, "..", "..", "..", "..", ".env") });

// const connectionString = process.env.DEVELOPMENT_CLIENT_DATABASE_URL;
const connectionString = process.env.PRODUCTION_CLIENT_DATABASE_URL;
const pgdb = new Client({ connectionString });
pgdb.connect().catch((e) => console.error(e.stack));

// TODO: Delete after fixing everything
// const pgdb = new Client({
//     user: "postgres",
//     database: "data-store",
//     password: "root",
//     host: "localhost",
//     port: 5432,
// });

// const connectDb = async () => {
//     try {
//         await pgdb.connect();
//         console.log("Postgres Connected");
//     } catch (error) {
//         console.log(error);
//     }
// };

// connectDb();

module.exports = pgdb;
