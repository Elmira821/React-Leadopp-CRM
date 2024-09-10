import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Table, TableBody, TableContainer, TableRow, TableCell, Paper, Typography, Select, MenuItem, InputBase, Container } from '@mui/material';
import { FiPlus, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { IoMdCall, IoMdPeople } from "react-icons/io";
import { MdOutlineMarkEmailRead, MdOutlineTaskAlt } from "react-icons/md";
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../components/FetchData';
import { InteractionsUrl } from '../../services/ApiUrls';
import { CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
import { EnhancedTableHead } from '../../components/EnchancedTableHead';
import { getComparator, stableSort } from '../../components/Sorting';
import { DeleteModal } from '../../components/DeleteModal';

interface User {
    email: string;
    first_name: string | null;
    last_name: string | null;
}

interface Contact {
    id: string;
    first_name: string;
    last_name: string;
}

interface Lead {
    id: string;
    account_name: string;
}

interface Interaction {
    id: string;
    user: User;
    created_at: string;
    updated_at: string;
    start_at?: string;
    end_at?: string;
    type: string;
    interact_with: Lead;
    contact: Contact;
    description?: string;
    duration?: string;
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Interaction;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'interact_with', numeric: false, disablePadding: false, label: 'Lead' },
    { id: 'contact', numeric: false, disablePadding: false, label: 'Contact Person' },
    { id: 'start_at', numeric: true, disablePadding: false, label: 'Beginning' },
    { id: 'end_at', numeric: true, disablePadding: false, label: 'Ending' },
    { id: 'duration', numeric: true, disablePadding: false, label: 'Duration' },
    { id: 'user', numeric: false, disablePadding: false, label: 'Owner' }
];

const typeIcons: { [key: string]: JSX.Element } = {
    'Call': <IoMdCall />,
    'Email': <MdOutlineMarkEmailRead />,
    'Meeting': <IoMdPeople />,
    'Task': <MdOutlineTaskAlt />
};

export default function Interactions() {
    const navigate = useNavigate();
    const [interactionList, setInteractionList] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteRowModal, setDeleteRowModal] = useState(false);
    const [selectedId, setSelectedId] = useState<string>('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selectOpen, setSelectOpen] = useState(false);
    const [orderBy, setOrderBy] = useState<keyof Interaction>('start_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedType, setSelectedType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([])
    const [contacts, setContacts] = useState([])
    const [leads, setLeads] = useState([])

    useEffect(() => {
        getInteractions();
    }, [currentPage, recordsPerPage]);

    const getInteractions = async () => {
        setLoading(true);
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        try {
            const offset = (currentPage - 1) * recordsPerPage;
            await fetchData(`${InteractionsUrl}/?offset=${offset}&limit=${recordsPerPage}`, 'GET', null as any, Header)
                // fetchData(`${ContactUrl}/`, 'GET', null as any, Header)
                .then((data) => {
                    if (!data.error) {
                        setInteractionList(data.interactions.interactions);
                        setContacts(data?.contacts)
                        setUsers(data?.users)
                        setLeads(data?.leads)
                        setTotalPages(Math.ceil(data?.contacts_count / recordsPerPage));
                        setLoading(false)
                    }
                })
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Interaction) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handlePreviousPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    const handleNextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    const handleRecordsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
        setRecordsPerPage(event.target.value as number);
        setCurrentPage(1);
    };

    const onAddInteraction = () => navigate('/app/interactions/add-interactions', {
        state: {
            detail: false,
            contacts: contacts || [], leads: leads || [], users: users || []
        }
    });
    const interactionHandle = (interactionId: string) => navigate(`/app/interactions/interaction-details`, {
        state: {
            interactionId, detail: true,
            contacts: contacts || [], leads: leads || [], users: users || []
        }
    });

    const deleteRow = (deleteId: string) => {
        setDeleteRowModal(true);
        setSelectedId(deleteId);
    };

    const deleteRowModalClose = () => {
        setDeleteRowModal(false);
        setSelectedId('');
    };

    const DeleteItem = async () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        await fetchData(`${InteractionsUrl}/${selectedId}/`, 'DELETE', null as any, Header);
        deleteRowModalClose();
        getInteractions();
    };

    const filteredInteractionList = interactionList.filter(interaction => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (selectedType ? interaction.type === selectedType : true) &&
            (
                `${interaction.user.first_name} ${interaction.user.last_name}`.toLowerCase().includes(searchLower) ||
                interaction.interact_with.account_name?.toLowerCase().includes(searchLower) ||
                `${interaction.contact.first_name} ${interaction.contact.last_name}`.toLowerCase().includes(searchLower) ||
                interaction.start_at?.toLowerCase().includes(searchLower) ||
                interaction.end_at?.toLowerCase().includes(searchLower)
            )
        );
    });

    const contactHandle = (contactId: any) => {
        navigate(`/app/contacts/contact-details`, { state: { contactId, detail: true } })
    }

    const selectLeadList = (leadId: any) => {
        navigate(`/app/deals/deal-details`, { state: { leadId, detail: true } })
    }

    const formatDate = (dateString: any): string => {
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

    function formatDuration(durationInSeconds: number): string {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        return `${hours > 0 ? `${hours} hours ` : ''}${minutes} minutes`;
    }

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomToolbar sx={{ flexDirection: 'row-reverse' }}>
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <InputBase
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in interactions..."
                        sx={{ marginRight: 2, padding: '0 10px', backgroundColor: '#fff', borderRadius: '4px', height: '40px', minWidth: '250px' }}
                    />
                    <Select
                        value={recordsPerPage}
                        onChange={(e: any) => handleRecordsPerPage(e)}
                        open={selectOpen}
                        onOpen={() => setSelectOpen(true)}
                        onClose={() => setSelectOpen(false)}
                        className={`custom-select`}
                        onClick={() => setSelectOpen(!selectOpen)}
                        IconComponent={() => (
                            <div onClick={() => setSelectOpen(!selectOpen)} className="custom-select-icon">
                                {selectOpen ? <FiChevronUp style={{ marginTop: '12px' }} /> : <FiChevronDown style={{ marginTop: '12px' }} />}
                            </div>
                        )}
                        sx={{ '& .MuiSelect-select': { overflow: 'visible !important' } }}
                    >
                        {[10, 20, 30, 40, 50].map((num) => (
                            <MenuItem key={num} value={num}>{`${num} Records per page`}</MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        displayEmpty
                        className={`custom-select`}
                        sx={{ marginLeft: 2 }}
                    >
                        <MenuItem value=""><em>All types</em></MenuItem>
                        {Object.keys(typeIcons).map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>

                    <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
                        <FabLeft onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <FiChevronLeft style={{ height: '15px' }} />
                        </FabLeft>
                        <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
                            {currentPage} to {totalPages}
                        </Typography>
                        <FabRight onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <FiChevronRight style={{ height: '15px' }} />
                        </FabRight>
                    </Box>
                    <Button
                        variant='contained'
                        startIcon={<FiPlus className='plus-icon' />}
                        onClick={onAddInteraction}
                        className={'add-button'}
                    >
                        Add Interaction
                    </Button>
                </Stack>
            </CustomToolbar>

            <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
                <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
                    <Paper sx={{ width: 'calc(100%-15px)', mb: 2, p: '0px 15px 15px 15px' }}>
                        <TableContainer>
                            <Table>
                                <EnhancedTableHead
                                    numSelected={0}
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {filteredInteractionList?.length
                                        ? stableSort(filteredInteractionList, getComparator(order, orderBy)).map((item: any, index: any) => (
                                            <TableRow
                                                tabIndex={-1}
                                                key={index}
                                                sx={{ border: 0, '&:nth-of-type(even)': { backgroundColor: 'whitesmoke' }, color: 'rgb(26, 51, 83)' }}
                                            >
                                                <TableCell className='tableCell-link' onClick={() => interactionHandle(item.id)}>
                                                    {typeIcons[item.type] || item.type}&nbsp;{item.type}
                                                </TableCell>
                                                <TableCell
                                                    className='tableCell-link'
                                                    onClick={() => selectLeadList(item.interact_with?.id)}>
                                                    {item.interact_with.account_name}
                                                </TableCell>
                                                <TableCell
                                                    className='tableCell-link'
                                                    onClick={() => contactHandle(item.contact)}>
                                                    {`${item.contact.first_name} ${item.contact.last_name}`}
                                                </TableCell>
                                                <TableCell className='tableCell'>{item?.start_at ? formatDate(item?.start_at) : '---'}</TableCell>
                                                <TableCell className='tableCell'>{item?.end_at ? formatDate(item?.end_at) : '---'}</TableCell>
                                                <TableCell className='tableCell'>{item?.duration ? formatDuration(item?.duration) : '---'}</TableCell>
                                                <TableCell className='tableCell'>{`${item.user.first_name} ${item.user.last_name}`}</TableCell>
                                                <TableCell className='tableCell'>
                                                    <FaTrashAlt style={{ cursor: 'pointer' }} onClick={() => deleteRow(item.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        : <TableRow><TableCell colSpan={8} sx={{ border: 0 }}>No records found</TableCell></TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Container>
            <DeleteModal
                onClose={deleteRowModalClose}
                open={deleteRowModal}
                id={selectedId}
                modalDialog="Are You Sure you want to delete this interaction?"
                modalTitle="Delete Interaction"
                DeleteItem={DeleteItem}
            />
        </Box>
    );
};