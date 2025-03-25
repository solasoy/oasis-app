const https = require('http');

const data = JSON.stringify({
  participantId: '8683a707-7ce9-4e0f-8e13-95c809f31499'
});

const options = {
  hostname: 'localhost',
  port: 3012,
  path: '/api/admin/send-welcome-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();