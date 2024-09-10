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
import { QualifiedUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';

const Qualified: React.FC = () => {
  const [qualifiedList, setQualifiedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualifiedList();
  }, []);

  const fetchQualifiedList = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };

    try {
      const res = await fetchData(
        `${QualifiedUrl}/`,
        'GET',
        null as any,
        Header
      );
      if (!res.error) {
        setQualifiedList(res);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching qualified list:', error);
      setLoading(false);
    }
  };

  return (
    <Box mt={4} mx={2}>
      <Typography variant="h5" gutterBottom>
        Qualified List
      </Typography>
      {loading ? (
        <Typography>Loading qualified list...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Description of Services</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Offer Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualifiedList.map((qualified) => (
                <TableRow key={qualified.id}>
                  <TableCell>{qualified.id}</TableCell>
                  <TableCell>{qualified.lead}</TableCell>
                  <TableCell>{qualified.description_of_services}</TableCell>
                  <TableCell>{qualified.notes}</TableCell>
                  <TableCell>{qualified.offer_value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Qualified;
