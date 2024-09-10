import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Select,
  MenuItem,
  Box,
  Grid,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SelectChangeEvent, Divider } from '@mui/material'
import { InvitationUrl } from '../services/ApiUrls';
import { fetchData } from './FetchData';

interface Role {
  value: string;
  label: string;
}

interface Teammate {
  email: string;
  roles: string[];
}

interface InviteTeammatesProps {
  // Add any additional props you might need for the component
}

const InviteTeammates: React.FC<InviteTeammatesProps> = () => {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'User' },
  ]);

  const [isSent, setIsSent] = useState(false)

  const handleAddTeammate = () => {
    setTeammates([...teammates, { email: '', roles: ['USER'] }]);
  };

  /*  const handleEmailChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.target instanceof HTMLInputElement) {
        // Handle input element event (update email)
      } else if (event.target instanceof HTMLTextAreaElement) {
        // Handle textarea element event (might not be relevant for email)
      }
    }; */

  const handleRoleChange = (index: number, event: SelectChangeEvent<string[]>) => {
    const updatedRoles = Array.isArray(event.target.value) ? event.target.value : [event.target.value]; // Ensure roles is always an array
    setTeammates(
      teammates.map((teammate, i) => (i === index ? { ...teammate, roles: updatedRoles } : teammate))
    );
  };

  let token = localStorage.getItem('Token')?.split(' ')[1]

  useEffect(() => {
    const invitation = () => {
      for (let i = 0; i < teammates.length; i++) {
        if (teammates[i].email) {
          console.log(teammates[i])
          const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
          const Body = {
            org: localStorage.getItem('org'),
            role: teammates[i].roles[0],
            inviter: localStorage.getItem('current_user_id'),
            invitee_email: teammates[i].email
          }
          console.log(Body);

          fetchData(`${InvitationUrl}`, 'POST', JSON.stringify(Body), Header)
            .then((res: any) => {
              console.log(res, 'res');
              if (!res.error) {
                const data = res?.data

              }
            })
        }
      }
    }
    invitation();
    setTeammates([]); // Clear teammates list after sending
  }, [isSent])

  const handleSendInvitations = async () => {
    // Implement logic to send invitations to email addresses with selected roles
    // This might involve sending emails or API calls to your backend
    console.log('Sending invitations:', teammates);
    setIsSent(!isSent)
  };

  return (
    <Box sx={{ mt: '24px', width: '50%', mx: '24px', mr: '24px', p: 3, borderRadius: 1, boxShadow: 2, backgroundColor: 'white' }}>
      <Typography className="accordion-header">
        Access Control Panel
      </Typography>
      <div style={{ marginTop: '20px', }}>
        <Divider className="divider" />
      </div>
      <Box sx={{ mt: '40px', maxWidth: '100%', mx: 'auto', ml: '0', p: 3, borderRadius: 2, textAlign: 'left' }}>
        <div style={{ marginTop: '20px', }}> </div>
        <Typography mt="-60px" variant="h6" component="h1" gutterBottom textAlign="left" sx={{ fontWeight: 'bold' }}>Invite New Users </Typography>
        {teammates.map((teammate, index) => (
          <Grid container spacing={2} alignItems={"center"} key={index} sx={{ mb: 2 }}>
            <Grid item xs={ 8 }>
              <TextField
                label="Teammate's Email"
                onChange={(event) => teammate.email = event.target.value}
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`role-select-label-${index}`}>Role</InputLabel>
                <Select
                  labelId={`role-select-label-${index}`}
                  id={`role-select-${index}`}
                  value={teammate.roles}
                  label="Role"
                  onChange={(event) => handleRoleChange(index, event)}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ))}
        <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ mb: 2 }}>
          <Button variant="text" onClick={handleAddTeammate} startIcon={<AddIcon />} color='primary' sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Add User
          </Button>
        </Box>
        <Button variant="contained" onClick={handleSendInvitations} disabled={teammates.length === 0} fullWidth>
          Send Invitations
        </Button>
      </Box>
    </Box>
  );
};

export default InviteTeammates;

