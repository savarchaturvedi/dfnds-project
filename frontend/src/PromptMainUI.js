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
      const response = await fetch('https://qje5dco2fuq73nuwxl4rbc3tu40teitq.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: text })
      });

      const responseText = await response.text();
      console.log("Raw Lambda response:", responseText);

      let outer = {};
      try {
        outer = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing outer response JSON:", e);
        setVerdict("Invalid server response.");
        return;
      }

      let inner = {};
      try {
        inner = JSON.parse(outer.body);
      } catch (e) {
        console.error("Error parsing inner body string:", e);
        setVerdict("Failed to interpret model output.");
        return;
      }

      const finalVerdict = inner.verdict;
      if (finalVerdict) {
        setVerdict(finalVerdict.toUpperCase());
      } else {
        setVerdict("Model returned no verdict.");
      }

    } catch (e) {
      console.error("Fetch error:", e);
      setVerdict('Error: Could not fetch result.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <div className="app-wrapper">
        <Typography variant="h4">DFNDS – Fake News Detection</Typography>
        <TextField
          multiline
          fullWidth
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your news article here..."
          margin="normal"
        />
        <Button variant="contained" onClick={handleCheck} disabled={loading}>
          Analyze
        </Button>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {verdict && (
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verdict: {verdict}
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default PromptMainUI;
