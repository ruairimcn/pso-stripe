import express from "express";
import Stripe from "stripe";
import { stripe } from "../index.js";

const cancel_timestamp = 1661538240996 + 320 * 60000 * 60 * 24;

const route = express.Router();
route.use(express.raw({ type: "application/json" }));

route.post("/", async (req, res) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_TOKEN;
    // Verify the webhook secret existence
    if (!webhookSecret || !process.env.PRICE_ID) {
      throw new Error("Stripe webhook secret or price id not found");
    }
    //obtain and verify the webhook signature
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      throw new Error("No stripe signature found");
    }
    //construct the event
    const constructedEvent = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    //filter event types to get the one we want
    if (constructedEvent.type === "payment_method.attached") {
      //assign type to the event
      const event = constructedEvent.data.object as Stripe.PaymentMethod;

      //check for correct types on the params we want
      if (typeof event.id !== "string" || typeof event.customer !== "string") {
        return res.sendStatus(500);
      }
      //obtan the current timestamp
      const datenum = Date.now();
      //transform timestamp into a UNIX timestamp
      let tmstp = (datenum - (datenum % 1000)) / 1000;
      //move the timestamp to the nearest tuesday
      while (new Date(tmstp * 1000).getDay() !== 2) {
        tmstp += 60;
      }
      //create the subscription
      const sub = await stripe.subscriptions.create({
        customer: event.customer,
        items: [{ price: process.env.PRICE_ID, quantity: 1 }],
        default_payment_method: event.id,
        cancel_at: (cancel_timestamp - (cancel_timestamp % 1000)) / 1000,
        billing_cycle_anchor: tmstp + 30,
      });
      //respond to stripe
      return res.sendStatus(200);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default route;
