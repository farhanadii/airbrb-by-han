import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from
  '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{
        mt: 8, display: 'flex', flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography component="h1" variant="h4">
                    Register
        </Typography>

        {error && <Alert severity="error" sx={{
          mt: 2, width: '100%'
        }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{
          mt: 3, width:
                        '100%'
        }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
                        Register
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
          >
                        Already have an account? Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
