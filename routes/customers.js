const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

// mongoose.Schema bir class olduğu için "new" kullanıldı
const customerSchema = new mongoose.Schema({
  isGold: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    minlength: [3, "At least 3 characters needed. You entered {VALUE}"],
    maxlength: [50, "Maximum 50 characters allowed. You entered {VALUE}"],
  },
  phone: {
    type: String,
    required: true,
    minlength: [11, "Phone number must be at least 11 characters long. You entered {VALUE}"],
    maxlength: [13, "Phone number must be at maximum 13 characters long. You entered {VALUE}"],
  },
});

const Customer = mongoose.model("Customer", customerSchema);

// Get All Customers
router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.status(200).send(customers);
});

// Create Customer
router.post("/", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  customer = await customer.save(); //result db'e kaydedilen dökümandır. id bilgisini geri dönelim...

  res.status(200).send(customer);
});

// Update Customer
router.put("/:id", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true } //update edilmiş veriyi geri döndür...
  );

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

// Delete Customer by ID
router.delete("/:id", async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

// Find Customer by ID
router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send("The customer with the given ID was not found.");
  res.send(customer);
});

function validateCustomer(customer) {
  const schema = {
    name: Joi.string().min(3).required(),
    phone: Joi.string().min(11).max(13).required(),
    isGold: Joi.boolean(),
  };

  return Joi.validate(customer, schema);
}

module.exports = router;
