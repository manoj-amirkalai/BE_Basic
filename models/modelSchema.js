import mongoose from "mongoose";

const ItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
});

const Item = mongoose.model("data", ItemSchema);
export default Item;
export { ItemSchema };
