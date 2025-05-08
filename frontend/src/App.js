import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';

const App = () => {
  const [headline, setHeadline] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!headline.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('http://localhost:5000/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: headline }),
      });
      const data = await response.json();
      setResult(data.verdict.toUpperCase());
    } catch (error) {
      setResult('Error contacting the model.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Fake News Detector</Typography>
      <TextField
        label="Enter News Headline or Text"
        fullWidth
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        margin="normal"
      />
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Check'}
        </Button>
      </Box>
      {result && (
        <Typography variant="h6" sx={{ mt: 3, textAlign: 'center' }}>
          Verdict: <strong>{result}</strong>
        </Typography>
      )}
    </Container>
  );
};

export default App;
