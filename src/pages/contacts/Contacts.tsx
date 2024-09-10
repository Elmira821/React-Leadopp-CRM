import { Box, Button, Card, Stack, Tab, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Tabs, Toolbar, Typography, Paper, Select, MenuItem, MenuProps, FormControl, InputLabel, InputBase, styled, TableCell, TableSortLabel, Container, Skeleton } from '@mui/material'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { getComparator, stableSort } from '../../components/Sorting';
import { Spinner } from '../../components/Spinner';
import { fetchData, Header } from '../../components/FetchData';
import { ContactUrl } from '../../services/ApiUrls';
import { AntSwitch, CustomTab, CustomToolbar, FabLeft, FabRight, StyledTableCell, StyledTableRow } from '../../styles/CssStyled';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { DeleteModal } from '../../components/DeleteModal';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { EnhancedTableHead } from '../../components/EnchancedTableHead';
//import { useMyContext } from '../../context/Context';

import { CATEGORY_OPTIONS, CategoryList } from './constants'; // Import category constants

interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    primary_email: string;
    mobile_number?: string;
    do_not_call?: boolean;
    organization?: string;
    category: string;
}

// Function to get category color
const getCategoryColor = (category: any) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    return option ? option.color : 'defaultColor';
};

// Function to get category label
const getCategoryLabel = (category: any) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    return option ? option.label : '';
};

interface HeadCell {
    disablePadding: boolean;
    id: any;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'first_name',
        numeric: false,
        disablePadding: false,
        label: 'Name'
    },
    // {
    //     id: 'first_name',
    //     numeric: false,
    //     disablePadding: false,
    //     label: 'First Name'
    // },
    // {
    //     id: 'last_name',
    //     numeric: true,
    //     disablePadding: false,
    //     label: 'Last Name'
    // },

    {
        id: 'primary_email',
        numeric: true,
        disablePadding: false,
        label: 'Email Address'
    },
    {
        id: 'mobile_number',
        numeric: true,
        disablePadding: false,
        label: 'Phone Number'
    },
    {
        id: 'do_not_call',
        numeric: false,
        disablePadding: false,
        label: 'Do not call'
    },
    {
        id: 'organization',
        numeric: false,
        disablePadding: false,
        label: 'Organization'
    },
    {
        id: 'category',
        numeric: false,
        disablePadding: false,
        label: 'Category'
    }
];

export default function Contacts() {
    const navigate = useNavigate();
    // const context = useMyContext()

    const [value, setValue] = useState('Open');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [contactList, setContactList] = useState<Contact[]>([]);
    const [countries, setCountries] = useState([]);
    const [deleteRowModal, setDeleteRowModal] = useState(false);
    const [selected, setSelected] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [isSelectedId, setIsSelectedId] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('first_name');
    const [selectOpen, setSelectOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // useEffect(() => {
    //     getContacts()
    // }, [localStorage.getItem('org')])

    useEffect(() => {
        getContacts();
    }, [currentPage, recordsPerPage]);

    // const handleChangeTab = (e: SyntheticEvent, val: any) => {
    //     setValue(val)
    // }

    // const fetch2 = () => {
    //     const headers = new Headers({
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json',
    //         'Authorization': localStorage.getItem('Token') || '',
    //         'org': localStorage.getItem('org') || '',
    //     });
    //     // fetch(`https://8000-little-dawn-70215372.eu-ws3.runcode.io/api/${ContactUrl}/`, { method: 'GET', headers: headers })
    //     fetch(`https://8000-little-dawn-70215372.eu-ws3.runcode.io/api/${ContactUrl}/?offset=0&limit=20`, { method: 'GET', headers: headers })
    //         .then((response) => response.json())
    //         .then((data) => { console.log(data, 'data') })
    // }

    const getContacts = async () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        try {
            const offset = (currentPage - 1) * recordsPerPage;
            await fetchData(`${ContactUrl}/?offset=${offset}&limit=${recordsPerPage}`, 'GET', null as any, Header)
                // fetchData(`${ContactUrl}/`, 'GET', null as any, Header)
                .then((data) => {
                    if (!data.error) {
                        // console.log(data.contact_obj_list, 'contact')
                        // if (initial) {
                        setContactList(data.contact_obj_list);
                        setCountries(data?.countries)
                        // setTotalPages(data?.contacts_count)
                        setTotalPages(Math.ceil(data?.contacts_count / recordsPerPage));
                        setLoading(false)
                        // setTotalPages(Math.ceil(result.total / recordsPerPage));
                        // setInitial(false)
                        // } else {
                        // setContactList(Object.assign([], contacts, [data.contact_obj_list]))
                        // setContactList(prevContactList => prevContactList.concat(data.contact_obj_list));
                        // setContactList(...contactList,data.contact_obj_list)
                        // setLoading(false)
                        // }
                    }
                })
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleRequestSort = (event: any, property: any) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    // Function to handle category choose
    const handleCategoryChoose = (category: any) => {
        setSelectedCategory (category);
    };

    const DeleteItem = () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${ContactUrl}/${selectedId}/`, 'DELETE', null as any, Header)
            .then((res) => {
                // console.log('delete:', res);
                if (!res.error) {
                    deleteRowModalClose()
                    getContacts()
                }
            })
            .catch(() => { })
    }

    const handlePreviousPage = () => {
        setLoading(true)
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setLoading(true)
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLoading(true)
        setRecordsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };
    // const renderPageNumbers = () => {
    //     const pageNumbers = [];
    //     if (totalPages <= 1) return null;
    //     for (let i = 1; i <= totalPages; i++) {
    //         if (
    //             i === 1 ||
    //             i === totalPages ||
    //             (i >= currentPage - 1 && i <= currentPage + 1) ||
    //             (i <= 2 && currentPage <= 4) ||
    //             (i >= totalPages - 1 && currentPage >= totalPages - 3)
    //         ) {
    //             pageNumbers.push(
    //                 <button
    //                     key={i}
    //                     onClick={() => setCurrentPage(i)}
    //                     className={i === currentPage ? 'active' : ''}
    //                 >
    //                     {i}
    //                 </button>
    //             );
    //         } else if ((i === 3 && currentPage > 4) || (i === totalPages - 2 && currentPage < totalPages - 3)) {
    //             // Add ellipsis if necessary
    //             pageNumbers.push(<span key={-i}>...</span>);
    //         }
    //     }
    //     return pageNumbers;
    // };

    const onAddContact = () => {
        if (!loading) {
            navigate('/app/contacts/add-contacts', { state: { countries } })
        }
        // navigate('/contacts/add-contacts?page=add-contacts')
    }

    const contactHandle = (contactId: any) => {
        navigate(`/app/contacts/contact-details`, { state: { contactId, detail: true, countries } })
    }

    const deleteRow = (deleteId: any) => {
        setDeleteRowModal(true)
        setSelectedId(deleteId)
    }
    const deleteRowModalClose = () => {
        setDeleteRowModal(false)
        setSelectedId('')
    }
    const modalDialog = 'Are You Sure you want to delete this contact?'
    const modalTitle = 'Delete Contact'

    const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]
    // console.log(contactList, 'cccc')
    // console.log(context, 'cc');

    //Function to filter contact list with searchbar entree and categories
    const filteredContactList = contactList.filter(contact => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (selectedCategory ? contact.category === selectedCategory : true) &&
            (contact.first_name.toLowerCase().includes(searchLower) ||
             contact.last_name.toLowerCase().includes(searchLower) ||
             contact.primary_email.toLowerCase().includes(searchLower) ||
             (contact.mobile_number && contact.mobile_number.toLowerCase().includes(searchLower)) ||
             (contact.organization && contact.organization.toLowerCase().includes(searchLower)) ||
             contact.category.toLowerCase().includes(searchLower))
        );
    });

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomToolbar sx={{ flexDirection: 'row-reverse' }}>
                {/* <Tabs defaultValue={value} onChange={handleChangeTab} sx={{ mt: '27px' }}>
                    <CustomTab value="Open" label="Open"
                        sx={{
                            backgroundColor: value === 'Open' ? '#F0F7FF' : '#223d60',
                            color: value === 'Open' ? '#3f51b5' : 'white',
                        }}></CustomTab>
                    <CustomTab value="Closed" label="Closed"
                        sx={{
                            backgroundColor: value === 'Closed' ? '#F0F7FF' : '#223d60',
                            color: value === 'Closed' ? '#3f51b5' : 'white',
                            ml: '5px',
                        }}
                    ></CustomTab>
                </Tabs> */}
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <InputBase
                        value={searchQuery}
                        className={`custom-select`}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in contacts..."
                        sx={{ marginRight: 2, padding: '0 10px', backgroundColor: '#fff', borderRadius: '4px', height: '40px', minWidth: '250px' }}
                    />
                    <Select
                        value={recordsPerPage}
                        // onChange={(e: any) => setRecordsPerPage(e.target.value)}
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
                        {recordsList?.length && recordsList.map((item: any, i: any) => (
                            <MenuItem key={i} value={item[0]} >
                                {item[1]}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        displayEmpty
                        className={`custom-select`}
                        sx={{ marginLeft: 2 }}
                    >
                        <MenuItem value="">
                            <em>All Categories</em>
                        </MenuItem>
                        {CategoryList.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>

                    <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
                        <FabLeft onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <FiChevronLeft style={{ height: '15px' }} />
                        </FabLeft>
                        <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
                            {currentPage} to {totalPages}
                            {/* {renderPageNumbers()} */}
                        </Typography>
                        <FabRight onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <FiChevronRight style={{ height: '15px' }} />
                        </FabRight>
                    </Box>
                    <Button
                        variant='contained'
                        startIcon={<FiPlus className='plus-icon' />}
                        onClick={onAddContact}
                        className={'add-button'}
                    >
                        Add Contact
                    </Button>
                </Stack>
            </CustomToolbar>

            <Container sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}>
                <Box sx={{ width: '100%', minWidth: '100%', m: '15px 0px 0px 0px' }}>
                    <Paper sx={{ width: 'cal(100%-15px)', mb: 2, p: '0px 15px 15px 15px' }}>
                        <TableContainer>
                            <Table>
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}
                                    // onSelectAllClick={tab === 0 ? handleSelectAllClick : ''}
                                    // onSelectAllClick={''}
                                    onRequestSort={handleRequestSort}
                                    // rowCount={tab === 0 ? usersData.active_users_count : usersData.inactive_users_count}
                                    numSelectedId={selectedId}
                                    isSelectedId={isSelectedId}
                                    headCells={headCells}
                                />
                                {/* <TableHead>
                            <TableRow>
                                <StyledTableCell style={{ fontWeight: 'bold', fontSize: '13p', color: '#1A3353' }}>Name</StyledTableCell>
                                <StyledTableCell style={{ fontWeight: 'bold', fontSize: '13p', color: '#1A3353' }}>Email</StyledTableCell>
                                <StyledTableCell style={{ fontWeight: 'bold', fontSize: '13p', color: '#1A3353' }}>Phone Number</StyledTableCell>
                                 <StyledTableCell style={{ fontWeight: 'bold', fontSize: '13p', color: '#1A3353' }}>Do Not Call</StyledTableCell> 
                        <StyledTableCell style={{ fontWeight: 'bold', fontSize: '13p', color: '#1A3353' }}>Action</StyledTableCell>
                    </TableRow>
                </TableHead> */}
                                <TableBody>
                                    {filteredContactList?.length
                                        ? stableSort(filteredContactList, getComparator(order, orderBy)).map((item: any, index: any) => (
                                            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item: any, index: any) => {
                                            <TableRow
                                                tabIndex={-1}
                                                key={index}
                                                sx={{ border: 0, '&:nth-of-type(even)': { backgroundColor: 'whitesmoke' }, color: 'rgb(26, 51, 83)' }}>
                                                <TableCell
                                                    className='tableCell-link'
                                                    onClick={() => contactHandle(item)}>{item.first_name + ' ' + item.last_name}</TableCell>
                                                <TableCell className='tableCell'>{item.primary_email}</TableCell>
                                                <TableCell className='tableCell'>{item.mobile_number ? item.mobile_number : '---'}</TableCell>
                                                <TableCell className='tableCell'><AntSwitch checked={item.do_not_call} inputProps={{ 'aria-label': 'ant design' }} /></TableCell>
                                                <TableCell className='tableCell'>{item.organization ? item.organization : '---'}</TableCell>
                                                <TableCell className='tableCell'>
                                                    <Button
                                                        style={{ backgroundColor: getCategoryColor(item.category), color: 'white' }}
                                                        onClick={() => handleCategoryChoose(item.category)}
                                                    >
                                                        {getCategoryLabel(item.category)}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className='tableCell'><FaTrashAlt style={{ cursor: 'pointer' }} onClick={() => deleteRow(item.id)} /></TableCell>
                                            </TableRow>
                                        ))
                                        : <TableRow> <TableCell colSpan={6} sx={{ border: 0 }}></TableCell></TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* {loading &&
                            // <Skeleton variant="rectangular" 
                            // width={210} height={118} 
                            // />
                            <Spinner />
                        } */}
                    </Paper>
                </Box>
            </Container>
            {
                <DeleteModal
                    onClose={deleteRowModalClose}
                    open={deleteRowModal}
                    id={selectedId}
                    modalDialog={modalDialog}
                    modalTitle={modalTitle}
                    DeleteItem={DeleteItem}
                />
                // <DialogModal
                //     contact={contact}
                //     isDelete={isDelete}
                //     modalDialog={modalDialog}
                //     onClose={onclose}
                //     onDelete={onDelete}
                // />
            }
        </Box >
    )
}