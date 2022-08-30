import express from "express";
import dotenv from "dotenv";
dotenv.config();

export const app = express();

// import routes
import mainRouter from "./routes/main.js";
import webhooksRouter from "./routes/webhooks.js";

//init stripe
import { init } from "./stripe.js";
export const stripe = init();

//init routes and middlewares
app.use(express.urlencoded({ extended: true }));
app.use("/", mainRouter);
app.use("/webhooks", webhooksRouter);

//init server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
