const CartModel = require("../models/cart.model");

/**
 * @function getCart
 * @description Get cart of user
 *
 * This controller performs the following steps:
 * 1. Get user from request object
 * 2. Find cart for user
 * 3. If cart does not exist, create new cart
 * 4. Send success response with cart and totals
 *
 * @route GET /api/cart
 * @access Private
 *
 * @returns {Promise<void>} Sends a success response with the cart and totals
 *
 * @throws {500} If an error occurs
 */
exports.getCart = async (req, res) => {
  const user = req.user;
  try {
    let cart = await CartModel.findOne({ user: user.id });
    if (!cart) {
      cart = new CartModel({ user: user.id, items: [] });
      await cart.save();
    }
    res.status(200).json({
      message: "Cart fetched successfully...",
      cart,
      totals: {
        itemCount: cart.items.length,
        totalQuantity: cart.items.reduce(
          (total, item) => total + item.quantity,
          0,
        ),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error..." });
  }
};

/**
 * @function addItemToCart
 * @description Add item to cart
 *
 * This controller performs the following steps:
 * 1. Extract productId and qty from request body
 * 2. Get user from request object
 * 3. Find or create cart for user
 * 4. Check if item already exists in cart
 * 5. If item exists, update quantity
 * 6. If item does not exist, add new item
 * 7. Save cart
 * 8. Send success response
 *
 * @route POST /api/cart/items
 * @access Private
 *
 * @returns {Promise<void>} Sends a success response with the added item and cart
 *
 * @throws {409} If the item already exists in the cart
 * @throws {500} If there is an internal server error
 */
exports.addItemToCart = async (req, res) => {
  const { productId, qty } = req.body;
  const user = req.user;
  try {
    let cart = await CartModel.findOne({ user: user.id });
    if (!cart) {
      cart = new CartModel({ user: user.id, items: [] });
    }
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString(),
    );
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }
    await cart.save();
    res
      .status(201)
      .json({ message: "Item added to cart successfully...", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error..." });
  }
};

/**
 * @function updateItemQuantity
 * @description Update item quantity in cart
 *
 * This controller performs the following steps:
 * 1. Extract productId and quantity from request body
 * 2. Get user from request object
 * 3. Find cart for user
 * 4. Check if item exists in cart
 * 5. If item exists, update quantity
 * 6. Save cart
 * 7. Send success response
 *
 * @route PATCH /api/cart/items/:productId
 * @access Private
 *
 * @returns {Promise<void>} Sends a success response with the updated cart
 *
 * @throws {404} If the cart or item is not found
 * @throws {500} If there is an internal server error
 */
exports.updateItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { qty } = req.body;
  const user = req.user;
  try {
    const cart = await CartModel.findOne({ user: user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found..." });
    }
    const item = cart.items.find(
      (item) => item.productId.toString() === productId.toString(),
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart..." });
    }
    item.quantity = qty;
    await cart.save();
    res
      .status(200)
      .json({ message: "Item quantity updated successfully...", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error..." });
  }
};

/**
 * @function deleteItemFromCart
 * @description Delete item from cart
 *
 * This controller performs the following steps:
 * 1. Extract productId from request body
 * 2. Get user from request object
 * 3. Find cart for user
 * 4. Check if item exists in cart
 * 5. If item exists, remove it from cart
 * 6. Save cart
 * 7. Send success response
 *
 * @route DELETE /api/cart/items/:productId
 * @access Private
 *
 * @returns {Promise<void>} Sends a success response with the updated cart
 *
 * @throws {404} If the cart or item is not found
 * @throws {500} If there is an internal server error
 */
exports.deleteItemFromCart = async (req, res) => {
  const { productId } = req.params;
  const user = req.user;

  try {
    const cart = await CartModel.findOne({ user: user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found..." });
    }

    // 🧠 Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    await cart.save();

    res.status(200).json({
      message: "Item deleted from cart successfully...",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error..." });
  }
};

/**
 * @function clearCart
 * @description Clear cart
 *
 * This controller performs the following steps:
 * 1. Get user from request object
 * 2. Find cart for user
 * 3. If cart exists, clear it
 * 4. Save cart
 * 5. Send success response
 *
 * @route DELETE /api/cart
 * @access Private
 *
 * @returns {Promise<void>} Sends a success response with the cleared cart
 *
 * @throws {404} If the cart is not found
 * @throws {500} If there is an internal server error
 */

exports.clearCart = async (req, res) => {
  const user = req.user;
  try {
    const cart = await CartModel.findOne({ user: user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found..." });
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully...", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error..." });
  }
};
