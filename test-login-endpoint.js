const fetch = require('node-fetch');

async function testLoginEndpoint() {
  try {
    console.log('Testing login endpoint with testuser/testpassword...');
    
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword'
      })
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('Login successful!');
      console.log('Access token:', data.tokens.accessToken);
      console.log('Refresh token:', data.tokens.refreshToken);
    } else {
      console.log('Login failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing login endpoint:', error);
  }
}

testLoginEndpoint();
