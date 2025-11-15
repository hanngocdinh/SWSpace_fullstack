const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'win_cli_' + Math.floor(Math.random()*10000),
        email: `win_cli_${Date.now()}@example.com`,
        password: 'password123',
        fullName: 'Win CLI',
        phone: '0909'
      })
    });
    const text = await res.text();
    console.log('status:', res.status);
    console.log(text);
    if (res.status === 201) {
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: JSON.parse(text).user.username, password: 'password123' })
      });
      const loginText = await loginRes.text();
      console.log('login status:', loginRes.status);
      console.log(loginText);
    }
  } catch (e) {
    console.error('request failed:', e.message);
  }
})();
