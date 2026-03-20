require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const connectDB = require("./src/db/db");

connectDB();
connect();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
