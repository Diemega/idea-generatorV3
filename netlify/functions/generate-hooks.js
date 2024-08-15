const axios = require('axios');

const lenses = [
  "Actionable", "Motivational", "Analytical", "Contrarian", "Observation",
  "X vs. Y", "Present/Future", "Listicle", "Upcoming Week", "Highs & Lows",
  "Tips", "Tools", "Hacks", "Lead Magnet"
];

exports.handler = async function(event, context) {
  console.log('Function invoked with event:', JSON.stringify(event));

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
    console.log('Parsed body:', parsedBody);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { offer, targetAudience, contentPillar } = parsedBody;

  if (!offer || !targetAudience || !contentPillar) {
    console.error('Missing required fields:', { offer, targetAudience, contentPillar });
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  console.log('Processing request for:', { offer, targetAudience, contentPillar });

  try {
    const hooks = {};
    for (const lens of lenses) {
      console.log(`Generating hook for lens: ${lens}`);
      const prompt = `Generate a ${lens} hook for the following:
        Offer: ${offer}
        Target Audience: ${targetAudience}
        Content Pillar: ${contentPillar}
        
        The hook should be attention-grabbing and effective. Please provide only the hook text.`;

      console.log('Sending request to OpenAI API');
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

      console.log(`Received response from OpenAI API for lens: ${lens}`);
      hooks[lens] = [response.data.choices[0].text.trim()];
    }

    console.log('Successfully generated all hooks');
    return {
      statusCode: 200,
      body: JSON.stringify(hooks)
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate hooks', details: error.message })
    };
  }
};
