const fetch = require('node-fetch');

async function registerTestUser() {
  try {
    console.log('Registering test user...');
    
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'testuser@example.com',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        username: 'testuser',
        password: 'testpassword',
        accountType: 'checking'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('Now trying to log in with the new user...');
      
      const loginResponse = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpassword'
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', loginData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

registerTestUser();
