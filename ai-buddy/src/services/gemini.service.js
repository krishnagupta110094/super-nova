const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildPrompt } = require("../utils/ai.prompt");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.parseQuery = async (userQuery) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = buildPrompt(userQuery);

  const result = await model.generateContent(prompt);
  console.log("AI RESULT:", JSON.stringify(result));
  const response = await result.response;
  console.log("AI RESPONSE:", JSON.stringify(response));
  const text = response.text();
  console.log("AI RESPONSE TEXT:", text);
  const cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return cleanText ? JSON.parse(cleanText) : null;
  } catch (err) {
    throw new Error("Invalid JSON from Gemini");
  }
};
