import React, { useState, useEffect } from 'react';
import {
    Card,
    Box,
    Typography,
    Avatar,
    CircularProgress,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { SERVER, ProfileUrl, TeamsUrl } from '../../services/ApiUrls';
import { FaUsers } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';

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

interface User {
    is_active: boolean;
    user_details: UserDetails;
    workload: string;
    expertise: string;
    phone: string;
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

export function UserTeams() {
    const [userProfile, setUserProfile] = useState<UserObj | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        }
    };

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

    const userTeams = teams.filter(team =>
        team.users.some(user => user.user_details.email === userProfile?.user_details.email)
    );

    useEffect(() => {
        fetchUserProfile();
        fetchTeams();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (userTeams.length === 0) {
        return (
            <Card sx={{ mt: '20px', ml: '20px', p: '20px', borderRadius: '7px', mb: '20px', backgroundColor: '#fff', width: '66%' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#1a3353f0', mb: '10px' }}>
                My Teams
            </Typography>
            <Divider sx={{ mb: '20px' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                    <FaUsers style={{fontSize: '5rem', color: "gray"}} />
                    <Typography sx={{ mt: '20px', color: 'gray' }}>
                        You are not part of any teams yet.
                    </Typography>
                </Box>
            </Card>
        );
    }

    return (

        <Card sx={{ mt: '20px', ml: '20px', p: '20px', borderRadius: '7px', mb: '20px', backgroundColor: '#fff', width: '66%' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#1a3353f0', mb: '10px' }}>
                My Teams
            </Typography>
            <Divider sx={{ mb: '20px' }} />
            {userTeams.map(team => (
                <Accordion key={team.id} defaultExpanded={false} sx={{ mb: '15px' }}>
                    <AccordionSummary
                        expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                        aria-controls={`panel-${team.id}-content`}
                        id={`panel-${team.id}-header`}
                    >
                        <Typography sx={{ fontWeight: 'bold', color: '#545454' }}>
                            {team.name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {team.users.length > 0 ? (
                            team.users.map((user, userIndex) => (
                                <Accordion key={userIndex} sx={{ boxShadow: 'none', mb: '10px' }}>
                                <AccordionSummary
                                    expandIcon={<FiChevronDown style={{ fontSize: '20px' }} />}
                                    aria-controls={`panel-${team.id}-${userIndex}-content`}
                                    id={`panel-${team.id}-${userIndex}-header`}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Avatar
                                            src={user.user_details.profile_pic || ''}
                                            sx={{ width: 28, height: 28, mr: '10px' }}
                                        >
                                            {!user.user_details.profile_pic && <Avatar />}
                                        </Avatar>
                                        <Typography>
                                            {user.user_details.first_name || user.user_details.last_name
                                                ? `${user.user_details.first_name ?? ''} ${user.user_details.last_name ?? ''}`
                                                : user.user_details.email}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ padding: '0 20px' }}>
                                    <Typography sx={{ display: 'flex', alignItems: 'flex-start', }}>
                                    <strong> <FiPhone style={{ fontSize: '20px', color: '#1976d2', marginLeft: '30px' }}/> </strong> &nbsp; {user.phone}
                                    <strong> <FiMail style={{ fontSize: '20px', color: '#1976d2', marginLeft: '30px' }}/> </strong> &nbsp; {user.user_details.email}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                            ))
                        ) : (
                            <Typography>No members in this team.</Typography>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Card>
    );
}
