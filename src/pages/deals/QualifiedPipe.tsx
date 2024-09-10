import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  List,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  Toolbar,
  Typography,
  Link,
  MenuItem,
  Select,
  InputBase,
} from '@mui/material';
import styled from '@emotion/styled';
import { SERVER, LeadUrl, ProfileUrl } from '../../services/ApiUrls';
import { DeleteModal } from '../../components/DeleteModal';
import { Label } from '../../components/Label';
import { fetchData } from '../../components/FetchData';
import FormateTime from '../../components/FormateTime';
import { FaTrashAlt } from 'react-icons/fa';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import {
  CustomTab,
  CustomToolbar,
  FabLeft,
  FabRight,
} from '../../styles/CssStyled';
import '../../styles/style.css';
import { ArrowUpward } from '@mui/icons-material';

interface UserDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_pic?: string;
}

interface User {
  user_details?: UserDetails;
}

interface Lead {
  assigned_to?: User[];
  account_name?: string;
  created_by?: UserDetails;
  opportunity_amount?: number | string;
  status?: string;
  tags?: string[];
  created_at?: string;
  team?: string[];
  id?: string[];
  probability?: number;
}

export const CustomTablePagination = styled(TablePagination)`
  .MuiToolbar-root {
    min-width: 100px;
  }
  .MuiTablePagination-toolbar {
    background-color: #f0f0f0;
    color: #333;
  }
  .MuiTablePagination-caption {
    color: #999;
  }
  '.muitablepagination-displayedrows': {
    display: none;
  }
  '.muitablepagination-actions': {
    display: none;
  }
  '.muitablepagination-selectlabel': {
    margin-top: 4px;
    margin-left: -15px;
  }
  '.muitablepagination-select': {
    color: black;
    margin-right: 0px;
    margin-left: -12px;
    margin-top: -6px;
  }
  '.muiselect-icon': {
    color: black;
    margin-top: -5px;
  }
  background-color: white;
  border-radius: 1;
  height: 10%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 39%;
  padding-bottom: 5;
  color: black;
  margin-right: 1;
`;

export const Tabss = styled(Tab)({
  height: '34px',
  textDecoration: 'none',
  fontWeight: 'bold',
});

export const ToolbarNew = styled(Toolbar)({
  minHeight: '48px',
  height: '48px',
  maxHeight: '48px',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#1A3353',
  '& .MuiToolbar-root': {
    minHeight: '48px !important',
    height: '48px !important',
    maxHeight: '48px !important',
  },
  '@media (min-width:600px)': {
    '& .MuiToolbar-root': {
      minHeight: '48px !important',
      height: '48px !important',
      maxHeight: '48px !important',
    },
  },
});

const recordsList = [
  [10, '10 Records per page'],
  [20, '20 Records per page'],
  [30, '30 Records per page'],
  [40, '40 Records per page'],
  [50, '50 Records per page'],
];

export default function Leads(props: any) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('open');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [openLeads, setOpenLeads] = useState<Lead[]>([]);
  const [closedLeads, setClosedLeads] = useState<Lead[]>([]);
  const [openClosedCount, setClosedLeadsCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState([]);
  const [source, setSource] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [openCurrentPage, setOpenCurrentPage] = useState<number>(1);
  const [openRecordsPerPage, setOpenRecordsPerPage] = useState<number>(10);
  const [openLoading, setOpenLoading] = useState(true);
  const [closedCurrentPage, setClosedCurrentPage] = useState<number>(1);
  const [closedRecordsPerPage, setClosedRecordsPerPage] = useState<number>(10);
  const [openTotalPages, setOpenTotalPages] = useState<number>(0);
  const [closedTotalPages, setClosedTotalPages] = useState<number>(0);
  const [deleteLeadModal, setDeleteLeadModal] = useState(false);
  const [closedLoading, setClosedLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [selectedAssignTo, setSelectedAssignTo] = useState();
  const [selectedContacts, setSelectedContacts] = useState();
  const [workloadCount, setWorkloadCount] = useState(0); // New state for workload count
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('role') || '');
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

  const getColorForProbability = (probability: number) => {
    if (probability <= 20) return '#da2700'; // Red
    if (probability <= 40) return '#fe8701'; // Orange
    if (probability <= 60) return '#fcf000'; // Yellow
    if (probability <= 80) return '#87ea00'; // Light green
    return '#00b308'; // Green
  };

  const handleSortClick = (criteria: 'probability' | 'value') => {
    if (sortBy === criteria) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortBy('');
        setSortDirection('asc');
      }
    } else {
      setSortBy(criteria);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    getLeads();
  }, [
    openCurrentPage,
    openRecordsPerPage,
    closedCurrentPage,
    closedRecordsPerPage,
    searchQuery,
    sortDirection,
    showUnassignedOnly,
    userRole,
    profileId,
  ]);

  const getLeads = async () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };
  
    try {
      const openOffset = (openCurrentPage - 1) * openRecordsPerPage;
      const closeOffset = (closedCurrentPage - 1) * closedRecordsPerPage;
  
      let url = `${LeadUrl}/?offset=${tab === 'open' ? openOffset : closeOffset}&limit=${tab === 'open' ? openRecordsPerPage : closedRecordsPerPage}&status=qualified&search=${searchQuery}`;
  
      if (userRole !== 'ADMIN') {
        url += `&assigned_to=${profileId}`;
      }
  
      const response = await fetchData(url, 'GET', null as any, Header);
  
      if (!response.error) {
        setOpenLeads(response?.open_leads?.open_leads || []);
        setClosedLeads(response?.close_leads?.close_leads || []);
        
        setOpenTotalPages(
          Math.ceil((response?.open_leads?.leads_count || 0) / openRecordsPerPage)
        );
        setClosedTotalPages(
          Math.ceil((response?.close_leads?.leads_count || 0) / closedRecordsPerPage)
        );

        setContacts(response?.contacts || []);
        setStatus(response?.status || []);
        setSource(response?.source || []);
        setCompanies(response?.companies || []);
        setTags(response?.tags || []);
        setUsers(response?.users || []);
        setCountries(response?.countries || []);
        setIndustries(response?.industries || []);
        setWorkloadCount(response?.workload_count || 0);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChangeTab = (e: SyntheticEvent, val: any) => {
    setTab(val);
  };

  const handleRecordsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (tab === 'open') {
      setOpenLoading(true);
      setOpenRecordsPerPage(parseInt(event.target.value));
      setOpenCurrentPage(1);
    } else {
      setClosedLoading(true);
      setClosedRecordsPerPage(parseInt(event.target.value));
      setClosedCurrentPage(1);
    }
  };

  const handlePreviousPage = () => {
    if (tab == 'open') {
      setOpenLoading(true);
      setOpenCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    } else {
      setClosedLoading(true);
      setClosedCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handleNextPage = () => {
    if (tab == 'open') {
      setOpenLoading(true);
      setOpenCurrentPage((prevPage) => Math.min(prevPage + 1, openTotalPages));
    } else {
      setClosedLoading(true);
      setClosedCurrentPage((prevPage) =>
        Math.min(prevPage + 1, closedTotalPages)
      );
    }
  };
  const onAddHandle = () => {
    if (!loading) {
      navigate('/app/deals/add-leads', {
        state: {
          detail: false,
          contacts: contacts || [],
          status: status || [],
          source: source || [],
          companies: companies || [],
          tags: tags || [],
          users: users || [],
          countries: countries || [],
          industries: industries || [],
        },
      });
    }
  };

  const selectLeadList = (leadId: any) => {
    navigate(`/app/deals/deal-details`, {
      state: {
        leadId,
        detail: true,
        contacts: contacts || [],
        status: status || [],
        source: source || [],
        companies: companies || [],
        tags: tags || [],
        users: users || [],
        countries: countries || [],
        industries: industries || [],
        selectedAssignTo: selectedAssignTo,
        selectedContacts: selectedContacts,
      },
    });

    // navigate('/app/leads/lead-details', { state: { leadId: leadItem.id, edit: storeData, value } })
  };
  const deleteLead = (deleteId: any) => {
    setDeleteLeadModal(true);
    setSelectedId(deleteId);
  };

  const deleteLeadModalClose = () => {
    setDeleteLeadModal(false);
    setSelectedId('');
  };
  const modalDialog = 'Are you sure you want to delete the selected Deal?';
  const modalTitle = 'Delete Deal';

  const deleteItem = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    fetchData(`${LeadUrl}/${selectedId}/`, 'DELETE', null as any, Header)
      .then((res: any) => {
        // console.log('delete:', res);
        if (!res.error) {
          deleteLeadModalClose();
          getLeads();
          setWorkloadCount((prevCount) => prevCount - 1);
        }
      })
      .catch(() => {});
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (direction: 'next' | 'previous') => {
    if (tab === 'open') {
      setOpenCurrentPage((prevPage) =>
        direction === 'next'
          ? Math.min(prevPage + 1, openTotalPages)
          : Math.max(prevPage - 1, 1)
      );
    } else {
      setClosedCurrentPage((prevPage) =>
        direction === 'next'
          ? Math.min(prevPage + 1, closedTotalPages)
          : Math.max(prevPage - 1, 1)
      );
    }
  };

  const filteredLeads = (tab === 'open' ? openLeads : closedLeads)
    .filter((lead) => {
      const fullName = `${
        lead.assigned_to?.[0]?.user_details?.first_name || ''
      } ${lead.assigned_to?.[0]?.user_details?.last_name || ''}`.toLowerCase();
      const email =
        lead.assigned_to?.[0]?.user_details?.email?.toLowerCase() || '';
      const accountName = lead.account_name?.toLowerCase() || '';
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        fullName.includes(search) ||
        email.includes(search) ||
        accountName.includes(search);

      const matchesUnassignedFilter =
        !showUnassignedOnly || !lead.assigned_to?.length;

      return matchesSearch && matchesUnassignedFilter;
    })
    .sort((a, b) => {
      const aValue =
        sortBy === 'value'
          ? parseFloat(String(a.opportunity_amount)) || 0
          : a.probability || 0;
      const bValue =
        sortBy === 'value'
          ? parseFloat(String(b.opportunity_amount)) || 0
          : b.probability || 0;

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomToolbar>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ mt: '26px' }}>
          <CustomTab
            value="open"
            label="Open"
            sx={{
              backgroundColor: tab === 'open' ? '#F0F7FF' : '#284871',
              color: tab === 'open' ? '#3f51b5' : 'white',
            }}
          />
          <CustomTab
            value="closed"
            label="Closed"
            sx={{
              backgroundColor: tab === 'closed' ? '#F0F7FF' : '#284871',
              color: tab === 'closed' ? '#3f51b5' : 'white',
              ml: '5px',
            }}
          />
        </Tabs>
        <Stack
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <InputBase
            placeholder="Search in deals..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              marginRight: 2,
              padding: '0 10px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              height: '40px',
              minWidth: '250px',
            }}
          />

          <div>
            <button
              style={{
                width: '10%',
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '16px',
                padding: '0 10px',
                backgroundColor: '#c7dde5',
                borderRadius: '4px',
                height: '40px',
                minWidth: '200px',
                fontWeight: 'bold',
                fontSize: '1rem',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4c4c4c',
              }}
              onClick={() => handleSortClick('probability')}
            >
              Sort by Probability
              {sortBy === 'probability' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'transform 0.5s ease',
                    transform:
                      sortDirection === 'asc'
                        ? 'rotate(0deg)'
                        : 'rotate(180deg)',
                  }}
                >
                  <ArrowUpward />
                </span>
              )}
            </button>
            <button
              style={{
                width: '10%',
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '16px',
                padding: '0 10px',
                backgroundColor: '#c7dde5',
                borderRadius: '4px',
                height: '40px',
                minWidth: '200px',
                fontWeight: 'bold',
                fontSize: '1rem',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4c4c4c',
              }}
              onClick={() => handleSortClick('value')}
            >
              Sort by Value
              {sortBy === 'value' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'transform 0.5s ease',
                    transform:
                      sortDirection === 'asc'
                        ? 'rotate(0deg)'
                        : 'rotate(180deg)',
                  }}
                >
                  <ArrowUpward />
                </span>
              )}
            </button>
          </div>

          <div style={{ alignItems: 'center', display: 'flex' }}>
            <label
              style={{
                color: 'white',
                marginRight: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="checkbox"
                checked={showUnassignedOnly}
                onChange={() => setShowUnassignedOnly((prev) => !prev)}
                style={{
                  cursor: 'pointer',
                  width: '20px',
                  height: '20px',
                  marginRight: '10px',
                }}
              />
              Show Unassigned only
            </label>
          </div>

          <Select
            value={tab === 'open' ? openRecordsPerPage : closedRecordsPerPage}
            onChange={(e: any) => handleRecordsPerPage(e)}
            open={selectOpen}
            onOpen={() => setSelectOpen(true)}
            onClose={() => setSelectOpen(false)}
            className={`custom-select`}
            onClick={() => setSelectOpen(!selectOpen)}
            IconComponent={() => (
              <div
                onClick={() => setSelectOpen(!selectOpen)}
                className="custom-select-icon"
              >
                {selectOpen ? (
                  <FiChevronUp style={{ marginTop: '12px' }} />
                ) : (
                  <FiChevronDown style={{ marginTop: '12px' }} />
                )}
              </div>
            )}
            sx={{
              '& .MuiSelect-select': { overflow: 'visible !important' },
            }}
          >
            {recordsList.map((item, i) => (
              <MenuItem key={i} value={item[0]}>
                {item[1]}
              </MenuItem>
            ))}
          </Select>
          <Box
            sx={{
              borderRadius: '7px',
              backgroundColor: 'white',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mr: 1,
              p: '0px',
            }}
          >
            <FabLeft
              onClick={handlePreviousPage}
              disabled={
                tab === 'open' ? openCurrentPage === 1 : closedCurrentPage === 1
              }
            >
              <FiChevronLeft style={{ height: '15px' }} />
            </FabLeft>
            <Typography
              sx={{
                mt: 0,
                textTransform: 'lowercase',
                fontSize: '15px',
                color: '#1A3353',
                textAlign: 'center',
              }}
            >
              {tab === 'open'
                ? `${openCurrentPage} to ${openTotalPages}`
                : `${closedCurrentPage} to ${closedTotalPages}`}
            </Typography>
            <FabRight
              onClick={handleNextPage}
              disabled={
                tab === 'open'
                  ? openCurrentPage === openTotalPages
                  : closedCurrentPage === closedTotalPages
              }
            >
              <FiChevronRight style={{ height: '15px' }} />
            </FabRight>
          </Box>
          <Button
            variant="contained"
            startIcon={<FiPlus className="plus-icon" />}
            onClick={onAddHandle}
            className={'add-button'}
          >
            Add Lead
          </Button>
        </Stack>
      </CustomToolbar>
      <Box sx={{ p: '10px', mt: '5px' }}>
        <List>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            filteredLeads.map((item, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <Box className="lead-box">
                  <Stack className="lead-row1">
                    <div
                      style={{
                        color: '#1A3353',
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                      onClick={() => selectLeadList(item?.id)}
                    >
                      {item?.account_name}
                    </div>
                    <div onClick={() => deleteLead(item?.id)}>
                      <FaTrashAlt
                        style={{ cursor: 'pointer', color: 'gray' }}
                      />
                    </div>
                  </Stack>
                  <Stack className="lead-row2">
                    <div className="lead-row2-col1">
                      <div
                        style={{
                          color: 'gray',
                          fontSize: '16px',
                          textTransform: 'capitalize',
                        }}
                      >
                        <div>
                          {' '}
                          value:{' '}
                          <span style={{ color: '#1a3353', fontWeight: 500 }}>
                            {' '}
                            {item?.opportunity_amount
                              ? `€${parseFloat(
                                  String(item.opportunity_amount)
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : '---'}
                          </span>{' '}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          Assignee:&nbsp;
                          {item?.assigned_to?.map(
                            (assignItem: any, index: any) =>
                              assignItem.user_details.profile_pic ? (
                                <Avatar
                                  alt="Remy Sharp"
                                  src={assignItem.user_details.profile_pic}
                                />
                              ) : (
                                <Avatar
                                  alt="Remy Sharp"
                                  // size='small'
                                  // sx={{ backgroundColor: 'deepOrange', color: 'white', textTransform: 'capitalize', mt: '-20px', ml: '10px' }}
                                >
                                  {assignItem.user_details?.first_name?.charAt(
                                    0
                                  )}
                                </Avatar>
                              )
                          )}
                          <span
                            style={{
                              color: '#1a3353',
                              fontWeight: 500,
                              textTransform: 'none',
                            }}
                          >
                            &nbsp;
                            {item?.assigned_to
                              ?.map((assignItem: any, index: number) => {
                                const { first_name, last_name, email } =
                                  assignItem?.user_details || {};

                                if (first_name && last_name) {
                                  return `${first_name} ${last_name}`;
                                } else if (first_name) {
                                  return first_name;
                                } else if (last_name) {
                                  return last_name;
                                } else if (email) {
                                  return email;
                                }
                              })
                              .join(', ') || 'Unassigned'}
                          </span>
                          &nbsp;- status:&nbsp;{' '}
                          <span style={{ color: '#1a3353', fontWeight: 500 }}>
                            {item?.status || '--'}
                          </span>
                          <span>&nbsp; - Probability:&nbsp;</span>
                          <div
                            style={{
                              flexGrow: 1,
                              height: '10px',
                              backgroundColor: '#e0e0e0',
                              borderRadius: '5px',
                              overflow: 'hidden',
                              width: '100px',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${item?.probability || 0}%`,
                                backgroundColor: getColorForProbability(
                                  item?.probability || 0
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
                            {item?.probability || '---'}%
                          </span>
                        </div>
                      </div>
                      <Box sx={{ ml: 1 }}>
                        <div style={{ display: 'flex' }}>
                          <AvatarGroup
                            // total={2}
                            max={3}
                          >
                            {/* <Tooltip title={con.user.username}> */}
                            {/* {tag.map((tagData: any, index: any) => ( */}
                            {item?.team &&
                              item?.team?.map((team: any, index: any) => (
                                <Avatar alt={team} src={team}>
                                  {team}
                                </Avatar>
                              ))}
                            {/* </Tooltip> */}
                            {/* )} */}
                          </AvatarGroup>
                        </div>
                      </Box>
                    </div>
                    <div className="lead-row2-col2">
                      {/* created on {formatDate(item.created_on)} by   &nbsp;<span> */}
                      created&nbsp; {FormateTime(item?.created_at)}&nbsp; by
                      <Avatar
                        alt={item?.created_by?.first_name}
                        src={item?.created_by?.profile_pic}
                        sx={{ ml: 1 }}
                        // style={{
                        //   height: '20px',
                        //   width: '20px'
                        // }}
                      />{' '}
                      &nbsp;&nbsp;{item?.created_by?.first_name}&nbsp;
                      {item?.created_by?.last_name}
                    </div>
                  </Stack>
                </Box>
                {/* Add more details as needed */}
              </Card>
            ))
          )}
        </List>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, justifyContent: 'center' }}
        >
          <Button
            onClick={() => handlePageChange('previous')}
            disabled={
              tab === 'open' ? openCurrentPage <= 1 : closedCurrentPage <= 1
            }
          >
            <FiChevronLeft />
          </Button>
          <Button
            onClick={() => handlePageChange('next')}
            disabled={
              tab === 'open'
                ? openCurrentPage >= openTotalPages
                : closedCurrentPage >= closedTotalPages
            }
          >
            <FiChevronRight />
          </Button>
        </Stack>
      </Box>
      <DeleteModal
        onClose={deleteLeadModalClose}
        open={deleteLeadModal}
        id={selectedId}
        modalDialog={modalDialog}
        modalTitle={modalTitle}
        DeleteItem={deleteItem}
      />
    </Box>
  );
}
