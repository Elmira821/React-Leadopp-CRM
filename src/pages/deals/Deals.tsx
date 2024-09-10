import React, { useState, useEffect } from 'react';
import { Box, Button, Tabs } from '@mui/material';
import {
  LeadUrl,
  ProfileUrl,
  SERVER,
} from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { CustomTab, CustomToolbar } from '../../styles/CssStyled';
import '../../styles/style.css';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import LeadsColumn from './LeadsColumn';
import MeetingColumn from './MeetingColumn';
import OpportunityColumn from './OpportunityColumn';
import QualifiedColumn from './QualifiedColumn';
import NegotiationColumn from './NegotiationColumn';
import WonColumn from './WonColumn';

const Deals: React.FC = () => {
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
  }, []);

  // Define inline styles as JavaScript objects
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    marginLeft: '1em',
    marginTop: '3em',
  };

  const columnsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0',
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
          // status: leads.status, source: leads.source, industry: leads.industries, users: leads.users, tags: leads.tags, contacts: leads.contacts
        },
      });
    }
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
      const res = await fetchData(
        `${LeadUrl}/?limit=50&page=${currentPage}`,
        'GET',
        null as any,
        Header
      ); // Added page parameter for pagination

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

        // Handle user-specific logic
        if (userRole === 'ADMIN') {
          setLeads(res?.open_leads?.open_leads);
        } else {
          const userLeads = res?.open_leads?.open_leads?.filter(
            (lead: any) => lead.assigned_to?.[0]?.id === profileId
          );
          setLeads(userLeads);
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
    <Box
      sx={{
        mt: '60px',
      }}
    >
      <CustomToolbar>
        <Tabs sx={{ mt: '26px' }}>
          <CustomTab
            value="open"
            label="Open"
            sx={{
              backgroundColor: 'white',
              color: 'darkblue',
            }}
          />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<FiPlus className="plus-icon" />}
          onClick={onAddHandle}
          className={'add-button'}
        >
          Add Lead
        </Button>
      </CustomToolbar>

      <div style={containerStyle}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={columnsStyle}>

            <LeadsColumn />

            <MeetingColumn />

            <OpportunityColumn />

            <QualifiedColumn />

            <NegotiationColumn />

            <WonColumn />

          </div>
        </DragDropContext>
      </div>
    </Box>
  );
};

export default Deals;
