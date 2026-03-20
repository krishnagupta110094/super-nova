require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const connectDB = require("./src/db/db");

connectDB();
connect();
app.listen(3004, () => {
  console.log("Payment Service running on port 3004");
});
