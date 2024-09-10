import React, { useEffect, useState } from 'react';
import {
    Card,
    Box,
    Button,
} from '@mui/material';
import { CustomAppBar } from '../../components/CustomAppBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { InteractionsUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { IoMdCall, IoMdPeople } from 'react-icons/io';
import { MdOutlineMarkEmailRead, MdOutlineTaskAlt } from 'react-icons/md';

type UserDetails = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
};

interface Contact {
    id: string;
    first_name: string;
    last_name: string;
}

interface Lead {
    id: string;
    account_name: string;
}

type InteractionDetailsResponse = {
    id: string;
    user: UserDetails;
    created_at: string;
    updated_at: string;
    duration?: string;
    start_at?: string;
    end_at?: string;
    type: string;
    interact_with: Lead;
    contact: Contact;
    description?: string;
};

const typeIcons: { [key: string]: JSX.Element } = {
    'Call': <IoMdCall />,
    'Email': <MdOutlineMarkEmailRead />,
    'Meeting': <IoMdPeople />,
    'Task': <MdOutlineTaskAlt />
};

export const formatDate = (dateString: any): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    };
    return new Date(dateString).toLocaleString(undefined, options);
}

export default function InteractionDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [interactionDetails, setInteractionDetails] = useState<InteractionDetailsResponse | null>(null);

    useEffect(() => {
        getInteractionDetail(state.interactionId);
    }, [state.interactionId]);

    const getInteractionDetail = (id: string) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token') || '',
            org: localStorage.getItem('org') || '',
        };
        fetchData(`${InteractionsUrl}/${id}/`, 'GET', null as any, Header).then(
            (res) => {
                if (!res.error) {
                    setInteractionDetails(res);
                }
            }
        );
    };

    const backbtnHandle = () => {
        navigate('/app/interactions');
    };

    const editHandle = () => {
        navigate('/app/interactions/edit-interaction', {
            state: {
                value: {
                    user_first_name: interactionDetails?.user.first_name,
                    user_last_name: interactionDetails?.user.last_name,
                    start_at: interactionDetails?.start_at,
                    end_at: interactionDetails?.end_at,
                    type: interactionDetails?.type,
                    interact_with: interactionDetails?.interact_with.id,
                    contact: interactionDetails?.contact.id,
                    description: interactionDetails?.description,
                    user_id: interactionDetails?.user.id,
                },
                id: state?.interactionId,
                contacts: state?.contacts || [],
                leads: state?.leads || [],
                users: state?.users || []
            },
        });
    };

    const module = 'Interactions';
    const crntPage = 'Interaction Detail';
    const backBtn = 'Back To Interactions';

    function formatDuration(durationInSeconds: any): string {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        return `${hours > 0 ? `${hours} hours ` : ''}${minutes} minutes`;
    }

    const contactHandle = (contactId: any) => {
        navigate(`/app/contacts/contact-details`, { state: { contactId, detail: true } })
    }

    const selectLeadList = (leadId: any) => {
        navigate(`/app/deals/deal-details`, { state: { leadId, detail: true } })
    }

    return (
        <Box sx={{ mt: '60px' }}>
            <div>
                <CustomAppBar
                    backbtnHandle={backbtnHandle}
                    module={module}
                    backBtn={backBtn}
                    crntPage={crntPage}
                    editHandle={editHandle}
                />
                <Box
                    sx={{
                        mt: '110px',
                        p: '20px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ width: '100%' }}>
                        <Card sx={{ borderRadius: '7px' }}>
                            <div
                                style={{
                                    padding: '20px',
                                    borderBottom: '1px solid lightgray',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        color: '#1a3353f0',
                                    }}
                                >
                                    Interaction Information  {typeIcons[interactionDetails?.type ?? '']}
                                </div>
                                <div
                                    style={{
                                        color: 'gray',
                                        fontSize: '16px',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                            marginRight: '15px',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        created on &nbsp;
                                        {formatDate(interactionDetails?.created_at)}
                                    </div>
                                    <div>|&nbsp;&nbsp;&nbsp;&nbsp;Last update&nbsp;&nbsp;{formatDate(interactionDetails?.updated_at)}</div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Owner</div>
                                    <div className="title3">
                                        {interactionDetails ? `${interactionDetails.user.first_name} ${interactionDetails.user.last_name}` : '----'}
                                    </div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Started at</div>
                                    <div className="title3">
                                        {interactionDetails?.start_at ? formatDate(interactionDetails?.start_at) : '----'}
                                    </div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Ended at</div>
                                    <div className="title3">
                                        {interactionDetails?.end_at ? formatDate(interactionDetails?.end_at) : '----'}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '20px',
                                    marginTop: '15px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Type</div>
                                    <div className="title3">{typeIcons[interactionDetails?.type ?? '']}&nbsp;&nbsp;{interactionDetails?.type || '----'}</div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Lead</div>
                                    <div className='title3 tableCell-link' onClick={() => selectLeadList(interactionDetails?.interact_with?.id)}>
                                        {interactionDetails?.interact_with.account_name || '----'}
                                    </div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Contact person</div>
                                    <div className="title3 tableCell-link" onClick={() => contactHandle(interactionDetails?.contact)}>
                                        {interactionDetails ? `${interactionDetails.contact.first_name} ${interactionDetails.contact.last_name}` : '----'}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '20px',
                                    marginTop: '15px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ width: '32%' }}>
                                    <div className="title2">Duration</div>
                                    <div className="title3">{formatDuration(interactionDetails?.duration) || '----'}</div>
                                </div>
                            </div>
                            {/* Description */}
                            <div style={{ marginTop: '15px' }}>
                                <div
                                    style={{
                                        padding: '20px',
                                        borderBottom: '1px solid lightgray',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: '18px',
                                            color: '#1a3353f0',
                                        }}
                                    >
                                        Description
                                    </div>
                                </div>
                                <Box sx={{ p: '15px' }}>
                                    {interactionDetails?.description ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: interactionDetails.description,
                                            }}
                                        />
                                    ) : (
                                        '---'
                                    )}
                                </Box>
                            </div>
                        </Card>
                    </Box>
                </Box>
            </div>
        </Box>
    );
}