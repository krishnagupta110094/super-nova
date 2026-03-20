const axios = require("axios");

exports.addToCart = async (productId, token) => {
  const res = await axios.post(
    `${process.env.CART_SERVICE_URL}`,
    {
      productId,
      qty: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
