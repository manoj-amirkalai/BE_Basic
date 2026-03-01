```js
/**
 * ============================================================
 * COMPLETE MONGOOSE METHODS DOCUMENTATION (FULL LIST)
 * ============================================================
 *
 * Categories:
 * 1. CREATE
 * 2. READ
 * 3. UPDATE
 * 4. REPLACE
 * 5. DELETE
 * 6. COUNT
 * 7. EXISTS / VALIDATION
 * 8. BULK OPERATIONS
 * 9. AGGREGATE
 * 10. DOCUMENT METHODS
 * 11. QUERY HELPERS
 * 12. INDEX / COLLECTION METHODS
 * 13. TRANSACTIONS
 *
 * ============================================================
 */

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  status: String
}, { timestamps: true });

const User = mongoose.model("User", schema);


/**
 * ============================================================
 * 1. CREATE METHODS
 * ============================================================
 *
 * Model.create(doc, options)
 * Document.save(options)
 * Model.insertMany(docs, options)
 *
 */

User.create({ name: "Manoj" });

const doc = new User({ name: "Test" });
doc.save();

User.insertMany([
  { name: "A" },
  { name: "B" }
]);


/**
 * ============================================================
 * 2. READ METHODS
 * ============================================================
 *
 * Model.find(filter, projection, options)
 * Model.findOne(filter, projection, options)
 * Model.findById(id, projection, options)
 *
 */

User.find({ age: 25 });

User.findOne({ email: "test@email.com" });

User.findById("id");


/**
 * ============================================================
 * 3. UPDATE METHODS
 * ============================================================
 *
 * Model.updateOne(filter, update, options)
 * Model.updateMany(filter, update, options)
 * Model.findByIdAndUpdate(id, update, options)
 * Model.findOneAndUpdate(filter, update, options)
 *
 */

User.updateOne(
  { email: "test@email.com" },
  { age: 30 }
);

User.updateMany(
  { status: "inactive" },
  { status: "active" }
);

User.findByIdAndUpdate(
  "id",
  { age: 35 },
  { new: true }
);

User.findOneAndUpdate(
  { email: "test@email.com" },
  { age: 40 }
);


/**
 * ============================================================
 * 4. REPLACE METHODS
 * ============================================================
 *
 * Model.replaceOne(filter, replacement, options)
 * Model.findOneAndReplace(filter, replacement, options)
 *
 */

User.replaceOne(
  { email: "test@email.com" },
  { name: "New", email: "test@email.com" }
);

User.findOneAndReplace(
  { email: "test@email.com" },
  { name: "Replaced" }
);


/**
 * ============================================================
 * 5. DELETE METHODS
 * ============================================================
 *
 * Model.deleteOne(filter)
 * Model.deleteMany(filter)
 * Model.findByIdAndDelete(id)
 * Model.findOneAndDelete(filter)
 *
 */

User.deleteOne({ email: "test@email.com" });

User.deleteMany({ status: "inactive" });

User.findByIdAndDelete("id");

User.findOneAndDelete({ email: "test@email.com" });


/**
 * ============================================================
 * 6. COUNT METHODS
 * ============================================================
 *
 * Model.countDocuments(filter)
 * Model.estimatedDocumentCount()
 *
 */

User.countDocuments({ status: "active" });

User.estimatedDocumentCount();


/**
 * ============================================================
 * 7. EXISTS METHODS
 * ============================================================
 *
 * Model.exists(filter)
 *
 */

User.exists({ email: "test@email.com" });


/**
 * ============================================================
 * 8. BULK METHODS
 * ============================================================
 *
 * Model.bulkWrite(operations)
 *
 */

User.bulkWrite([

  {
    insertOne: {
      document: { name: "Bulk Insert" }
    }
  },

  {
    updateOne: {
      filter: { email: "test@email.com" },
      update: { age: 50 }
    }
  },

  {
    deleteOne: {
      filter: { email: "delete@email.com" }
    }
  }

]);


/**
 * ============================================================
 * 9. AGGREGATE METHODS
 * ============================================================
 *
 * Model.aggregate(pipeline)
 *
 */

User.aggregate([
  { $match: { age: { $gt: 20 } } },
  { $group: { _id: "$status", total: { $sum: 1 } } }
]);


/**
 * ============================================================
 * 10. DOCUMENT METHODS
 * ============================================================
 *
 * doc.save()
 * doc.remove()  (deprecated)
 * doc.deleteOne()
 * doc.updateOne()
 * doc.validate()
 *
 */

const user = await User.findById("id");

await user.save();

await user.deleteOne();

await user.updateOne({ age: 60 });

await user.validate();


/**
 * ============================================================
 * 11. QUERY HELPER METHODS
 * ============================================================
 *
 * Query chaining
 *
 */

User.find()
  .select("name age")
  .limit(10)
  .skip(5)
  .sort({ age: -1 })
  .lean();


/**
 * ============================================================
 * 12. INDEX METHODS
 * ============================================================
 *
 * Model.createIndexes()
 * Model.syncIndexes()
 * Model.listIndexes()
 *
 */

User.createIndexes();

User.syncIndexes();

User.listIndexes();


/**
 * ============================================================
 * 13. COLLECTION METHODS
 * ============================================================
 *
 * Model.collection.drop()
 *
 */

User.collection.drop();


/**
 * ============================================================
 * 14. TRANSACTION METHODS
 * ============================================================
 *
 */

const session = await mongoose.startSession();

session.startTransaction();

await User.create(
  [{ name: "Transaction User" }],
  { session }
);

await session.commitTransaction();

session.endSession();


/**
 * ============================================================
 * COMPLETE SUMMARY TABLE
 * ============================================================
 *
 * CREATE
 * create()
 * save()
 * insertMany()
 *
 * READ
 * find()
 * findOne()
 * findById()
 *
 * UPDATE
 * updateOne()
 * updateMany()
 * findByIdAndUpdate()
 * findOneAndUpdate()
 *
 * REPLACE
 * replaceOne()
 * findOneAndReplace()
 *
 * DELETE
 * deleteOne()
 * deleteMany()
 * findByIdAndDelete()
 * findOneAndDelete()
 *
 * COUNT
 * countDocuments()
 * estimatedDocumentCount()
 *
 * EXISTS
 * exists()
 *
 * BULK
 * bulkWrite()
 *
 * AGGREGATE
 * aggregate()
 *
 * DOCUMENT
 * save()
 * deleteOne()
 * updateOne()
 * validate()
 *
 * QUERY HELPERS
 * select()
 * limit()
 * skip()
 * sort()
 * lean()
 *
 * INDEX
 * createIndexes()
 * syncIndexes()
 *
 * TRANSACTION
 * startSession()
 *
 * ============================================================
 */
```;
// | Situation         | Use                 |
// | ----------------- | ------------------- |
// | Create one        | create()            |
// | Create many       | insertMany()        |
// | Read many         | find()              |
// | Read one          | findOne()           |
// | Read by id        | findById()          |
// | Update one        | updateOne()         |
// | Update and return | findOneAndUpdate()  |
// | Update by id      | findByIdAndUpdate() |
// | Replace fully     | replaceOne()        |
// | Delete one        | deleteOne()         |
// | Delete by id      | findByIdAndDelete() |
// | Count             | countDocuments()    |
// | Check exists      | exists()            |
// | Reports           | aggregate()         |
// | Batch ops         | bulkWrite()         |
// | Atomic operations | transaction         |

// updateOne
const result1 = await User.updateOne({ email: "manoj@email.com" }, { age: 50 });

console.log(result1);

// OUTPUT
// {
//   acknowledged: true,
//   matchedCount: 1,
//   modifiedCount: 1
// }

// findOneAndUpdate
const result2 = await User.findOneAndUpdate(
  { email: "manoj@email.com" },
  { age: 60 },
  { new: true },
);

console.log(result2);

// OUTPUT
// {
//   _id: "...",
//   name: "Manoj",
//   age: 60,
//   email: "manoj@email.com"
// }
