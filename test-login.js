const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with Hello123/password123...');
    
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'Hello123',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
