import Stripe from "stripe";

let stripe: Stripe;

export const init = (): Stripe => {
  //check for required envs
  if (!process.env.STRIPE_KEY) {
    throw new Error("Stripe secret key is not defined");
  }
  //return the stripe instance if it exists
  if (stripe) {
    return stripe;
  }
  //init the stripe instance
  stripe = new Stripe(process.env.STRIPE_KEY, { apiVersion: "2022-08-01" });
  //return the stripe instances
  return stripe;
};
