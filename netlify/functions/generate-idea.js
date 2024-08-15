const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { targetAudience, contentPillar, contentType, category } = JSON.parse(event.body);

  const prompt = `Generate a ${contentType} idea about ${contentPillar} for ${targetAudience} in the ${category} category.`;

  try {
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        type: contentType,
        hook: response.data.choices[0].text.trim()
      })
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate idea' })
    };
  }
};
