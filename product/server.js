require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const connectDB = require("./src/db/db");

connectDB();
connect();

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
