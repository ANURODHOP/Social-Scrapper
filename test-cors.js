const https = require('https');

const req = https.request('https://social-scrapper-beta.vercel.app/api/dashboard', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://social-scrapper-wa4g.vercel.app',
    'Access-Control-Request-Method': 'GET',
    'User-Agent': 'Node.js test script'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:');
  console.log(res.headers);
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();
