exports.buildPrompt = (userQuery) => {
  return `
You are an AI shopping assistant.

Extract structured JSON from the user query.

Return ONLY JSON:
{
  "action": "add_to_cart",
  "query": "product title",
}
Make sure the JSON is valid and has all the required fields like action and query.


User Query: "${userQuery}"
`;
};
