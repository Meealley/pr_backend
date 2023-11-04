const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const colors = require("colors");
const PORT = process.env.PORT || 5001;
const cookieParser = require("cookie-parser");
const connectDb = require("./Config/dbConnect");
const AuthRoutes = require("./Routes/AuthRoutes");
const { notFound, errorHandler } = require("./Middleware/ErrorHandler");

connectDb();

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", AuthRoutes);

//Error miiddleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
