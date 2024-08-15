const axios = require('axios');

const lenses = [
  "Actionable", "Motivational", "Analytical", "Contrarian", "Observation",
  "X vs. Y", "Present/Future", "Listicle", "Upcoming Week", "Highs & Lows",
  "Tips", "Tools", "Hacks", "Lead Magnet"
];

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { offer, targetAudience, contentPillar } = JSON.parse(event.body);

  try {
    const hooks = {};
    for (const lens of lenses) {
      const prompt = `Generate a ${lens} hook for the following:
        Offer: ${offer}
        Target Audience: ${targetAudience}
        Content Pillar: ${contentPillar}
        
        The hook should be attention-grabbing and effective. Please provide only the hook text.`;

      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
        prompt: prompt,
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      hooks[lens] = [response.data.choices[0].text.trim()];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(hooks)
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate hooks' })
    };
  }
};
