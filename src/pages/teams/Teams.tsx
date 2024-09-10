import React, { useState, useEffect } from 'react';
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SERVER, TeamsUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { DeleteModal } from '../../components/DeleteModal';
import AddTeamMember from './AddTeamMember';

interface UserDetails {
  email: string;
  first_name: string;
  profile_pic: string | null;
  last_name: string;
}

interface User {
  id: string;
  is_active: boolean;
  user_details: UserDetails;
  workload: string;
  expertise: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  users: User[];
  created_at: string;
  created_by: User;
  created_on_arrow: string;
}

const GetTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteRowModal, setDeleteRowModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [deleteUserModal, setDeleteUserModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const fetchTeams = async () => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Token or organization information is missing.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${SERVER}${TeamsUrl}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
          org: org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching teams: ${response.statusText}`);
      }

      const data = await response.json();
      setTeams(data.teams);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onDelete = async (id: string) => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Token or organization information is missing.');
      return;
    }

    try {
      const response = await fetch(`${SERVER}${TeamsUrl}${id}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
          org: org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting team: ${response.statusText}`);
      }

      fetchTeams();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const onDeleteUser = async (teamId: string, userId: string) => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Token or organization information is missing.');
      return;
    }

    try {
      const response = await fetch(`${SERVER}${TeamsUrl}${teamId}/user/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token,
          'org': org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error removing user: ${response.statusText}`);
      }
      
      fetchTeams();
      window.location.reload();

      const data = await response.json();
      if (response.ok) {
        setMessage('User removed from team successfully.');
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error: any) {
      setMessage('Failed to remove user. Please try again later.');
    }
  };

  
  const deleteRow = (deleteId: string) => {
    setDeleteRowModal(true);
    setSelectedId(deleteId);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };

  const DeleteItem = async () => {
    await onDelete(selectedId);
    deleteRowModalClose();
  };

  const deleteUser = (teamId: string, userId: string) => {
    setDeleteUserModal(true);
    setSelectedUserId(userId);
    setSelectedTeamId(teamId);
  };

  const deleteUserModalClose = () => {
    setDeleteUserModal(false);
    setSelectedUserId('');
    setSelectedTeamId('');
  };

  const DeleteUserItem = async () => {
    try {
      if (selectedUserId && selectedTeamId) {
        await onDeleteUser(selectedTeamId, selectedUserId);
        deleteUserModalClose();
      } else {
        setError('User ID or Team ID is missing.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box mt={4}>
      {teams.map((team) => (
        <Paper
          key={team.id}
          elevation={0}
          style={{
            padding: '15px',
            marginBottom: '16px',
            marginLeft: '24px',
            marginRight: '24px',
          }}
        >
          <Typography variant="h5" gutterBottom>
            {team.name}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Description: {team.description}
          </Typography>
          <IconButton onClick={() => deleteRow(team.id)}>
            <DeleteIcon />
          </IconButton>
          <IconButton>
          <AddTeamMember/>
          </IconButton>
                     
          <Divider style={{ margin: '16px 0' }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Email Address</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Team member</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>User's status</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Workload</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Expertise</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team.users.length > 0 ? (
                  team.users.map((user, userIndex) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={user.user_details.profile_pic || ''}
                            style={{ marginRight: '10px' }}
                          >
                            {!user.user_details.profile_pic && <Avatar />}
                          </Avatar>
                          {user.user_details.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.user_details.first_name || user.user_details.last_name
                          ? `${user.user_details.first_name ?? ''} ${user.user_details.last_name ?? ''}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>{user.workload}</TableCell>
                      <TableCell>{user.expertise}</TableCell>
                      <TableCell>
                        {/* <IconButton>
                          <EditIcon />
                        </IconButton> */}
                        <IconButton onClick={() => deleteUser(team.id, user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2">No users in this team.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
      <DeleteModal
        onClose={deleteRowModalClose}
        open={deleteRowModal}
        id={selectedId}
        modalDialog="Are you sure you want to delete this team?"
        modalTitle="Delete Team"
        DeleteItem={DeleteItem}
      />
      <DeleteModal
        onClose={deleteUserModalClose}
        open={deleteUserModal}
        id={selectedUserId}
        modalDialog="Are you sure you want to delete this user?"
        modalTitle="Delete User"
        DeleteItem={DeleteUserItem}
      />
      {message && <Typography variant="body2">{message}</Typography>}
    </Box>
  );
};

export default GetTeams;
