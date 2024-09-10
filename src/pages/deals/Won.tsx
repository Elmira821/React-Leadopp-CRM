import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { WonUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';

const Won: React.FC = () => {
  const [wonList, setWonList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWonList();
  }, []);

  const fetchWonList = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };

    try {
      const res = await fetchData(`${WonUrl}/`, 'GET', null as any, Header);
      if (!res.error) {
        setWonList(res);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching won list:', error);
      setLoading(false);
    }
  };

  return (
    <Box mt={4} mx={2}>
      <Typography variant="h5" gutterBottom>
        Won List
      </Typography>
      {loading ? (
        <Typography>Loading won list...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Stage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wonList.map((won) => (
                <TableRow key={won.id}>
                  <TableCell>{won.id}</TableCell>
                  <TableCell>{won.title}</TableCell>
                  <TableCell>{won.amount}</TableCell>
                  <TableCell>{won.stage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Won;
