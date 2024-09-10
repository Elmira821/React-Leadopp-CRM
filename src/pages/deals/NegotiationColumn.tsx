import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import {
    LeadUrl,
    ProfileUrl,
    SERVER,
} from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import PipelineCard from './Card';
import '../../styles/style.css';
import { useNavigate } from 'react-router-dom';

const NegotiationColumn: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [leads, setLeads] = useState<any[]>([]);
    const [contacts, setContacts] = useState([]);
    const [status, setStatus] = useState([]);
    const [source, setSource] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [countries, setCountries] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const filterLeadsByStatus = (status: string) => {
        return leads.filter((lead) => lead.status === status);
    };
    const [userRole, setUserRole] = useState<string>(
        localStorage.getItem('role') || ''
    );
    const [profileId, setProfileId] = useState<string>('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('Token');
            const org = localStorage.getItem('org');

            if (!token || !org) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${SERVER}${ProfileUrl}/`, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        org: org,
                        Authorization: token,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching profile: ${response.statusText}`);
                }

                const profileData = await response.json();
                console.log(profileData);
                setProfileId(profileData.user_obj.id);
                setUserRole(profileData.user_obj.role);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [profileId]);

    const columnStyle: React.CSSProperties = {
        display: 'flex',
        gap: '0',
        flex: 1,
        margin: '0 -2%',
        border: 0,
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'column',
    };

    const headerStyleBase: React.CSSProperties = {
        paddingLeft: '18%',
        padding: '9px',
        color: 'white',
        position: 'relative',
        clipPath: 'polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)',
        cursor: 'pointer',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
        letterSpacing: '2px',
        height: '50px',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const getColorForProbability = (probability: number) => {
        if (probability <= 20) return '#da2700'; // Red
        if (probability <= 40) return '#fe8701'; // Orange
        if (probability <= 60) return '#fcf000'; // Yellow
        if (probability <= 80) return '#87ea00'; // Light green
        return '#00b308'; // Green
    };

    const handleHeaderClick = (component: string) => {
        navigate(`/app/deals/${component}`);
    };

    useEffect(() => {
        getLeads();
    }, [userRole, profileId, currentPage]);

    const getLeads = async () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token') || '',
            org: localStorage.getItem('org') || '',
        };

        try {
            let url = `${LeadUrl}/?status=negotiation`;
            
            // User-specific logic
            if (userRole !== 'ADMIN') {
              url += `&assigned_to=${profileId}`;
            }
        
            const res = await fetchData(url, 'GET', null as any, Header);

            if (!res.error) {
                setLeads(res?.open_leads?.open_leads || []);
                setContacts(res?.contacts || []);
                setStatus(res?.status || []);
                setSource(res?.source || []);
                setCompanies(res?.companies || []);
                setTags(res?.tags || []);
                setUsers(res?.users || []);
                setCountries(res?.countries || []);
                setIndustries(res?.industries || []);

                // Set pagination state if provided
                if (res?.pagination) {
                    setCurrentPage(res?.pagination.currentPage || 1);
                    setTotalPages(res?.pagination.totalPages || 1);
                }

            }
            setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false); // Set loading to false even if there's an error
        }
    };

    return (
        <div style={columnStyle}>
            <div
                style={{ ...headerStyleBase, backgroundColor: '#0e458b' }}
                onClick={() => handleHeaderClick('Negotiation')}
            >
                Negotiation
            </div>
            {leads.length > 0 ? (
                leads.map((negotiation) => (
                    <PipelineCard
                        key={negotiation?.id}
                        leadId={negotiation?.id}
                        title={negotiation?.account_name}
                        content={
                            <>
                                <div>
                                    Value:{' '}
                                    <span
                                        style={{
                                            color: '#1a3353',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                        }}
                                    >
                                        {negotiation.opportunity_amount
                                            ? `€${parseFloat(
                                                negotiation.opportunity_amount
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`
                                            : '---'}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '10px',
                                    }}
                                >
                                    Assignee:&nbsp;{' '}
                                    {negotiation.assigned_to?.[0]?.user_details
                                        ?.profile_pic ? (
                                        <Avatar
                                            alt="Profile Picture"
                                            src={
                                                negotiation.assigned_to?.[0]?.user_details
                                                    ?.profile_pic
                                            }
                                            style={{ marginRight: '8px' }}
                                        />
                                    ) : (
                                        <Avatar alt="Profile Initial">
                                            {negotiation.assigned_to?.[0]?.user_details?.first_name?.charAt(
                                                0
                                            )}
                                        </Avatar>
                                    )}
                                    <span
                                        style={{
                                            color: '#1a3353',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                        }}
                                    >
                                        &nbsp;
                                        {negotiation.assigned_to?.[0]?.user_details
                                            ?.first_name &&
                                            negotiation.assigned_to?.[0]?.user_details
                                                ?.last_name
                                            ? `${negotiation.assigned_to[0].user_details.first_name} ${negotiation.assigned_to[0].user_details.last_name}`
                                            : negotiation.assigned_to?.[0]?.user_details
                                                ?.email || 'Unassigned'}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '10px',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <span>Probability:&nbsp;</span>
                                    <div
                                        style={{
                                            flexGrow: 1,
                                            height: '10px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '5px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${negotiation.probability || 0}%`,
                                                backgroundColor: getColorForProbability(
                                                    negotiation.probability || 0
                                                ),
                                                transition: 'width 0.5s ease',
                                            }}
                                        />
                                    </div>
                                    <span
                                        style={{
                                            color: '#1a3353',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            marginLeft: '10px',
                                        }}
                                    >
                                        {negotiation.probability || '---'}%
                                    </span>
                                </div>
                            </>
                        }
                    />
                ))
            ) : (
                <div>{/*<p>No negotiations available</p> */}</div>
            )}
        </div>
    );
};

export default NegotiationColumn;
