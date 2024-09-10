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
import InviteTeammates from '../../components/InviteTeammates'
import AddTeam from '../teams/AddTeams';
import GetTeams from '../teams/Teams';

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

export default function TeamsPanel() {
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

    return (
        <Box sx={{ mt: '60px', }}>
            <CustomToolbar />
            <Accordion defaultExpanded style={{ width: '100%', marginTop: '10px', }}>
                <AccordionSummary
                    expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                    <Typography className="accordion-header">
                        Teams Control Panel
                    </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AddTeam />
            </Accordion>
            <GetTeams />
        </Box>
    );

};