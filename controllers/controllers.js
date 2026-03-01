import mongoose from "mongoose";
import Item from "../models/modelSchema.js";

// GET /api/items/data
// Supports filtering by name/status and range filtering for price,
// pagination via page & limit, and sorting.
const getData = async (req, res) => {
  try {
    const {
      name,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = "name",
      sortDir = "asc",
    } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        if (isNaN(minPrice))
          return res.status(400).json({ error: "minPrice must be a number" });
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        if (isNaN(maxPrice))
          return res.status(400).json({ error: "maxPrice must be a number" });
        filter.price.$lte = Number(maxPrice);
      }
    }

    const pageNum = Number(page) || 1;
    const lim = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * lim;

    const sort = { [sortBy]: sortDir === "desc" ? -1 : 1 };

    const [total, data] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter).sort(sort).skip(skip).limit(lim),
    ]);

    if (!data || data.length === 0) {
      return res.status(200).json({
        data: [],
        total,
        page: pageNum,
        limit: lim,
        message: "No items found",
      });
    }

    return res.status(200).json({ data, total, page: pageNum, limit: lim });
  } catch (err) {
    console.error("Error fetching items:", err);
    return res.status(500).json({ error: "Failed to fetch items" });
  }
};

// GET /api/items/:id
const getItemById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid item id" });
  try {
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.status(200).json({ data: item });
  } catch (err) {
    console.error("Error fetching item:", err);
    return res.status(500).json({ error: "Failed to fetch item" });
  }
};

// POST /api/items
const createItem = async (req, res) => {
  const { name, quantity, price, status } = req.body;
  if (!name || quantity == null || price == null || !status) {
    return res.status(400).json({
      error: "Missing required fields: name, quantity, price, status",
    });
  }
  try {
    const newItem = await Item.create({ name, quantity, price, status });
    return res.status(201).json({ data: newItem });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Item with this name already exists" });
    }
    console.error("Error creating item:", err);
    return res.status(500).json({ error: "Failed to create item" });
  }
};

// PUT /api/items/:id
const updateItem = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid item id" });
  try {
    const updated = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    return res.status(200).json({ data: updated });
  } catch (err) {
    console.error("Error updating item:", err);
    return res.status(500).json({ error: "Failed to update item" });
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid item id" });
  try {
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    return res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    return res.status(500).json({ error: "Failed to delete item" });
  }
};

// POST /api/items/seed
// Inserts sample items (non-destructive: will ignore duplicates)
const seedItems = async (req, res) => {
  const samples = [
    { name: "Apple", quantity: 50, price: 0.5, status: "available" },
    { name: "Banana", quantity: 30, price: 0.3, status: "available" },
    { name: "Cherry", quantity: 0, price: 1.5, status: "out-of-stock" },
  ];
  try {
    const inserted = await Item.insertMany(samples, { ordered: false });
    return res
      .status(201)
      .json({ insertedCount: inserted.length, items: inserted });
  } catch (err) {
    // insertMany with ordered:false will still throw for all duplicates; we handle gracefully
    console.warn("Seed warning (some items may already exist):", err.message);
    // return current items as a fallback
    const all = await Item.find({ name: { $in: samples.map((s) => s.name) } });
    return res
      .status(200)
      .json({ message: "Seed completed (partial)", items: all });
  }
};

/**
 * GET /api/reports/aggregation-example?minPrice=10&sort=desc
 *
 * Demonstrates aggregation pipeline with multiple stages:
 *  1. $match - filter documents early
 *  2. $group - group by status and calculate aggregates
 *  3. $addFields - add computed fields
 *  4. $project - reshape output
 *  5. $match again - filter computed results
 *  6. $sort - order the results
 *  7. $limit - limit output
 */
const getAggregationReport = async (req, res) => {
  try {
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const pipeline = [
      // Stage 1: Filter early - only active items above minimum price
      { $match: { status: "available", price: { $gte: minPrice } } },

      // Stage 2: Group by status and calculate aggregates
      {
        $group: {
          _id: "$status", // group by status field
          totalQuantity: { $sum: "$quantity" }, // sum quantities
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } }, // total inventory value
          avgPrice: { $avg: "$price" }, // average price
          itemCount: { $sum: 1 }, // count of items
          priceRange: { $push: "$price" }, // collect all prices
        },
      },

      // Stage 3: Add computed fields without removing others
      {
        $addFields: {
          avgPriceRounded: { $round: ["$avgPrice", 2] },
          minPrice: { $min: "$priceRange" },
          maxPrice: { $max: "$priceRange" },
        },
      },

      // Stage 4: Project/reshape the output
      {
        $project: {
          _id: 0, // drop internal _id
          status: "$_id", // rename _id to status
          itemCount: 1,
          totalQuantity: 1,
          totalValue: { $round: ["$totalValue", 2] },
          avgPrice: "$avgPriceRounded",
          minPrice: 1,
          maxPrice: 1,
          priceRange: 0, // drop working array
        },
      },

      // Stage 5: Filter again - only groups with more than 10 items
      { $match: { itemCount: { $gte: 10 } } },

      // Stage 6: Sort by totalValue
      { $sort: { totalValue: sortDirection } },

      // Stage 7: Limit to top 5 results
      { $limit: 5 },
    ];

    const report = await Item.aggregate(pipeline).exec();
    return res.status(200).json({ data: report });
  } catch (err) {
    console.error("Error in aggregation report:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate aggregation report" });
  }
};

/**
 * GET /api/items/facet-search?name=app&page=1
 *
 * Demonstrates advanced aggregation concepts:
 *  - $unwind - deconstruct arrays
 *  - $facet - parallel pipelines for data + metadata
 *  - $skip/$limit - pagination
 *  - $count - count matching documents
 */
const getFacetedSearch = async (req, res) => {
  try {
    const namePattern = req.query.name || "";
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = 10;

    const pipeline = [
      // Initial filter - case‑insensitive name search
      {
        $match: {
          name: { $regex: namePattern, $options: "i" },
        },
      },

      // Facet: run two parallel pipelines
      {
        $facet: {
          // Pipeline 1: Get count and metadata
          metadata: [{ $count: "total" }],

          // Pipeline 2: Get paginated data with sorting
          data: [
            { $sort: { price: -1 } }, // sort by price descending
            { $skip: perPage * (page - 1) },
            { $limit: perPage },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                quantity: 1,
                status: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await Item.aggregate(pipeline).exec();
    const total = result.metadata[0]?.total || 0;

    return res.status(200).json({
      data: result.data,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    console.error("Error in faceted search:", err);
    return res.status(500).json({ error: "Failed to perform faceted search" });
  }
};

/**
 * GET /api/items/advanced-aggregation?status=available
 *
 * More complex example showing:
 *  - Conditional aggregation with $cond
 *  - Multiple $group and $project stages
 *  - Array manipulation
 */
const getAdvancedAggregation = async (req, res) => {
  try {
    const status = req.query.status || "available";

    const pipeline = [
      // Match by status
      { $match: { status } },

      // Group and categorize by price range
      {
        $group: {
          _id: {
            status: "$status",
            // Use $cond to bucket prices
            priceCategory: {
              $cond: [
                { $lt: ["$price", 0.5] },
                "cheap",
                {
                  $cond: [{ $lt: ["$price", 2] }, "medium", "expensive"],
                },
              ],
            },
          },
          items: { $push: { name: "$name", price: "$price" } },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },

      // Add profitability info based on quantity
      {
        $addFields: {
          isDemanding: {
            $cond: [{ $gte: ["$totalQuantity", 50] }, true, false],
          },
        },
      },

      // Reshape for clean output
      {
        $project: {
          _id: 0,
          priceCategory: "$_id.priceCategory",
          itemCount: "$count",
          totalQuantity: 1,
          isDemanding: 1,
          items: 1,
        },
      },

      { $sort: { totalQuantity: -1 } },
    ];

    const results = await Item.aggregate(pipeline).exec();
    return res.status(200).json({ data: results });
  } catch (err) {
    console.error("Error in advanced aggregation:", err);
    return res
      .status(500)
      .json({ error: "Failed to perform advanced aggregation" });
  }
};

export {
  //filters, pagination, sorting, and error handling
  getData,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  seedItems,
  // Aggregation examples
  getAggregationReport,
  getFacetedSearch,
  getAdvancedAggregation,
};
