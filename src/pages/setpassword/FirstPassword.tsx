import React, { useState, useEffect } from 'react';
import { SERVER, ChangePasswordUrl } from '../../services/ApiUrls';
import { Card, Typography, Box, TextField, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const FirstPassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate()

    const params = useParams();
    const token = params.token;

    const handleChangePassword = async () => {
        try {
            if (newPassword !== confirmPassword) {
                setErrorMessage("New password and confirm password don't match.");
                return;
            }

            // const token = localStorage.getItem('Token');
            if (!token) {
                setErrorMessage('No access token found.');
                return;
            }

            const response = await fetch(`${SERVER}${ChangePasswordUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log(data)
                throw new Error(data.new_password || data.old_password || 'Failed to change password.');
            }

            console.log('Password changed successfully:', data);
            setErrorMessage('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigate('/login');

        } catch (error: any) {
            console.error('Error changing password:', error.message);
            setErrorMessage(error.message);
        }
    };
    return(
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ mt: '20px', p: '20px', borderRadius: '7px', mb: '20px', backgroundColor: '#fff', width: '33%' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#1a3353f0', mb: '10px' }}>Password</Typography>
            <Box sx={{ mb: '20px', borderBottom: '1px solid lightgray', display: 'flex', flexDirection: 'row', alignItems: 'center' }}></Box>
            <TextField
                label="Current Password"
                variant="outlined"
                fullWidth
                sx={{ mb: '10px' }}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
                label="New Password"
                variant="outlined"
                fullWidth
                sx={{ mb: '10px' }}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
                label="Confirm Password"
                variant="outlined"
                fullWidth
                sx={{ mb: '20px' }}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errorMessage && <Typography color="error" sx={{ mb: '10px' }}>{errorMessage}</Typography>}
            <Button variant="contained" sx={{ color: 'black', backgroundColor: '#c7dde5' }} onClick={handleChangePassword}>
                Save
            </Button>
        </Card>
        </div>
    )
}

export default FirstPassword;