// /backend/aiService.js
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a query + optional PDF content to OpenRouter AI (Mistral 7B Instruct)
 * The response will be friendly, short, and limited to 3-5 sentences.
 * @param {string} prompt - What to find / user query
 * @param {string} context - Optional PDF content
 * @returns {Promise<string>} AI response text
 */
async function getAIResponse(prompt, context = '') {
  try {
    // Combine query + PDF text if provided
    const fullPrompt = context
      ? `Analyze the following PDF content and ${prompt}.\nKeep your response friendly, short, and concise. Limit it to 3-5 sentences.\n\nPDF Content:\n${context}`
      : `${prompt}.\nKeep your response friendly, short, and concise. Limit it to 3-5 sentences.`;

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: fullPrompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract AI reply
    const aiMessage = response.data?.choices?.[0]?.message?.content;
    return aiMessage || "No AI response available.";
  } catch (err) {
    console.error('❌ OpenRouter API error:', err.response?.data || err.message);
    return "No AI response due to API error.";
  }
}

module.exports = { getAIResponse };
