const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: "https://budget-tracker-frontend-eight.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cors());

app.use(express.json());

// MongoDB Connec
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Routes
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Budget Tracker Backend is Live on Vercel!");
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, type } = req.body;
    const transaction = new Transaction({ title, amount, category, type });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Backend received DELETE request for ID:", id); // Debugging
    const result = await Transaction.findByIdAndDelete(id);
    if (!result) {
      console.log(`Transaction with ID ${id} not found`);
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(204).send(); // No Content - successful deletion
  } catch (err) {
    console.error("Error deleting transaction:", err);
    // Check if the error is a valid MongoDB ObjectId error
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid Transaction ID" });
    }
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on 5000 port`);
});
