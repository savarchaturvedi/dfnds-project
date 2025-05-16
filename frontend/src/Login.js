import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      console.error('Login error', error);
    }
  };

  return (
    <Container sx={{ mt: 10 }}>
      <Typography variant="h4">Login to DFNDS</Typography>
      <Button variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>Login with Google</Button>
    </Container>
  );
};

export default Login;
