const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with testuser/testpassword...');
    
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
      
      // Now try to access the dashboard with the token
      const dashboardResponse = await fetch('http://localhost:5000/dashboard', {
        headers: {
          'Authorization': `Bearer ${data.tokens.accessToken}`,
          'Cookie': `accessToken=${data.tokens.accessToken}; refreshToken=${data.tokens.refreshToken}; user=${JSON.stringify(data.user)}`
        }
      });
      
      console.log('Dashboard response status:', dashboardResponse.status);
      if (dashboardResponse.ok) {
        console.log('Dashboard access successful!');
      } else {
        console.log('Dashboard access failed!');
      }
    } else {
      console.log('Login failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
