const Groq = require('groq-sdk');

const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// Groq retires models periodically — override with GROQ_MODEL without a code change.
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const chatWithKnowledge = async (knowledge, question) => {
  // Do NOT log any portion of the API key — even a prefix leaks entropy.
  // Log only whether the key is configured so the server owner can diagnose
  // missing-credential issues without exposing the secret.
  console.log('[aiService] GROQ_API_KEY at call time:', process.env.GROQ_API_KEY ? 'SET' : 'MISSING');
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    reasoning_effort: 'low',
    messages: [
      {
        role: 'system',
        content:
          `You are a helpful assistant. You can ONLY answer questions based on the knowledge base below. ` +
          `If the answer is not in the knowledge base, say: "I don't have information about that." ` +
          `Never make up or infer information beyond what is explicitly stated. Be concise.\n\n` +
          `Knowledge base:\n---\n${knowledge}\n---`,
      },
      { role: 'user', content: question },
    ],
  });
  return completion.choices[0].message.content;
};

module.exports = { chatWithKnowledge };
