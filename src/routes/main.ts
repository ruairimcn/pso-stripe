import express from "express";
import { stripe } from "../index.js";

const route = express.Router();

route.get("/", async (req, res) => {
  try {
    // check for required envs
    if (!process.env.CANCEL_URL || !process.env.SUCCESS_URL) {
      throw new Error("CANCEL_URL or SUCCESS_URL is not defined");
    }
    //create the stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup",
      customer_creation: "always",
      cancel_url: process.env.CANCEL_URL,
      success_url: process.env.SUCCESS_URL,
    });
    //send the session url
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default route;
