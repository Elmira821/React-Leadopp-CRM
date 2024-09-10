import React, { useState, useEffect, FormEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  FormControl,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

import { SERVER, TeamsUrl, UsersUrl } from '../../services/ApiUrls';

interface User {
  id: string;
  email: string;
}

interface TeamData {
  name: string;
  description?: string;
  created_at?: string;
  created_by?: string;
  created_on_arrow?: string;
  users?: string[];
}

const AddTeam: React.FC = () => {
  const [teamName, setTeamName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');

      if (!token || !org) {
        setError('Missing token or organization ID in localStorage');
        return;
      }

      try {
        const response = await fetch(`${SERVER}${UsersUrl}/?offset=0&limit=1000`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token,
            org: org,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching users');
        }

        const userData = await response.json();
        console.log('Fetched Users:', userData);

        if (!userData.error) {
          const activeUsers = userData?.active_users?.active_users || [];
          const inactiveUsers = userData?.inactive_users?.inactive_users || [];
          const allUsers = [...activeUsers, ...inactiveUsers].map((user: any) => ({
            id: user.id,
            email: user.user_details?.email,
          }));
          setUsers(allUsers);
        } else {
          setError(userData.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('An error occurred while fetching users.');
      }
      setLoading(false);
    };

    fetchAllUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Missing token or organization ID in localStorage');
      return;
    }

    const data: TeamData = {
      name: teamName,
      description: description,
      users: assignedUsers.map(user => user.id),
    };

    try {
      const response = await fetch(`${SERVER}${TeamsUrl}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
          org: org,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.errors);
        setSuccess(null);
      } else {
        setSuccess(result.message);
        setError(null);

        // Reset form fields
        setTeamName('');
        setDescription('');
        setAssignedUsers([]);
        window.location.reload();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setSuccess(null);
    }
  };

  return (
    <Box sx={{ mt: '0px', mx: '24px', p: 3, borderRadius: 1, backgroundColor: 'white', width: '100%', marginLeft: '0px', }}>
      <Box sx={{ mt: '60px', maxWidth: '700px', mx: 'auto', p: 3, borderRadius: 2, textAlign: 'left' ,}}>
        <Typography mt="-60px" variant="h6" component="h1" gutterBottom textAlign="left" sx={{ fontWeight: 'bold' }}>
          Users Control Panel
        </Typography>
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="primary">{success}</Typography>}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Team Name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        multiple
                        id="assign-to"
                        options={users}
                        getOptionLabel={(option) => option.email}
                        value={assignedUsers}
                        onChange={(event, newValue) => {
                          setAssignedUsers(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Add team members"
                            placeholder="Add User"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Button variant="contained" type="submit" fullWidth>
                  Add Team
                </Button>
              </form>
            )}
      </Box>
    </Box>
  );
};

export default AddTeam;
