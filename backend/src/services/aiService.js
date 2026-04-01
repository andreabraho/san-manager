const Groq = require('groq-sdk');

const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatWithKnowledge = async (knowledge, question) => {
  // Do NOT log any portion of the API key — even a prefix leaks entropy.
  // Log only whether the key is configured so the server owner can diagnose
  // missing-credential issues without exposing the secret.
  console.log('[aiService] GROQ_API_KEY at call time:', process.env.GROQ_API_KEY ? 'SET' : 'MISSING');
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 512,
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
