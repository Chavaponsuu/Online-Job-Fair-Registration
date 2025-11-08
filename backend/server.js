const  express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const auth = require("./routes/auth")

 

dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/" , (req,res) => res.send("API is running... "))
app.use("/api/v1/auth", auth);


const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode in port ",
    PORT
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});





