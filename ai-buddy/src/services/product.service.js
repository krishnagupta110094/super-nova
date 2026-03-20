const axios = require("axios");

exports.getProduct = async (query, token) => {
  const res = await axios.get(
    `${process.env.PRODUCT_SERVICE_URL}/?q=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data?.data?.[0]; // best match
};
