import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { onValue, ref } from 'firebase/database';
import { useAuth } from './AuthProvider';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const HistoryFragment = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      const histRef = ref(db, `history/${user.uid}`);
      onValue(histRef, (snapshot) => {
        const val = snapshot.val();
        if (val) setHistory(Object.values(val));
      });
    }
  }, [user]);

  return (
    <Container>
      <Typography variant="h5">Submission History</Typography>
      <List>
        {history.map((entry, i) => (
          <ListItem key={i}>
            <ListItemText primary={`Article: ${entry.text}`} secondary={`Verdict: ${entry.verdict}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default HistoryFragment;
