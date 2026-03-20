const { parseQuery } = require("./gemini.service");
const { getProduct } = require("./product.service");
const { addToCart } = require("./cart.service");

exports.processAIQuery = async (query, userId, token) => {
  try {
    // 1. Parse query using Gemini
    const parsed = await parseQuery(query);
    console.log("Parsed AI Response:", parsed);

    if (parsed.action !== "add_to_cart") {
      return {
        success: false,
        message: "Unsupported action",
      };
    }

    // 2. Fetch product
    const product = await getProduct(parsed.query, token);

    if (!product) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    // 3. Add to cart
    await addToCart(product._id, token);

    return {
      success: true,
      message: "Product added to cart",
      product,
    };
  } catch (err) {
    console.error("AI Service Error:", err.message);

    return {
      success: false,
      message: err.message || "Something went wrong",
    };
  }
};
