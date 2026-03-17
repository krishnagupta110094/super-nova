const ProductModel = require("../models/product.model");
const { uploadImageToImageKit } = require("../services/imagekit.service");

const mongoose = require("mongoose");

/**
 * @function createProduct
 * @desc Create a new product
 *
 * This controller performs the following steps:
 * 1. Extracts product details from the request body.
 * 2. Checks if all required fields are present.
 * 3. Uploads product images to ImageKit.
 * 4. Creates a new product in the database.
 * 5. Returns a success message and the created product in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 * @access Private
 */
exports.createProduct = async (req, res) => {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;

    if (!title || !description || !priceAmount || !priceCurrency) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({
    //     message: "Product images are required",
    //   });
    // }

    const seller = req.user.id;

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    const images = await Promise.all(
      req.files.map((file) => uploadImageToImageKit(file)),
    );

    const product = await ProductModel.create({
      title,
      description,
      price,
      seller,
      images,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/**
 * @function getAllProducts
 * @desc Get all products
 *
 * This controller performs the following steps:
 * 1. Extracts query parameters from the request query.
 * 2. Creates a filter object based on the query parameters.
 * 3. Fetches products from the database based on the filter object.
 * 4. Returns a success message and the fetched products in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 */
exports.getAllProducts = async (req, res) => {
  const { q, minPrice, maxPrice, skip = 0, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }
  if (minPrice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $gte: Number(minPrice),
    };
  }
  if (maxPrice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxPrice),
    };
  }
  try {
    const products = await ProductModel.find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));
    res.status(200).json({ data: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @function getProductById
 * @desc Get a product by ID
 *
 * This controller performs the following steps:
 * 1. Extracts the product ID from the request parameters.
 * 2. Fetches the product from the database based on the ID.
 * 3. Returns a success message and the fetched product in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 */
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product fetched successfully", product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @function updateProduct
 * @desc Update a product by ID
 *
 * This controller performs the following steps:
 * 1. Extracts the product ID from the request parameters.
 * 2. Fetches the product from the database based on the ID.
 * 3. Updates the product with the new data from the request body.
 * 4. Returns a success message and the updated product in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 */
exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product ID" });
  }

  try {
    const allowedUpdates = ["title", "description", "price"];
    const body = req.body || {};
    const updates = Object.keys(body);

    // ✅ Handle undefined/null body
    if (!req.body || updates.length === 0) {
      return res.status(400).json({
        message: "No data provided for update",
      });
    }
    console.log("allowedUpdates", allowedUpdates);
    // ✅ Check valid fields
    const isValidOperation = updates.every((field) =>
      allowedUpdates.includes(field),
    );
    console.log("isValidOperation", isValidOperation);
    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid update fields" });
    }

    // ✅ Check empty/null values
    for (let field of updates) {
      if (
        req.body[field] === "" ||
        req.body[field] === null ||
        req.body[field] === undefined
      ) {
        return res.status(400).json({
          message: `${field} cannot be empty`,
        });
      }
    }

    // ✅ Update directly (better performance)
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: id, seller: req.user.id }, // ownership check
      { $set: req.body },
      {
        new: true, // return updated doc
        runValidators: true, // apply schema validation
      },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @function deleteProduct
 * @desc Delete a product by ID
 *
 * This controller performs the following steps:
 * 1. Extracts the product ID from the request parameters.
 * 2. Fetches the product from the database based on the ID.
 * 3. Deletes the product from the database.
 * 4. Returns a success message and the deleted product in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 */
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Product ID" });
  }
  try {
    const product = await ProductModel.findByIdAndDelete({
      _id: id,
      seller: req.user.id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product deleted successfully", product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @function getProductBySeller
 * @desc Get all products by seller
 *
 * This controller performs the following steps:
 * 1. Fetches all products from the database based on the seller.
 * 2. Returns a success message and the products in the response.
 *
 * @returns {Object} - JSON response object.
 *
 * @throws {Error} - If an error occurs during the process.
 */
exports.getProductBySeller = async (req, res) => {
  const seller = req.user.id;
  const { skip = 0, limit = 20 } = req.query;

  try {
    const products = await ProductModel.find({ seller: seller })
      .skip(skip)
      .limit(Math.min(limit, 20));
    return res
      .status(200)
      .json({ message: "Products fetched successfully", data: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
