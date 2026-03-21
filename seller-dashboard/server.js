require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const listener = require("./src/broker/listener");
const connectDB = require("./src/db/db");

connectDB();
connect().then(() => listener());

app.get("/",(req,res)=>{
  res.status(200).json({message:"Seller DashBoard Service is Running..."})
})

app.listen(3007, () => {
  console.log("Seller Dashboard Service running on port 3007");
});
