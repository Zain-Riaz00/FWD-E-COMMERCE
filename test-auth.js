async function testAuth() {
  try {
    console.log('Testing health endpoint...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('Health:', healthData);
    
    console.log('\nTesting register endpoint...');
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'test123'
      })
    });
    const registerData = await registerRes.json();
    console.log('Register:', registerData);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();
