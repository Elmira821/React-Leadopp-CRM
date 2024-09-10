import { SERVER, ProfileUrl } from '../../services/ApiUrls';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Avatar, CircularProgress, Box, Stack } from '@mui/material';
import { CustomToolbar } from '../../styles/CssStyled';
import ChangePassword from '../auth/ChangePassword';
import { Link } from 'react-router-dom';
import { UserTeams } from './UserTeams';

interface UserDetails {
    email: string;
    is_active: boolean;
    profile_pic: string | null;
    first_name: string;
    last_name: string;
    job_title: string;
}

interface Address {
    id: string;
    created_at: string;
    updated_at: string;
    address_line: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

interface UserObj {
    id: string;
    user_details: UserDetails;
    role: string;
    address: Address;
    has_marketing_access: boolean;
    has_sales_access: boolean;
    phone: string;
    date_of_joining: string | null;
    is_active: boolean;
}

export function UserProfile() {
    const [userProfile, setUserProfile] = useState<UserObj | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('Token');
            const org = localStorage.getItem('org');

            if (!token || !org) {
                setError('Missing token or organization ID in localStorage');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${SERVER}${ProfileUrl}/`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'org': org,
                        'Authorization': token,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching profile: ${response.statusText}`);
                }

                const data = await response.json();
                setUserProfile(data.user_obj);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!userProfile) {
        return <Typography>No user profile found</Typography>;
    }

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomToolbar sx={{ flexDirection: 'row-reverse' }}>
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Button
                        variant='contained'
                        className={'add-button'}
                        component={Link}
                        to={`/app/profile/edit/${userProfile.id}`}
                    >
                        Edit profile
                    </Button>
                </Stack>
            </CustomToolbar>

            <Box sx={{ mt: '10px', p: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box sx={{ width: '100%' }}>

                    <Card sx={{ borderRadius: '7px' }}>
                        <Box sx={{ p: '20px', borderBottom: '1px solid lightgray', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography style={{ fontWeight: 600, fontSize: '18px', color: '#1a3353f0' }}>My profile</Typography>
                        </Box>
                        <Box sx={{ p: '20px', borderBottom: '1px solid lightgray', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar src={userProfile.user_details.profile_pic || ''} alt="Profile Picture" sx={{ width: 160, height: 160, mr: '20px' }} />
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600 }}>{userProfile.user_details.first_name || '---'} {userProfile.user_details.last_name || '---'}</Typography>
                                <Typography sx={{ fontSize: '22px', color: 'gray', mb: '10px' }}>{userProfile.user_details.job_title || '---'}</Typography>
                                <Box sx={{ backgroundColor: '#4f575b', color: 'white', px: '10px', py: '5px', borderRadius: '4px', display: 'inline-block' }}>
                                    <Typography variant="body2">{userProfile.role || '---'}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ p: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: '15px' }}>
                            <Box sx={{ width: '32%' }}>
                                <Typography className="title2">Email</Typography>
                                <Typography className="title3">{userProfile.user_details.email || '---'}</Typography>
                            </Box>
                            <Box sx={{ width: '32%' }}>
                                <Typography className="title2">Mobile Number</Typography>
                                <Typography className="title3">{userProfile.phone || '---'}</Typography>
                            </Box>
                            <Box sx={{ width: '32%' }}>
                                <Typography className="title2">Date of joining</Typography>
                                <Typography className="title3">{userProfile.date_of_joining || '---'}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: '15px' }}>
                            <Box sx={{ p: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">Address Line</Typography>
                                    <Typography className="title3">{userProfile?.address?.address_line || '---'}</Typography>
                                </Box>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">Street</Typography>
                                    <Typography className="title3">{userProfile?.address?.street || '---'}</Typography>
                                </Box>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">City</Typography>
                                    <Typography className="title3">{userProfile?.address?.city || '---'}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: '15px' }}>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">Postcode</Typography>
                                    <Typography className="title3">{userProfile?.address?.postcode || '---'}</Typography>
                                </Box>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">State</Typography>
                                    <Typography className="title3">{userProfile?.address?.state || '---'}</Typography>
                                </Box>
                                <Box sx={{ width: '32%' }}>
                                    <Typography className="title2">Country</Typography>
                                    <Typography className="title3">{userProfile?.address?.country || '---'}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>

                        <ChangePassword />

                        <UserTeams />
                       
                    </div>
                </Box>
            </Box >
        </Box>
    );
}