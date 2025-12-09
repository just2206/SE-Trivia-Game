import React, { useState } from 'react';

function LoginScreen({ title, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would involve API calls for authentication
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <div className="login-screen">
      <h1>Welcome to {title}!</h1>
      <div className="ui-block">
        <h2>User Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            className="text-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            className="text-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn small-btn">Sign in</button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
