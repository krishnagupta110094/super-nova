const { v4: uuidv4 } = require("uuid");

const imagekit = require("../config/imagekit.config");

const uploadImageToImageKit = async (file) => {
  try {
    const res = await imagekit.upload({
      file: file.buffer,
      fileName: `${uuidv4()}.png`,
      folder: "supernova-products",
    });

    return {
      url: res.url,
      thumbnail: res.thumbnailUrl || res.url,
      id: res.fileId,
    };
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};

module.exports = {
  uploadImageToImageKit,
};
