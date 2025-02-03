import React, { useState } from 'react';
import './login.css';
import api from '../../api'; 
import  { Navigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await  api.post('/user/login',{
            email,
            password
        });
        const { accessToken, secretToken, user } = response.data.data;
        console.log("check user", accessToken, secretToken, user)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userDetail', JSON.stringify(user));
        console.log('Logged in successfully');

        setIsLoggedIn(true);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
  };

  if (loading) return <p>Loading...</p>;
  if(isLoggedIn) return <Navigate to='/mail/inbox' />;

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {error && <p>Error: {error.message}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autocomplete="email"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{textAlign: 'center', marginTop: '10px'}}>
          <button type="submit" style={{width:'35%', margin:'10px 110px'}}>Login</button>
          
          <a href='/signup' >Create a new account</a>
        </div>

      </form>
    </div>
  );
};

export default Login;
