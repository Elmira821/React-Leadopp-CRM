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
import { NegotiationUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';

const Negotiation: React.FC = () => {
  const [negotiationList, setNegotiationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNegotiationList();
  }, []);

  const fetchNegotiationList = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };

    try {
      const res = await fetchData(
        `${NegotiationUrl}/`,
        'GET',
        null as any,
        Header
      );
      if (!res.error) {
        setNegotiationList(res);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching negotiation list:', error);
      setLoading(false);
    }
  };

  return (
    <Box mt={4} mx={2}>
      <Typography variant="h5" gutterBottom>
        Negotiation List
      </Typography>
      {loading ? (
        <Typography>Loading negotiation list...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {negotiationList.map((negotiation) => (
                <TableRow key={negotiation.id}>
                  <TableCell>{negotiation.id}</TableCell>
                  <TableCell>{negotiation.title}</TableCell>
                  <TableCell>{negotiation.date}</TableCell>
                  <TableCell>{negotiation.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Negotiation;
