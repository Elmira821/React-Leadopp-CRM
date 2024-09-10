import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  Card,
  Link,
  Button,
  Avatar,
  Divider,
  TextField,
  Box,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  IconButton,
  Grid,
  Popover,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  FaEllipsisV,
  FaPaperclip,
  FaPlus,
  FaRegAddressCard,
  FaStar,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa';
import { CustomAppBar } from '../../components/CustomAppBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { LeadUrl, SERVER } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { Label } from '../../components/Label';
import {
  AntSwitch,
  CustomInputBoxWrapper,
  CustomSelectField,
  CustomSelectField1,
  FabLeft,
  FabRight,
  RequiredTextField,
  StyledListItemButton,
  StyledListItemText,
} from '../../styles/CssStyled';
import FormateTime from '../../components/FormateTime';
import { formatFileSize } from '../../components/FormatSize';
import '../../styles/style.css';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from 'react-icons/fi';

export const formatDate = (dateString: any) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

type FormErrors = {
  title?: string[];
  first_name?: string[];
  last_name?: string[];
  account_name?: string[];
  phone?: string[];
  email?: string[];
  lead_attachment?: string[];
  opportunity_amount?: string[];
  website?: string[];
  description?: string[];
  teams?: string[];
  assigned_to?: string[];
  contacts?: string[];
  status?: string[];
  source?: string[];
  address_line?: string[];
  street?: string[];
  city?: string[];
  state?: string[];
  postcode?: string[];
  country?: string[];
  tags?: string[];
  company?: string[];
  probability?: number[];
  industry?: string[];
  skype_ID?: string[];
  file?: string[];
};
type LeadAttachment = {
  id: string;
  created_by: string;
};
type Comments = {
  id: string;
};
type response = {
  created_by: {
    email: string;
    id: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  };
  user_details: {
    email: string;
    id: string;
    profile_pic: string;
  };
  created_at: string;
  created_on: string;
  created_on_arrow: string;
  date_of_birth: string;
  title: string;
  account_name: string;
  phone: string;
  email: string;
  lead_attachment: LeadAttachment[];
  opportunity_amount: string;
  website: string;
  description: string | '';
  teams: Team[];
  assigned_to: AssignedTo[];
  contacts: string;
  status: string;
  source: string;
  address_line: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  tags: [];
  company: string;
  probability: string;
  industry: string;
  skype_ID: string;
  file: string;

  close_date: string;
  organization: string;
  created_from_site: boolean;
  id: string;
};

interface UserDetails {
  email: string;
  first_name: string | null;
  last_name: string | null;
  id: string;
  is_active: boolean;
  job_title: string;
  profile_pic: string | null;
}

interface AssignedTo {
  address: string | null;
  alternate_phone: string;
  date_of_joining: string;
  expertise: string;
  has_marketing_access: boolean;
  has_sales_access: boolean;
  has_sales_representative_access: boolean;
  id: string;
  is_active: boolean;
  is_organization_admin: boolean;
  phone: string;
  role: string;
  user_details: UserDetails;
  workload: number;
}

interface Team {
  id: string;
  name: string;
  // other properties if needed
}

interface LeadDetails {
  assigned_to: AssignedTo[];
  // Add other properties of LeadDetails if necessary
}

interface Attachment {
  id: string;
  created_by: string;
  created_at: string;
  file_name: string;
  file_path: string;
  type: string; // Add type if it’s required
  file?: File; // Add this if you need access to the raw file
}

function LeadDetails(props: any) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [leadDetails, setLeadDetails] = useState<response | null>(null);
  const [usersDetails, setUsersDetails] = useState<
    Array<{
      user_details: {
        email: string;
        id: string;
        profile_pic: string;
      };
    }>
  >([]);
  /*  const [attachments, setAttachments] = useState<string[]>([]); */
  const [attachmentList, setAttachmentList] = useState<File[]>([]);
  const [tags, setTags] = useState([]);
  const [countries, setCountries] = useState<string[][]>([]);
  const [source, setSource] = useState([]);
  const [status, setStatus] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [comments, setComments] = useState<Comments[]>([]);
  const [commentList, setCommentList] = useState('Recent Last');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState();
  const [inputValue, setInputValue] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  /*   const [errors, setErrors] = useState<FormErrors>({}); */
  const [assignTo, setAssignTo] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState();

  const assignedUser = leadDetails?.assigned_to?.[0];

  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteRowModal, setDeleteRowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [openRecordsPerPage, setOpenRecordsPerPage] = useState<number>(10);
  const [closedRecordsPerPage, setClosedRecordsPerPage] = useState<number>(10);
  const [tab, setTab] = useState('open');
  const [openLoading, setOpenLoading] = useState(true);
  const [closedCurrentPage, setClosedCurrentPage] = useState<number>(1);
  const [openCurrentPage, setOpenCurrentPage] = useState<number>(1);
  const [closedLoading, setClosedLoading] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [openTotalPages, setOpenTotalPages] = useState<number>(1);
  const [closedTotalPages, setClosedTotalPages] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files); // Convert FileList to an array

    if (droppedFiles.length) {
      const newFileUrls = droppedFiles.map((file) => URL.createObjectURL(file)); // Generate URLs for each file

      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]); // Add new files to existing ones
      setFileUrls((prevUrls) => [...prevUrls, ...newFileUrls]); // Add new file URLs to existing ones
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
    }
  };

  const recordsList = [
    [10, '10 Records per page'],
    [20, '20 Records per page'],
    [30, '30 Records per page'],
    [40, '40 Records per page'],
    [50, '50 Records per page'],
  ];

  const handleRecordsPerPage = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as number;
    if (tab === 'open') {
      setOpenLoading(true);
      setOpenRecordsPerPage(value);
      setOpenCurrentPage(1);
    } else {
      setClosedLoading(true);
      setClosedRecordsPerPage(value);
      setClosedCurrentPage(1);
    }
  };
  const handlePreviousPage = () => {
    if (tab === 'open') {
      setOpenCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
      setOpenLoading(true);
    } else {
      setClosedCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
      setClosedLoading(true);
    }
  };

  const handleNextPage = () => {
    if (tab === 'open') {
      setOpenCurrentPage((prevPage) => Math.min(prevPage + 1, openTotalPages));
      setOpenLoading(true);
    } else {
      setClosedCurrentPage((prevPage) =>
        Math.min(prevPage + 1, closedTotalPages)
      );
      setClosedLoading(true);
    }
  };

  useEffect(() => {
    getLeadDetails(state.leadId);
  }, [state.leadId]);

  const getLeadDetails = (id: any) => {
    console.log('Lead Details:', leadDetails);
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    fetchData(`${LeadUrl}/${id}/`, 'GET', null as any, Header)
      .then((res) => {
        if (!res.error) {
          setLeadDetails(res?.lead_obj);
          setUsers(res?.users);
          setAttachments(res?.attachments);
          setTags(res?.tags);
          setCountries(res?.countries);
          setIndustries(res?.industries);
          setStatus(res?.status);
          setSource(res?.source);
          setUsers(res?.users);
          setContacts(res?.contacts);
          setSelectedContacts(res?.lead_obj.contacts[0]);
          setTeams(res?.teams);
          setComments(res?.comments);
          setAssignTo(res?.lead_obj.assigned_to[0]);
          console.log(res, 'this is res');
        }
      })
      .catch((err) => {
        // console.error('Error:', err)
        <Snackbar
          open={err}
          autoHideDuration={4000}
          onClose={() => navigate('/app/leads')}
        >
          <Alert
            onClose={() => navigate('/app/leads')}
            severity="error"
            sx={{ width: '100%' }}
          >
            Failed to load!
          </Alert>
        </Snackbar>;
      });
  };

  /* const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }; */

  const generateObjectURL = (file: File): string => {
    if (!(file instanceof File)) {
      console.error('Invalid file type:', file);
      throw new Error('Invalid file type');
    }
    return URL.createObjectURL(file);
  };

  useEffect(() => {
    const newFileUrls = files.map((file) => URL.createObjectURL(file));
    setFileUrls(newFileUrls);

    // Clean up URLs when component unmounts or files change
    return () => {
      newFileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const sendComment = () => {
    const headers: HeadersInit = {
      Accept: 'application/json',
      Authorization: localStorage.getItem('Token') || '', // Ensure it's a string
      org: localStorage.getItem('org') || '', // Ensure it's a string
    };

    const formData = new FormData();
    formData.append('comment', inputValue || note);
    if (!note) {
      setErrors({ comment: 'This field is required.' });
      return;
    }
    // Clear the error if comment is valid
    setErrors({});

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('lead_attachment', file, file.name);
      } else {
        console.error('Invalid file type:', file);
      }
    });

    fetch(`${SERVER}${LeadUrl}/${state.leadId}/`, {
      method: 'POST',
      headers, // Headers defined here
      body: formData, // FormData directly as body
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res: any) => {
        console.log('Form data:', res);
        if (!res.error) {
          resetForm();
          getLeadDetails(state?.leadId);
        } else {
          setErrors(res.errors || {});
        }
      })
      .catch((error: any) => {
        setError(error.message);
        console.error('Error:', error);
      });
  };
  console.log('Note:', note);
  console.log('Input Value:', inputValue);
  console.log('Attached Files:', attachedFiles);

  const getFullName = (user: AssignedTo | undefined): string => {
    if (!user) return 'Unassigned';
    const firstName = user.user_details.first_name || '';
    const lastName = user.user_details.last_name || '';
    return firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : user.user_details.email || 'Unassigned';
  };

  const backbtnHandle = () => {
    navigate('/app/deals/leads');
  };
  const resetForm = () => {
    setNote('');
    setInputValue('');
    /* setAttachedFiles([]); */ 
    setAttachmentList([]);
    setFiles([]);
    setFileUrls([]);
    /* setAttachments([]);  */
  };

  const editHandle = () => {
    // navigate('/contacts/edit-contacts', { state: { value: contactDetails, address: newAddress } })
    let country: string[] | undefined;
    for (country of countries) {
      if (
        Array.isArray(country) &&
        country.includes(leadDetails?.country || '')
      ) {
        const firstElement = country[0];
        break;
      }
    }
    console.log(selectedContacts, 'This is preNavigate selectedContacts');

    navigate('/app/leads/edit-lead', {
      state: {
        value: {
          title: leadDetails?.title,
          first_name: leadDetails?.created_by?.first_name,
          last_name: leadDetails?.created_by?.last_name,
          account_name: leadDetails?.account_name,
          phone: leadDetails?.phone,
          email: leadDetails?.email,
          lead_attachment: leadDetails?.lead_attachment,
          opportunity_amount: leadDetails?.opportunity_amount,
          website: leadDetails?.website,
          description: leadDetails?.description,
          teams: leadDetails?.teams,
          assigned_to: leadDetails?.assigned_to,
          contacts: leadDetails?.contacts,
          status: leadDetails?.status,
          source: leadDetails?.source,
          address_line: leadDetails?.address_line,
          street: leadDetails?.street,
          city: leadDetails?.city,
          state: leadDetails?.state,
          postcode: leadDetails?.postcode,
          country: country?.[0],
          tags: leadDetails?.tags,
          company: leadDetails?.company,
          probability: leadDetails?.probability,
          industry: leadDetails?.industry,
          skype_ID: leadDetails?.skype_ID,
          file: leadDetails?.file,
          close_date: leadDetails?.close_date,
          organization: leadDetails?.organization,
          created_from_site: leadDetails?.created_from_site,
        },
        id: state?.leadId,
        tags,
        countries,
        source,
        status,
        industries,
        users,
        contacts: state.contacts || [],
        selectedContacts: selectedContacts,
        teams,
        comments,
      },
    });
    console.log(assignTo, 'This is AssignTo LeadDetails');
    console.log(selectedContacts, 'This is selectedContacts LeadDetails');
    console.log(state, 'This is state LeadDetails');
  };

  /* const handleAttachmentClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const target = event.target;
    if (target?.files) {
      // Ensure target and files are not null
      const filesArray: File[] = Array.from(target.files); // Explicitly typing as File[]
      setAttachedFiles((prevFiles: File[]) => [...prevFiles, ...filesArray]); // Return a File[] array
    }
  }; */
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileInputChange = (event: any) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles((prevFiles: any) => [
        ...prevFiles,
        ...Array.from(files),
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Token or organization information is missing.');
      return;
    }

    try {
      const response = await fetch(`${SERVER}${LeadUrl}/attachment/${id}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
          org: org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting attachment: ${response.statusText}`);
      }

      // Re-fetch teams after deleting one
      sendComment();
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
      setSuccess(null);
    }
  };
  const handleDeleteComment = async (id: string) => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token || !org) {
      setError('Token or organization information is missing.');
      return;
    }

    try {
      const response = await fetch(`${SERVER}${LeadUrl}/comment/${id}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
          org: org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting comment: ${response.statusText}`);
      }

      // Re-fetch comments after deleting one
      sendComment();
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
      setSuccess(null);
    }
  };

  const deleteRow = (deleteId: string) => {
    setDeleteRowModal(true);
    setSelectedId(deleteId);
  };

  const deleteRowModalClose = () => {
    setDeleteRowModal(false);
    setSelectedId('');
  };
  const DeleteItem = async () => {
    if (selectedId) {
      console.log('selected id:', selectedId);
      await handleDelete(selectedId);
      await handleDeleteComment(selectedId);
      deleteRowModalClose();
    }
  };

  /*  const addAttachments = (e: any) => {
    // console.log(e.target.files?.[0], 'e');
    const files = e.target.files;
    if (files) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((attachments: string[]) => [
          ...(attachments || []),
          reader.result as string,
        ]);
      };
      reader.readAsDataURL(files[0]);
    }
    if (files) {
      const filesArray = Array.from(files);
      setAttachmentList((prevFiles: any) => [...prevFiles, ...filesArray]);
    }
  }; */

  /*   const handleClickFile = (
    event: React.MouseEvent<HTMLButtonElement>,
    pic: any
  ) => {
    setSelectedFile(pic);
    setAnchorEl(event.currentTarget);
  }; */

  const handleCloseFile = () => {
    setAnchorEl(null);
  };

  const deleteFile = () => {
    setAttachmentList((prevItems) =>
      prevItems.filter((item, i) => i !== selectedFile)
    );
    setAttachments((prevItems) =>
      prevItems.filter((item, i) => i !== selectedFile)
    );
    handleCloseFile();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  // console.log(attachedFiles, 'dsfsd', attachmentList, 'aaaaa', attachments);

  const module = 'Deals';
  const crntPage = 'Deal Details';
  const backBtn = 'Back To Leads';
  // console.log(tags, countries, source, status, industries, users, contacts, 'leaddetail')
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
          <Box sx={{ width: '65%' }}>
            <Box
              sx={{
                borderRadius: '10px',
                border: '1px solid #80808038',
                backgroundColor: 'white',
              }}
            >
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
                  Deal Information
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
                    }}
                  >
                    created &nbsp;
                    {FormateTime(leadDetails?.created_at)} &nbsp; by &nbsp;
                    <Avatar
                      src={leadDetails?.created_by?.profile_pic}
                      alt={leadDetails?.created_by?.email}
                    />
                    &nbsp; &nbsp;
                    {leadDetails?.created_by?.first_name}&nbsp;
                    {leadDetails?.created_by?.last_name}
                  </div>
                </div>
              </div>
              <div>
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mt: 1,
                  }}
                >
                  {/* {
                                                lead.assigned_to && lead.assigned_to.map((assignItem) => (
                                                    assignItem.user_details.profile_pic
                                                        ? */}

                  {usersDetails?.length
                    ? usersDetails.map((val: any, i: any) => (
                        <Avatar
                          key={i}
                          alt={val?.user_details?.email}
                          src={val?.user_details?.profile_pic}
                          sx={{ mr: 1 }}
                        />
                      ))
                    : ''}
                </Stack>

                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {leadDetails?.tags?.length
                    ? leadDetails?.tags.map((tagData: any) => (
                        <Label tags={tagData} />
                      ))
                    : ''}
                </Stack>
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
                  <div className="title2">Assignee</div>
                  <div className="title3">{getFullName(assignedUser)}</div>
                </div>

                <div style={{ width: '32%' }}>
                  <div className="title2">Status</div>
                  <div
                    className="title3"
                    style={{ textTransform: 'capitalize' }}
                  >
                    {leadDetails?.status}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Team</div>
                  <div className="title3">
                    {leadDetails?.teams?.length
                      ? leadDetails?.teams.map((team: Team) => (
                          <div key={team.id}>{team.name}</div>
                        ))
                      : '---'}
                  </div>
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
                  <div className="title2">Expected close date</div>
                  <div className="title3">
                    {leadDetails?.close_date || '---'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Account Name</div>
                  <div className="title3">{leadDetails?.account_name}</div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Organization Name</div>
                  <div className="title3">
                    {leadDetails?.organization || '---'}
                  </div>
                </div>
              </div>
              <div className="detailList">
                <div style={{ width: '32%' }}>
                  <div className="title2">Industry</div>
                  <div className="title3">{leadDetails?.industry || '---'}</div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Probability</div>
                  <div className="title3">
                    {leadDetails?.probability
                      ? `${leadDetails.probability}%`
                      : '---'}
                  </div>
                </div>
                <div style={{ width: '32%' }}>
                  <div className="title2">Website</div>
                  <div className="title3">
                    {leadDetails?.website ? (
                      <Link>{leadDetails?.website}</Link>
                    ) : (
                      '---'
                    )}
                  </div>
                </div>
              </div>
              {/* </div> */}
              {/* Contact details */}
              <div style={{ marginTop: '2%' }}>
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
                    Prospect Details
                  </div>
                </div>
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ width: '32%' }}>
                    <div className="title2">First Name</div>
                    <div className="title3">
                      {leadDetails?.created_by?.first_name || '---'}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">Last Name</div>
                    <div className="title3">
                      {leadDetails?.created_by?.last_name || '---'}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">Job Title</div>
                    <div className="title3">{leadDetails?.title || '---'}</div>
                  </div>
                </div>
                <div className="detailList">
                  <div style={{ width: '32%' }}>
                    <div className="title2">Email Address</div>
                    <div className="title3">
                      {leadDetails?.email ? (
                        <Link>
                          {leadDetails?.email}
                          {/* <FaStar
                            style={{ fontSize: '16px', fill: 'yellow' }}
                          /> */}
                        </Link>
                      ) : (
                        '---'
                      )}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">Mobile Number</div>
                    <div className="title3">
                      {leadDetails?.phone ? (
                        <div>{leadDetails?.phone}</div>
                      ) : (
                        '---'
                      )}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600 }} />
                    <div className="title3"></div>
                  </div>
                </div>
              </div>
              {/* Address details */}
              <div style={{ marginTop: '2%' }}>
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
                    Address Details
                  </div>
                </div>
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ width: '32%' }}>
                    <div className="title2">Address Line</div>
                    <div className="title3">
                      {leadDetails?.address_line || '---'}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">Street</div>
                    <div className="title3">{leadDetails?.street || '---'}</div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">City</div>
                    <div className="title3">{leadDetails?.city || '---'}</div>
                  </div>
                </div>
                <div className="detailList">
                  <div style={{ width: '32%' }}>
                    <div className="title2">Postcode</div>
                    <div className="title3">
                      {leadDetails?.postcode || '---'}
                    </div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">State</div>
                    <div className="title3">{leadDetails?.state || '---'}</div>
                  </div>
                  <div style={{ width: '32%' }}>
                    <div className="title2">Country</div>
                    <div className="title3">
                      {leadDetails?.country || '---'}
                    </div>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div style={{ marginTop: '3%' }}>
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
                {/* <p style={{ fontSize: '16px', color: 'gray', padding: '15px' }}> */}
                <Box sx={{ p: '15px' }}>
                  {leadDetails?.description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: leadDetails?.description,
                      }}
                    />
                  ) : (
                    '---'
                  )}
                </Box>
                {/* </p> */}
              </div>
              <div style={{ marginTop: '2%' }}>
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
                    style={{ fontWeight: 600, fontSize: '18px', color: 'red' }}
                  >
                    Lost Reason
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '16px',
                    color: 'gray',
                    padding: '15px',
                    marginTop: '5%',
                  }}
                >
                  {/* {lead && lead.description} */}
                  {/* fhj */}
                </p>
              </div>
            </Box>
          </Box>
          <Box sx={{ width: '34%' }}>
            <Box
              sx={{
                borderRadius: '10px',
                border: '1px solid #80808038',
                backgroundColor: 'white',
              }}
            >
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
                  Attachments
                </div>
                {/* Add Social #1E90FF */}
                {/* <Button
                  component="label"
                  variant="text"
                  startIcon={
                    <FaPlus style={{ fill: '#3E79F7', width: '12px' }} />
                  }
                  style={{
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                > */}
                {/* <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e: any) => addAttachments(e)}
                  /> */}
                {/* <input type="file" style={{ display: 'none' }}
                  multiple 
                  onChange={handleFileChange} />
                  Add Attachments
                </Button>  */}
              </div>

              <div>
                <div style={{ marginTop: '16px', marginLeft: '12px' }}>
                  {files.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          fontSize: '16px',
                          color: '#1a3353f0',
                        }}
                      >
                        Newly Uploaded Files:
                      </h3>
                      <ul>
                        {files.map((file, index) => {
                          const fileUrl = generateObjectURL(file);
                          return (
                            <li key={index} style={{ marginBottom: '8px' }}>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              {file.type.startsWith('image/') && (
                                <img
                                  src={fileUrl}
                                  alt={file.name}
                                  style={{
                                    width: '100px',
                                    height: '100px',
                                    marginLeft: '8px',
                                  }}
                                />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          fontSize: '16px',
                          color: '#1a3353f0',
                        }}
                      >
                        Existing Attachments:
                      </h3>
                      <ul>
                        {attachments.map((attachment, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>
                            <a
                              href={attachment.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {attachment.file_name}
                            </a>
                            <IconButton
                              color="error"
                              onClick={() => deleteRow(attachments?.[0].id)}
                            >
                              <FaTrashAlt
                                style={{
                                  fill: '#1A3353',
                                  cursor: 'pointer',
                                  width: '15px',
                                  marginLeft: '10px',
                                }}
                              />
                            </IconButton>

                            {/* Modal for Delete Confirmation */}
                            <Dialog
                              open={deleteRowModal}
                              onClose={deleteRowModalClose}
                            >
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogContent>
                                Are you sure you want to delete this item?
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={deleteRowModalClose}>
                                  Cancel
                                </Button>
                                <Button color="error" onClick={DeleteItem}>
                                  Delete
                                </Button>
                              </DialogActions>
                            </Dialog>
                            {/* If needed, add logic to display previews for images */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  marginTop: '2%',
                  maxHeight: '500px',
                  minHeight: '150px',
                  overflowY: 'scroll',
                }}
              >
                {/* {lead && lead.lead_attachment} */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',
                  }}
                >
                  {attachmentList?.length
                    ? attachmentList.map((pic: any, i: any) => (
                        <Box
                          key={i}
                          sx={{
                            width: '45%',
                            height: '35%',
                            border: '0.5px solid #ccc',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            alignSelf: 'auto',
                            flexShrink: 1,
                            mr: 2.5,
                            mb: 2,
                          }}
                        ></Box>
                      ))
                    : ''}
                </Box>
              </div>
            </Box>

            <Box
              sx={{
                borderRadius: '7px',
                mt: '15px',
                border: '1px solid #80808038',
                backgroundColor: 'white',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid lightgray',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginRight: '10px',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#1a3353f0',
                  }}
                >
                  Notes
                </div>

                {/* Wrapper for the "Records per page" and pagination controls */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px', // Adjust the spacing between the elements here
                  }}
                >
                  <TextField
                    select
                    name="recordsPerPage"
                    value={
                      tab === 'open' ? openRecordsPerPage : closedRecordsPerPage
                    }
                    onChange={handleRecordsPerPage}
                    InputProps={{
                      style: {
                        height: '40px',
                        maxHeight: '50px',
                        borderRadius: '7px',
                        width: '150px',
                      },
                    }}
                    sx={{ width: '27%' }}
                    className="custom-select"
                    SelectProps={{
                      open: selectOpen,
                      onOpen: () => setSelectOpen(true),
                      onClose: () => setSelectOpen(false),
                      IconComponent: selectOpen ? FiChevronUp : FiChevronDown,
                    }}
                  >
                    {recordsList.map((item, i) => (
                      <MenuItem key={i} value={item[0]}>
                        {item[1]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box
                    sx={{
                      borderRadius: '7px',
                      backgroundColor: 'white',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: '70px',
                      marginRight: '-90px',
                    }}
                  >
                    <FabLeft
                      onClick={handlePreviousPage}
                      disabled={
                        tab === 'open'
                          ? openCurrentPage === 1
                          : closedCurrentPage === 1
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
                        ? `Page ${openCurrentPage} of ${openTotalPages}`
                        : `Page ${closedCurrentPage} of ${closedTotalPages}`}
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
                </div>
              </div>
              <List sx={{ maxWidth: '500px' }}>
                {comments?.length ? (
                  comments.map((val: any, i: any) => (
                    <ListItem key={i} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          src={leadDetails?.created_by?.profile_pic}
                          alt={`${leadDetails?.created_by?.first_name} ${leadDetails?.created_by?.last_name}`}
                          title={`${leadDetails?.created_by?.first_name} ${leadDetails?.created_by?.last_name}`}
                        />

                        {/* <span style={{ marginLeft: '8px' }}>
    {`${leadDetails?.created_by?.first_name} ${leadDetails?.created_by?.last_name}`}
  </span> */}
                      </ListItemAvatar>

                      {/* <IconButton
                        color="error"
                        onClick={() => handleDeleteComment(comments[0]?.id)}
                      >
                        <DeleteIcon />
                      </IconButton> */}

                      <ListItemText
                        primary={
                          <Stack
                            sx={{
                              mt: 7,
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginLeft: '-56px',
                            }}
                          >
                            <Typography>{val.comment}</Typography>
                          </Stack>
                        }
                        secondary={
                          <React.Fragment>
                            {/* <a
                            style={{fontSize:'12px', marginLeft:'-55px'}}
                              href={attachments?.[0].file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {attachments?.[0].file_name}
                            </a>  */}
                            <Typography
                              sx={{
                                mt: 2,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                fontSize: '14px',
                                marginLeft: '-56px',
                              }}
                            >
                              {FormateTime(val?.commented_on)}
                              &nbsp;-&nbsp;
                              {leadDetails?.created_by?.first_name}&nbsp;
                              {leadDetails?.created_by?.last_name}
                            </Typography>
                            <span
                              style={{
                                textDecoration: 'underline',
                                marginLeft: '-56px',
                              }}
                            >
                              reply
                            </span>
                          </React.Fragment>
                        }
                      />
                      <Stack
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mr: -4,
                        }}
                      >
                        {/* <IconButton aria-label="comments">
                          <FaEllipsisV style={{ width: '7px' }} />
                        </IconButton> */}
                        <IconButton
                          color="error"
                          onClick={() => deleteRow(comments[0]?.id)}
                        >
                          <FaTrashAlt
                            style={{
                              fill: '#1A3353',
                              cursor: 'pointer',
                              width: '15px',
                            }}
                          />
                        </IconButton>
                        {/* Modal for Delete Confirmation */}
                        <Dialog
                          open={deleteRowModal}
                          onClose={deleteRowModalClose}
                        >
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogContent>
                            Are you sure you want to delete this item?
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={deleteRowModalClose}>
                              Cancel
                            </Button>
                            <Button color="error" onClick={DeleteItem}>
                              Delete
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </Stack>
                    </ListItem>
                  ))
                ) : (
                  <Typography style={{ padding: '20px', marginBottom: '10px' }}>
                    No comments available
                  </Typography>
                )}
              </List>
              <div style={{ padding: '20px', marginBottom: '10px' }}>
                <RequiredTextField
                  label="Add Note"
                  id="fullWidth"
                  value={note}
                  onChange={(e: any) => setNote(e.target.value)}
                  InputProps={{ style: { borderRadius: '10px' } }}
                  sx={{ mb: '30px', width: '100%', borderRadius: '10px' }}
                  error={!!errors.comment} // Assuming errors.comment is for the note field
                  helperText={errors.comment || ''}
                  // InputProps={{ disableUnderline: true }}
                />
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleAttachmentClick}
                  style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    backgroundColor: attachedFiles.length ? '#f9f9f9' : '#fff',
                  }}
                >
                  <p>Drag & Drop files here, or click to select files</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="fileUpload"
                    multiple
                  />
                  <label htmlFor="fileUpload" style={{ cursor: 'pointer' }}>
                    <strong>Click to select files</strong>
                  </label>
                </div>
                <CustomInputBoxWrapper
                  aria-label="qwe"
                  // className='CustomInputBoxWrapper'
                  contentEditable="true"
                  onInput={(e: any) => setInputValue(e.currentTarget.innerText)}
                  // onInput={(e: React.SyntheticEvent<HTMLDivElement>) => setInputValue(e.currentTarget.innerText)}
                  // onInput={(e) => setInputValue(e.target.innerText)}
                >
                  {files.length > 0 && (
                    <div>
                      <strong>Attached Files:</strong>
                      <ul>
                        {files.map((file: any, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CustomInputBoxWrapper>
                <Box
                  sx={{
                    pt: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    border: '1px solid #ccc',
                    borderTop: 'none',
                    mt: '-5px',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    pb: '10px',
                  }}
                >
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef} // Using the same ref to avoid redundant inputs
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <Button component="label" onClick={handleAttachmentClick}>
                    <FaPaperclip style={{ fill: 'gray' }} />
                  </Button>

                  {/* Your Button to trigger the file input */}
                  {/*  <Button
                    component="label"
                    onClick={() =>
                      document.getElementById('fileInput')?.click()
                    }
                  >
                    <FaPaperclip style={{ fill: 'gray' }} />
                  </Button> */}

                  <Grid container justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      color="inherit"
                      disableFocusRipple
                      disableRipple
                      disableTouchRipple
                      sx={{
                        backgroundColor: '#808080b5',
                        borderRadius: '8px',
                        color: 'white',
                        textTransform: 'none',
                        ml: '8px',
                        '&:hover': { backgroundColor: '#C0C0C0' },
                      }}
                      onClick={resetForm}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#1976d2',
                        borderRadius: '8px',
                        textTransform: 'none',
                        ml: '8px',
                        mr: '12px',
                      }}
                      onClick={sendComment}
                    >
                      Send
                    </Button>
                  </Grid>
                </Box>
              </div>
            </Box>
          </Box>
        </Box>
      </div>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFile}
      >
        <List disablePadding>
          <ListItem disablePadding>
            <StyledListItemButton onClick={deleteFile}>
              <ListItemIcon>
                {' '}
                <FaTimes fill="#3e79f7" />
              </ListItemIcon>
              <StyledListItemText
                primary={'Remove'}
                sx={{ ml: '-20px', color: '#3e79f7' }}
              />
            </StyledListItemButton>
          </ListItem>
        </List>
      </Popover>
    </Box>
  );
}
export default LeadDetails;
