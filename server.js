require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  const mode = "payment";

  const sessionParams = {
    ui_mode: "hosted_page",
    mode,
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: true },
    allow_promotion_codes: false,
    payment_method_collection: "always",
    submit_type: "auto",
    shipping_address_collection: {
      allowed_countries: ["JP"]
    },
    name_collection: {
      individual: {
        enabled: true,
        optional: true
      }
    },
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cancel`,
    line_items: [{ price: "price_...", quantity: 1 }],
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    res.redirect(303, session.url);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log("Server running on port 4242"));