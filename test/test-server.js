const http = require('http');
const server = require('../server');

setTimeout(() => {
  http.get('http://localhost:3000/api/stats', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('API /api/stats status:', res.statusCode);
      const json = JSON.parse(data);
      console.log('Total incidents:', json.total);
      console.log('Critical incidents:', json.byRiskLevel.CRITICAL);
      console.log('High incidents:', json.byRiskLevel.HIGH);

      http.get('http://localhost:3000/index.html', (pageRes) => {
        console.log('GET /index.html status:', pageRes.statusCode);
        server.close(() => {
          console.log('Test completed and server closed successfully.');
          process.exit(0);
        });
      });
    });
  }).on('error', (e) => {
    console.error('Request error:', e);
    server.close();
    process.exit(1);
  });
}, 500);
