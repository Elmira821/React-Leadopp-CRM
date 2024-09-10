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
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const LeadsColumn: React.FC = () => {
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

    const firstHeaderStyleBase: React.CSSProperties = {
        textAlign: 'center',
        paddingLeft: '18%',
        padding: '9px',
        color: 'white',
        position: 'relative',
        clipPath: 'polygon(75% 0%,100% 50%,75% 100%,0% 100%,0% 51%,0% 0%)',
        cursor: 'pointer',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
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
            let url = `${LeadUrl}/?status=lead`;
            
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

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        const token = localStorage.getItem('Token');
        const org = localStorage.getItem('org');

        if (!token || !org) {
            throw new Error('Authorization or organization details missing');
        }

        // Prepare the updated lead data
        const updatedLeadData = {
            status: newStatus,
        };

        // Send the updated lead data to the server
        const response = await fetchData(
            `${LeadUrl}/${leadId}/`,
            'PUT',
            JSON.stringify(updatedLeadData),
            {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                org: org,
            }
        );

        if (response.error) {
            throw new Error(`Failed to update lead status: ${response.error}`);
        }

        return response;
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const updatedLeads = Array.from(leads);
        const [movedLead] = updatedLeads.splice(source.index, 1);
        movedLead.status = destination.droppableId;
        updatedLeads.splice(destination.index, 0, movedLead);

        // Update local state
        setLeads(updatedLeads);

        try {
            // Update lead status on the server
            await updateLeadStatus(movedLead.id, destination.droppableId);
        } catch (error) {
            console.error('Error updating lead status on the server:', error);
            // Optionally revert the local changes or show an error message to the user
            // For example, you might want to revert the state change in case of an error
            setLeads(leads);
        }
    };


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Leads Column */}
            <Droppable droppableId="lead">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={columnStyle}
                    >
                        <div
                            style={{
                                ...firstHeaderStyleBase,
                                backgroundColor: '#87c7e5',
                                marginLeft: '30px',
                            }}
                            onClick={() => handleHeaderClick('Leads')}
                        >
                            <span style={{ marginRight: '15%' }}>Leads</span>
                        </div>
                        {leads && leads.length > 0 ? (
                            leads.map(
                                (lead, index) => (
                                    <Draggable
                                        key={lead.id}
                                        draggableId={lead.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <PipelineCard
                                                    key={lead.id}
                                                    leadId={lead?.id}
                                                    title={lead.account_name}
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
                                                                    {lead.opportunity_amount
                                                                        ? `€${parseFloat(
                                                                            lead.opportunity_amount
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
                                                                {lead.assigned_to?.[0]?.user_details
                                                                    ?.profile_pic ? (
                                                                    <Avatar
                                                                        alt="Profile Picture"
                                                                        src={
                                                                            lead.assigned_to?.[0]?.user_details
                                                                                ?.profile_pic
                                                                        }
                                                                        style={{ marginRight: '8px' }}
                                                                    />
                                                                ) : (
                                                                    <Avatar alt="Profile Initial">
                                                                        {lead.assigned_to?.[0]?.user_details?.first_name?.charAt(
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
                                                                    {lead.assigned_to?.[0]?.user_details
                                                                        ?.first_name &&
                                                                        lead.assigned_to?.[0]?.user_details?.last_name
                                                                        ? `${lead.assigned_to[0].user_details.first_name} ${lead.assigned_to[0].user_details.last_name}`
                                                                        : lead.assigned_to?.[0]?.user_details
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
                                                                            width: `${lead.probability || 0}%`,
                                                                            backgroundColor: getColorForProbability(
                                                                                lead.probability || 0
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
                                                                    {lead.probability || '---'}%
                                                                </span>
                                                            </div>
                                                        </>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                        ) : (
                            <div>{/* <p>No leads available</p> */}</div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default LeadsColumn;
