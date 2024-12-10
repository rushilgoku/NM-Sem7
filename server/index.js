import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  thumb: String,
  entry: { type: Date, default: Date.now },
  qty: { type: Number, required: true },
  sellerId: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const Item = mongoose.model("Item", itemSchema);
const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Hello, this is the Backend of the Inventory App");
});

app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items.map((item) => ({ ...item.toObject(), id: item._id })));
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.user,
      password: req.body.pass,
    });
    if (user) {
      res.json("Login Success!");
    } else {
      res.json("Login Failed!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/items", async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
      desc: req.body.desc,
      thumb: req.body.thumb,
      entry: req.body.entryDate,
      qty: req.body.qty,
      sellerId: req.body.sellerId,
    });
    await newItem.save();
    res.json("Item Added Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json("Item Deleted Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/itemUpdate", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.body.itemId,
      {
        name: req.body.name,
        desc: req.body.desc,
        thumb: req.body.thumb,
        entry: req.body.entryDate,
        qty: req.body.qty,
        sellerId: req.body.sellerId,
      },
      { new: true }
    );
    if (updatedItem) {
      res.json("Item Updated Successfully");
    } else {
      res.json("Item Not Found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
