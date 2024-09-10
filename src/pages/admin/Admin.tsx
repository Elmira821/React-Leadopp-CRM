import React, { SyntheticEvent, useEffect, useState, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Stack, Tab, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Tabs, Toolbar, Typography, Paper, TableCell, IconButton, AccordionDetails, Accordion, AccordionSummary, Divider, Checkbox, Tooltip, TableSortLabel, alpha, Select, MenuItem, Container, FormControlLabel, Switch } from '@mui/material'
import { EnhancedTableHead } from '../../components/EnchancedTableHead';
import { getComparator, stableSort } from '../../components/Sorting';
import { DeleteModal } from '../../components/DeleteModal'; import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@react-icons/all-files/fi/FiChevronRight";
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FaAd, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { fetchData } from '../../components/FetchData';
import { UsersUrl, UserUrl, AdminUrl, OrgUrl } from '../../services/ApiUrls';
import { CustomTab, CustomToolbar, FabLeft, FabRight } from '../../styles/CssStyled';
import Users from '../users/Users';
import InviteTeammates from '../../components/InviteTeammates';

interface HeadCell {
    disablePadding: boolean;
    id: any;
    //label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [

    {
        id: 'organizations',
        numeric: true,
        disablePadding: false,
        //label: 'Organizations'
    },
    {
        id: 'actions',
        numeric: true,
        disablePadding: false,
        //label: 'Actions'
    }
]

type Item = {
    id: string;
    // Other properties
};

interface Org {
    id: string;
    name: string;
    api_key: string;
    is_google_auth: boolean;
}

interface ProfileOrgList {
    role: string;
    alternate_phone: string | null;
    has_sales_access: boolean;
    has_marketing_access: boolean;
    is_organization_admin: boolean;
    org: Org;
}

interface ApiResponse {
    error: boolean;
    status: number;
    profile_org_list: ProfileOrgList[];
}

export default function Admin() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('active');
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc')
    const [orderBy, setOrderBy] = useState('Website')
    // const [selected, setSelected] = useState([])
    // const [selected, setSelected] = useState<string[]>([]);

    // const [selectedId, setSelectedId] = useState([])
    // const [isSelectedId, setIsSelectedId] = useState([])
    const [deleteItems, setDeleteItems] = useState([])
    const [page, setPage] = useState(0)
    const [values, setValues] = useState(10)
    const [dense] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [authData, setAuthData] = useState<AuthData>({ google_authentication: false });
    const [deleteItemId, setDeleteItemId] = useState('')
    const [loader, setLoader] = useState(true)
    const [isDelete, setIsDelete] = useState(false)
    const [activeOrg, setActiveOrg] = useState<Item[]>([])
    const [activeUsers, setActiveUser] = useState<Item[]>([])
    const [activeUsersCount, setActiveUsersCount] = useState(0)
    const [activeUsersOffset, setActiveOrgOffset] = useState(0)
    const [inactiveUsers, setInactiveUsers] = useState([])
    const [InactiveUsersCount, setInactiveUsersCount] = useState(0)
    const [inactiveUsersOffset, setInactiveUsersOffset] = useState(0)
    const [deleteRowModal, setDeleteRowModal] = useState(false)
    // const [selectedId, setSelectedId] = useState('')

    const [selectOpen, setSelectOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string[]>([]);
    const [isSelectedId, setIsSelectedId] = useState<boolean[]>([]);

    const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
    const [activeRecordsPerPage, setActiveRecordsPerPage] = useState<number>(10);
    const [activeTotalPages, setActiveTotalPages] = useState<number>(0);
    const [activeLoading, setActiveLoading] = useState(true);


    const [inactiveCurrentPage, setInactiveCurrentPage] = useState<number>(1);
    const [inactiveRecordsPerPage, setInactiveRecordsPerPage] = useState<number>(10);
    const [inactiveTotalPages, setInactiveTotalPages] = useState<number>(0);
    const [inactiveLoading, setInactiveLoading] = useState(true);

    interface AuthData {
        google_authentication: boolean;
    }

    useEffect(() => {
        //getOrg()
    }, [activeCurrentPage, activeRecordsPerPage, inactiveCurrentPage, inactiveRecordsPerPage]);

    const handleChangeTab = (e: SyntheticEvent, val: any) => {
        setTab(val)
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {


        const getAuth = async () => {
            const Header = {
                Accept: 'application/json',
                'Content-Type': 'application/json',

            }
            try {
                await fetchData(`${AdminUrl}/`, 'GET', null as any, Header)
                    .then((res: any) => {
                        if (!res.error) {
                            console.log(res)
                            setLoading(false)
                            setAuthData(
                                {
                                    google_authentication: res.is_google_auth,
                                }
                            )
                        }
                    })
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getAuth();

    }, []);

    /*const OrgDetail = (orgId: any) => {
        navigate(`/app/admin/admin-details`, { state: { orgId, detail: true } })
    }*/
    const handleRecordsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (tab == 'active') {
            setActiveLoading(true)
            setActiveRecordsPerPage(parseInt(event.target.value));
            setActiveCurrentPage(1);
        } else {
            setInactiveLoading(true)
            setInactiveRecordsPerPage(parseInt(event.target.value));
            setInactiveCurrentPage(1);
        }

    };
    const handlePreviousPage = () => {
        if (tab == 'active') {
            setActiveLoading(true)
            setActiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
        } else {
            setInactiveLoading(true)
            setInactiveCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
        }
    };

    const handleNextPage = () => {
        if (tab == 'active') {
            setActiveLoading(true)
            setActiveCurrentPage((prevPage) => Math.min(prevPage + 1, activeTotalPages));
        } else {
            setInactiveLoading(true)
            setInactiveCurrentPage((prevPage) => Math.min(prevPage + 1, inactiveTotalPages));
        }
    };
    const handleRequestSort = (event: any, property: any) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    // const handleSelectAllClick = (event: any) => {
    // if (event.target.checked) {
    //     const newSelected = rows.map((n) => n.name);
    //     setSelected(newSelected);
    //     return;
    //   }
    //   setSelected([]);
    // }
    // const selected: string[] = [...];1
    const handleClick = (event: React.MouseEvent<unknown>, name: any) => {
        // const selectedIndex = selected.indexOf(name as string);
        // let newSelected: string[] = [];

        // if (selectedIndex === -1) {
        //     newSelected = newSelected.concat(selected, name);
        // } else if (selectedIndex === 0) {
        //     newSelected = newSelected.concat(selected.slice(1));
        // } else if (selectedIndex === selected.length - 1) {
        //     newSelected = newSelected.concat(selected.slice(0, -1));
        // } else if (selectedIndex > 0) {
        //     newSelected = newSelected.concat(
        //         selected.slice(0, selectedIndex),
        //         selected.slice(selectedIndex + 1),
        //     );
        // }

        // setSelected(newSelected);
    };



    // const isSelected = (name: string) => selected.indexOf(name) !== -1;

    type SelectedItem = string[];
    const isSelected = (name: string, selected: SelectedItem): boolean => {
        return selected.indexOf(name) !== -1;
    };



    /*const deleteItemBox = (deleteId: any) => {
        setDeleteItemId(deleteId)
        setIsDelete(!isDelete)
    }

    const onclose = () => {
        setIsDelete(!isDelete)
    }*/

    /*const onDelete = (id: any) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
          }
        fetchData(`${UsersUrl}/${id}/`, 'delete', null as any, Header)
            .then((data) => {
                if (!data.error) {
                    getUsers()
                    setIsDelete(false)
                }
            })
            .catch(() => {
            })
    }*/


    /*const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - 7) : 0 */
    // (tab === 0 ? accountData.accountLength : accountData.closed_accounts_length)

    /*const onAddUser = () => {
        if (!loading) {
            navigate('/app/users/add-users')
        }
        // navigate('/users/add-users', {
        //   state: {
        //     roles: usersData.roles,
        //     status: usersData.status
        //   }
        // })
    }
    const deleteRow = (id: any) => {
        setSelectedId(id)
        setDeleteRowModal(!deleteRowModal)
    }*/

    const putAuth = (isGoogleAuth: boolean) => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
        }
        const Body = {
            is_google_auth: isGoogleAuth
        }

        fetchData(`${AdminUrl}/`, 'PUT', JSON.stringify(Body), Header)
            .then((res) => {
                console.log(res, 'res');
                if (!res.error) {
                    const data = res?.data?.profile_obj

                }
            })
    }

    const handleToggleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newGoogleAuth = e.target.checked;
        setAuthData((prevData: AuthData) => ({ ...prevData, google_authentication: newGoogleAuth }));
        putAuth(newGoogleAuth);
    };

    // const [selectedRows, setSelectedRows] = useState([]);
    // const [selectedRowId, setSelectedRowId] = useState(null);

    // const handleCheckboxClick = (rowId) => {
    //     const isSelected = selectedRows.includes(rowId);
    //     let updatedSelectedRows;

    //     if (isSelected) {
    //       updatedSelectedRows = selectedRows.filter((id) => id !== rowId);
    //     } else {
    //       updatedSelectedRows = [...selectedRows, rowId];
    //     }

    //     setSelectedRows(updatedSelectedRows);
    //   };
    const deleteRowModalClose = () => {
        setDeleteRowModal(false)
        setSelectedId([])
    }
    const DeleteItem = () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        fetchData(`${UserUrl}/${selectedId}/`, 'DELETE', null as any, Header)
            .then((res: any) => {
                console.log('delete:', res);
                if (!res.error) {
                    deleteRowModalClose()
                    //getUsers()
                }
            })
            .catch(() => {
            })
    }


    const handleSelectAllClick = () => {
        if (selected.length === activeUsers.length) {
            setSelected([]);
            setSelectedId([]);
            setIsSelectedId([]);
        } else {
            const newSelectedIds = activeUsers.map((user) => user.id);
            setSelected(newSelectedIds);
            setSelectedId(newSelectedIds);
            setIsSelectedId(newSelectedIds.map(() => true));
        }
    };

    const handleRowSelect = (userId: string) => {
        const selectedIndex = selected.indexOf(userId);
        const newSelected: string[] = [...selected];
        const newSelectedIds: string[] = [...selectedId];
        const newIsSelectedId: boolean[] = [...isSelectedId];

        if (selectedIndex === -1) {
            newSelected.push(userId);
            newSelectedIds.push(userId);
            newIsSelectedId.push(true);
        } else {
            newSelected.splice(selectedIndex, 1);
            newSelectedIds.splice(selectedIndex, 1);
            newIsSelectedId.splice(selectedIndex, 1);
        }

        setSelected(newSelected);
        setSelectedId(newSelectedIds);
        setIsSelectedId(newIsSelectedId);
    };
    const handleDelete = (id: any) => {
        console.log(id, 's;ected')
    }
    const modalDialog = 'Are You Sure You want to delete this User?'
    const modalTitle = 'Delete User'

    const recordsList = [[10, '10 Records per page'], [20, '20 Records per page'], [30, '30 Records per page'], [40, '40 Records per page'], [50, '50 Records per page']]
    console.log(Array.isArray(selectedId) && selectedId.length === 0, 'asd');


    return (
        <Box sx={{ mt: '60px' }}>
            <CustomToolbar>
                {/* <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Select
                        value={tab === 'active' ? activeRecordsPerPage : inactiveRecordsPerPage}
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
                        sx={{
                            '& .MuiSelect-select': { overflow: 'visible !important' }
                        }}
                    >
                        {recordsList?.length && recordsList.map((item: any, i: any) => (
                            <MenuItem key={i} value={item[0]} >
                                {item[1]}
                            </MenuItem>
                        ))}
                    </Select>
                    <Box sx={{ borderRadius: '7px', backgroundColor: 'white', height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', mr: 1, p: '0px' }}>
                        <FabLeft onClick={handlePreviousPage} disabled={tab === 'active' ? activeCurrentPage === 1 : inactiveCurrentPage === 1}>
                            <FiChevronLeft style={{ height: '15px' }} />
                        </FabLeft>
                        <Typography sx={{ mt: 0, textTransform: 'lowercase', fontSize: '15px', color: '#1A3353', textAlign: 'center' }}>
                             {tab === 'active' ? `${activeCurrentPage} to ${activeTotalPages}` : `${inactiveCurrentPage} to ${inactiveTotalPages}`} 
                        </Typography>
                         <FabRight onClick={handleNextPage} disabled={tab === 'active' ? (activeCurrentPage === activeTotalPages) : (inactiveCurrentPage === inactiveTotalPages)}>
                            <FiChevronRight style={{ height: '15px' }} />
                        </FabRight> 
                    </Box>
                    <Button
                        variant='contained'
                        startIcon={<FiPlus className='plus-icon' />}
                        // onClick={onAddUser}
                        className={'add-button'}
                    >
                        Add User
                    </Button>
                </Stack> */}
            </CustomToolbar>
            <Container sx={{ maxWidth: '100%', minWidth: '100%', display: 'flex' }}>
                <InviteTeammates />
                <Box sx={{ mt: '24px', width: '50%', mx: '24px', mr: '24px', p: 3, borderRadius: 1, boxShadow: 2, backgroundColor: 'white' }}>
                    <Typography className="accordion-header">
                        Google Auth Control
                    </Typography>
                    <div style={{ marginTop: '20px', }}>
                        <Divider className="divider" />
                    </div>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '0px', maxWidth: '100%', mx: 'auto', ml: '0', p: 3, borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="body1">Google Authentication</Typography>
                        <FormControlLabel
                            control={<Switch checked={authData.google_authentication} onChange={handleToggleChange} />}
                            label=""
                            sx={{ marginLeft: '20px' }} // Add spacing between the text and switch
                        />
                    </Box>
                </Box>
            </Container>
            <Container sx={{ maxWidth: '100%', minWidth: '100%', display: 'flex', flexDirection: 'column', marginTop: '20px', padding: '20px', }}>
                <Accordion defaultExpanded sx={{ width: '100%', marginTop: '10px', }} >
                    <AccordionSummary
                        expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                    >
                        <Typography className="accordion-header">
                            Users Control Panel
                        </Typography>
                    </AccordionSummary>
                    <Divider className="divider" />
                    <Users />
                </Accordion>
            </Container>
        </Box>
    );

};

