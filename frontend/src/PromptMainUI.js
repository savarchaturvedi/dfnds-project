import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress } from '@mui/material';
import './App.css';

const PromptMainUI = () => {
  const [text, setText] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setVerdict('');
    try {
      const response = await fetch('http://localhost:5000/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: text })
      });
      const data = await response.json();
      setVerdict(data.verdict.toUpperCase());
    } catch (e) {
      setVerdict('Error: Could not fetch result.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <div className="app-wrapper">
        <Typography variant="h4">🧠 DFNDS – Fake News Detection</Typography>
        <TextField multiline fullWidth rows={6} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste your news article here..." margin="normal" />
        <Button variant="contained" onClick={handleCheck} disabled={loading}>Analyze</Button>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {verdict && <Typography variant="h6" sx={{ mt: 3 }}>Verdict: {verdict}</Typography>}
      </div>
    </Container>
  );
};

export default PromptMainUI;
