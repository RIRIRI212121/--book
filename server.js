require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  // HTMLの hidden input から product_type を受け取る ("book" または "karuta")
  const productType = req.body.product_type;
  
  // 商品の種類（product_type）によってStripeの価格IDを切り替える
  let priceId = "";
  if (productType === "book") {
    priceId = "price_本用の実際の価格IDに書き換えてね"; // 例: price_1N...
  } else if (productType === "karuta") {
    priceId = "price_かるた用の実際の価格IDに書き換えてね"; // 例: price_1N...
  } else {
    return res.status(400).json({ error: "Invalid product type" });
  }

  const sessionParams = {
    ui_mode: "hosted_page",
    mode: "payment",
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
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cancel`,
    line_items: [{ price: priceId, quantity: 1 }],
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
