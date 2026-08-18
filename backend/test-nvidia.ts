import axios from 'axios';

async function testNvidia() {
  const apiKey = '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';
  
  // Create a dummy 1x1 white jpeg
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  
  const payload = {
    model: 'meta/llama-3.2-90b-vision-instruct',
    messages: [
      { role: 'user', content: [
        { type: 'text', text: 'What is this image?' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${dummyBase64}` } }
      ]}
    ],
    max_tokens: 100,
  };

  try {
    const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Success:", res.data.choices[0].message.content);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Error:", err.response?.status, err.response?.data);
    } else {
      console.error(err);
    }
  }
}

testNvidia();
