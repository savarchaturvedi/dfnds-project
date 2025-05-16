import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

const App = () => {
  const [headline, setHeadline] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!headline.trim()) return;

    setLoading(true);
    setResult('');
    setScore(null);

    try {
      const response = await fetch(
        'https://qje5dco2fuq73nuwxl4rbc3tu40teitq.lambda-url.us-east-1.on.aws/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: headline }),
        }
      );

      const raw = await response.json();
      console.log('Full response from backend:', raw);

      // No need to parse raw.body — it's already a JSON object
      if (raw && raw.verdict && raw.score !== undefined) {
        const verdict = raw.verdict === 'POSITIVE' ? 'REAL' : 'FAKE';
        const confidence = raw.score;

        setResult(verdict);
        setScore(confidence);
      } else {
        console.error('Unexpected response structure:', raw);
        setResult('Model returned no verdict.');
      }
    } catch (error) {
      console.error('Error contacting backend:', error);
      setResult('Error contacting model.');
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Fake News Detector
      </Typography>

      <TextField
        label="Enter News Headline or Text"
        fullWidth
        multiline
        rows={3}
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        margin="normal"
      />

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'CHECK'}
        </Button>
      </Box>

      {result && (
        <Typography
          variant="h6"
          sx={{
            mt: 4,
            textAlign: 'center',
            color:
              result === 'REAL' ? 'green' : result === 'FAKE' ? 'red' : 'black',
          }}
        >
          Verdict: <strong>{result}</strong>
          {score !== null && (
            <span> (Confidence: {(score * 100).toFixed(2)}%)</span>
          )}
        </Typography>
      )}
    </Container>
  );
};

export default App;
