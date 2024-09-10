import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  FormControl,
  TextareaAutosize,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  MenuItem,
  InputAdornment,
  Chip,
  Autocomplete,
  FormHelperText,
  IconButton,
  Tooltip,
  Divider,
  Select,
  Button,
} from '@mui/material';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import '../../styles/style.css';
import { LeadUrl, SERVER, TeamsUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  FaArrowDown,
  FaCheckCircle,
  FaFileUpload,
  FaPalette,
  FaPercent,
  FaPlus,
  FaTimes,
  FaTimesCircle,
  FaUpload,
} from 'react-icons/fa';
import { useForm } from '../../components/UseForm';
import {
  CustomPopupIcon,
  CustomSelectField,
  RequiredTextField,
  StyledSelect,
} from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';

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
interface FormData {
  title: string;
  first_name: string;
  last_name: string;
  account_name: string;
  phone: string;
  email: string;
  lead_attachment: string | null;
  opportunity_amount: string;
  website: string;
  description: string;
  teams: string;
  assigned_to: string[];
  contacts: string[];
  status: string;
  source: string;
  address_line: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  tags: string[];
  company: string;
  probability: number;
  industry: string;
  skype_ID: string;
  file: string | null;
}

const LEAD_STATUS = [
  { value: 'lead', label: 'Lead' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'closed', label: 'Closed' },
];

export function AddLeads() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const autocompleteRef = useRef<any>(null);
  const [error, setError] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [selectedAssignTo, setSelectedAssignTo] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any[]>([]);
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [industrySelectOpen, setIndustrySelectOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    first_name: '',
    last_name: '',
    account_name: '',
    phone: '',
    email: '',
    lead_attachment: null,
    opportunity_amount: '',
    website: '',
    description: '',
    teams: '',
    assigned_to: [],
    contacts: [],
    status: 'lead',
    source: 'call',
    address_line: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    tags: [],
    company: '',
    probability: 50,
    industry: 'ADVERTISING',
    skype_ID: '',
    file: null,
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');

      if (!token || !org) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${SERVER}${TeamsUrl}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token,
            org: org,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching teams: ${response.statusText}`);
        }

        const data = await response.json();
        setSelectedTeams(data.teams);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (quill) {
      initialContentRef.current = quillRef.current.firstChild.innerHTML;
    }
  }, [quill]);

  const handleChange2 = (title: any, val: any) => {
    if (title === 'contacts') {
      setFormData({
        ...formData,
        contacts: val.length > 0 ? val.map((item: any) => item.id) : [],
      });
      setSelectedContacts(val);
    } else if (title === 'teams') {
      setFormData({
        ...formData,
        teams: val.length > 0 ? val.map((item: any) => item.id) : [],
      });
      setSelectedTeams(val);
    } else if (title === 'assigned_to') {
      setFormData({
        ...formData,
        assigned_to: val ? [val.id] : [],
      });
      setSelectedAssignTo(val);
    } else if (title === 'tags') {
      setFormData({
        ...formData,
        tags: val.length > 0 ? val.map((item: any) => item.id) : [],
      });
      setSelectedTags(val);
    } else {
      setFormData({ ...formData, [title]: val });
    }
  };

  const handleChange = (e: any) => {
    const { name, value, files, type, checked, id } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files?.[0] || null });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        lead_attachment: file.name,
        file: prevData.file,
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          file: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetQuillToInitialState = () => {
    setFormData({ ...formData, description: '' });
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
  };

  const submitForm = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    const data = {
      title: formData.title,
      first_name: formData.first_name,
      last_name: formData.last_name,
      account_name: formData.account_name,
      phone: formData.phone,
      email: formData.email,
      lead_attachment: formData.file,
      opportunity_amount: formData.opportunity_amount,
      website: formData.website,
      description: formData.description,
      teams: formData.teams,
      assigned_to: formData.assigned_to,
      contacts: formData.contacts,
      status: formData.status,
      source: formData.source,
      address_line: formData.address_line,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      country: formData.country,
      tags: formData.tags,
      company: formData.company,
      probability: formData.probability,
      industry: formData.industry,
      skype_ID: formData.skype_ID,
    };

    fetchData(`${LeadUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res) => {
        if (!res.error) {
          setSuccessMessage('Lead added successfully!');
          navigate('/app/deals/leads');
        } else {
          setError(true);
          setErrors(res.errors || {});
          setErrorMessage('Failed to add lead. Please check your inputs.');
        }
      })
      .catch(() => {
        setErrorMessage('An error occurred while submitting the form.');
      });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      account_name: '',
      phone: '',
      email: '',
      lead_attachment: null,
      opportunity_amount: '',
      website: '',
      description: '',
      teams: '',
      assigned_to: [],
      contacts: [],
      status: 'lead',
      source: 'call',
      address_line: '',
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      tags: [],
      company: '',
      probability: 50,
      industry: 'ADVERTISING',
      skype_ID: '',
      file: null,
    });
    setErrors({});
    setSelectedContacts([]);
    setSelectedAssignTo([]);
    setSelectedTags([]);
    setSelectedTeams([]);
  };

  const onCancel = () => {
    resetForm();
  };

  const backbtnHandle = () => {
    navigate('/app/deals/leads');
  };

  const module = 'Leads';
  const crntPage = 'Add Leads';
  const backBtn = 'Back To Leads';

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar
        backbtnHandle={backbtnHandle}
        module={module}
        backBtn={backBtn}
        crntPage={crntPage}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
      <Box sx={{ mt: '120px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Lead Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Lead Name</div>
                        <RequiredTextField
                          name="account_name"
                          required
                          value={formData.account_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.account_name?.[0]
                              ? errors?.account_name[0]
                              : ''
                          }
                          error={!!errors?.account_name?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Amount</div>
                        <TextField
                          type={'number'}
                          name="opportunity_amount"
                          value={formData.opportunity_amount}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.opportunity_amount?.[0]
                              ? errors?.opportunity_amount[0]
                              : ''
                          }
                          error={!!errors?.opportunity_amount?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Website</div>
                        <TextField
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.website?.[0] ? errors?.website[0] : ''
                          }
                          error={!!errors?.website?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Contact Name</div>
                        <FormControl
                          error={!!errors?.contacts?.[0]}
                          sx={{ width: '70%' }}
                        >
                          <Autocomplete
                            multiple
                            value={selectedContacts}
                            limitTags={2}
                            options={state?.contacts || []}
                            getOptionLabel={(option: any) =>
                              state?.contacts ? option?.first_name : option
                            }
                            onChange={(e: any, value: any) =>
                              handleChange2('contacts', value)
                            }
                            size="small"
                            filterSelectedOptions
                            renderTags={(value: any, getTagProps: any) =>
                              value.map((option: any, index: any) => (
                                <Chip
                                  deleteIcon={
                                    <FaTimes style={{ width: '9px' }} />
                                  }
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    height: '18px',
                                  }}
                                  variant="outlined"
                                  label={
                                    state?.contacts
                                      ? option?.first_name
                                      : option
                                  }
                                  {...getTagProps({ index })}
                                />
                              ))
                            }
                            popupIcon={
                              <CustomPopupIcon>
                                <FaPlus className="input-plus-icon" />
                              </CustomPopupIcon>
                            }
                            renderInput={(params: any) => (
                              <TextField
                                {...params}
                                placeholder="Add Contacts"
                                InputProps={{
                                  ...params.InputProps,
                                  sx: {
                                    '& .MuiAutocomplete-popupIndicator': {
                                      '&:hover': { backgroundColor: 'white' },
                                    },
                                    '& .MuiAutocomplete-endAdornment': {
                                      mt: '0px',
                                      mr: '-8px',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                          <FormHelperText>
                            {errors?.contacts?.[0] || ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Team</div>
                        <FormControl
                          error={!!errors?.teams?.[0]}
                          sx={{ width: '70%' }}
                        >
                          <Autocomplete
                            multiple
                            limitTags={2}
                            options={selectedTeams}
                            getOptionLabel={(option: any) =>
                              option?.name || option
                            }
                            onChange={(e: any, value: any) =>
                              handleChange2('teams', value)
                            }
                            size="small"
                            filterSelectedOptions
                            renderTags={(value: any, getTagProps: any) =>
                              value.map((option: any, index: any) => (
                                <Chip
                                  key={index}
                                  deleteIcon={
                                    <FaTimes style={{ width: '9px' }} />
                                  }
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    height: '18px',
                                  }}
                                  variant="outlined"
                                  label={option?.name || option}
                                  {...getTagProps({ index })}
                                />
                              ))
                            }
                            popupIcon={
                              <CustomPopupIcon>
                                <FaPlus className="input-plus-icon" />
                              </CustomPopupIcon>
                            }
                            renderInput={(params: any) => (
                              <TextField
                                {...params}
                                placeholder="Select a Team"
                                variant="outlined"
                                error={!!errors?.teams?.[0]}
                                InputProps={{
                                  ...params.InputProps,
                                  sx: {
                                    '& .MuiAutocomplete-popupIndicator': {
                                      '&:hover': { backgroundColor: 'white' },
                                    },
                                    '& .MuiAutocomplete-endAdornment': {
                                      mt: '0px',
                                      mr: '-8px',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                          <FormHelperText>
                            {errors?.teams?.[0] || ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Assign To</div>
                        <FormControl
                          error={!!errors?.assigned_to?.[0]}
                          sx={{ width: '70%' }}
                        >
                          <Autocomplete
                            value={selectedAssignTo}
                            options={state?.users || []}
                            getOptionLabel={(option: any) =>
                              state?.users ? option?.user__email : option
                            }
                            onChange={(e: any, value: any) =>
                              handleChange2('assigned_to', value)
                            }
                            size="small"
                            filterSelectedOptions
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip
                                  deleteIcon={
                                    <FaTimes style={{ width: '9px' }} />
                                  }
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    height: '18px',
                                  }}
                                  variant="outlined"
                                  label={
                                    state?.users ? option?.user__email : option
                                  }
                                  {...getTagProps({ index })}
                                />
                              ))
                            }
                            popupIcon={
                              <CustomPopupIcon>
                                <FaPlus className="input-plus-icon" />
                              </CustomPopupIcon>
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Add User"
                                error={!!errors?.assigned_to?.[0]}
                                InputProps={{
                                  ...params.InputProps,
                                  sx: {
                                    '& .MuiAutocomplete-popupIndicator': {
                                      '&:hover': { backgroundColor: 'white' },
                                    },
                                    '& .MuiAutocomplete-endAdornment': {
                                      mt: '0px',
                                      mr: '-8px',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                          <FormHelperText>
                            {errors?.assigned_to?.[0] || ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Status</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="status"
                            value={formData.status}
                            open={statusSelectOpen}
                            onOpen={() => setStatusSelectOpen(true)}
                            onClose={() => setStatusSelectOpen(false)}
                            onChange={handleChange}
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setStatusSelectOpen(!statusSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {statusSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className="select"
                            error={!!errors?.status}
                          >
                            {LEAD_STATUS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors?.status ? errors.status : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Probability</div>
                        <TextField
                          name="probability"
                          value={formData.probability}
                          onChange={handleChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  disableFocusRipple
                                  disableTouchRipple
                                  sx={{
                                    backgroundColor: '#d3d3d34a',
                                    width: '45px',
                                    borderRadius: '0px',
                                    mr: '-12px',
                                  }}
                                >
                                  <FaPercent style={{ width: '12px' }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.probability?.[0]
                              ? errors?.probability[0]
                              : ''
                          }
                          error={!!errors?.probability?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Lead Source</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="source"
                            value={formData.source}
                            open={sourceSelectOpen}
                            onClick={() =>
                              setSourceSelectOpen(!sourceSelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setSourceSelectOpen(!sourceSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {sourceSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.source?.[0]}
                          >
                            {state?.source?.length
                              ? state?.source.map((option: any) => (
                                  <MenuItem key={option[0]} value={option[0]}>
                                    {option[1]}
                                  </MenuItem>
                                ))
                              : ''}
                          </Select>
                          <FormHelperText>
                            {errors?.source?.[0] ? errors?.source[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Industry</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="industry"
                            value={formData.industry}
                            open={industrySelectOpen}
                            onClick={() =>
                              setIndustrySelectOpen(!industrySelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setIndustrySelectOpen(!industrySelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {industrySelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.industry?.[0]}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  height: '200px',
                                },
                              },
                            }}
                          >
                            {state?.industries?.length
                              ? state?.industries.map((option: any) => (
                                  <MenuItem key={option[0]} value={option[1]}>
                                    {option[1]}
                                  </MenuItem>
                                ))
                              : ''}
                          </Select>
                          <FormHelperText>
                            {errors?.industry?.[0] ? errors?.industry[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Lead Attachment</div>
                        <TextField
                          name="lead_attachment"
                          value={formData.lead_attachment}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  disableFocusRipple
                                  disableTouchRipple
                                  sx={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'whitesmoke',
                                    borderRadius: '0px',
                                    mr: '-13px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <label htmlFor="icon-button-file">
                                    <input
                                      hidden
                                      accept="image/*"
                                      id="icon-button-file"
                                      type="file"
                                      name="account_attachment"
                                      onChange={(e: any) => {
                                        handleFileChange(e);
                                      }}
                                    />
                                    <FaUpload
                                      color="primary"
                                      style={{
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                      }}
                                    />
                                  </label>
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.lead_attachment?.[0]
                              ? errors?.lead_attachment[0]
                              : ''
                          }
                          error={!!errors?.lead_attachment?.[0]}
                        />
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* contact details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">Prospect</Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">First Name</div>
                        <RequiredTextField
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.first_name?.[0] ? errors?.first_name[0] : ''
                          }
                          error={!!errors?.first_name?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Last Name</div>
                        <RequiredTextField
                          name="last_name"
                          required
                          value={formData.last_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.last_name?.[0] ? errors?.last_name[0] : ''
                          }
                          error={!!errors?.last_name?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Job Title</div>
                        <RequiredTextField
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.title?.[0] ? errors?.title[0] : ''
                          }
                          error={!!errors?.title?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Mobile Number</div>
                        <Tooltip title="Number must starts with +31">
                          <TextField
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '70%' }}
                            size="small"
                            helperText={
                              errors?.phone?.[0] ? errors?.phone[0] : ''
                            }
                            error={!!errors?.phone?.[0]}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <div
                      className="fieldSubContainer"
                      style={{ marginLeft: '5%', marginTop: '19px' }}
                    >
                      <div className="fieldTitle">Email Address</div>
                      <TextField
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '70%' }}
                        size="small"
                        helperText={errors?.email?.[0] ? errors?.email[0] : ''}
                        error={!!errors?.email?.[0]}
                      />
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* address details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">Address</Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Address Line</div>
                        <TextField
                          name="address_line"
                          value={formData.address_line}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.address_line?.[0]
                              ? errors?.address_line[0]
                              : ''
                          }
                          error={!!errors?.address_line?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">City</div>
                        <TextField
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={errors?.city?.[0] ? errors?.city[0] : ''}
                          error={!!errors?.city?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Street</div>
                        <TextField
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.street?.[0] ? errors?.street[0] : ''
                          }
                          error={!!errors?.street?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">State</div>
                        <TextField
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.state?.[0] ? errors?.state[0] : ''
                          }
                          error={!!errors?.state?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Postcode</div>
                        <TextField
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.postcode?.[0] ? errors?.postcode[0] : ''
                          }
                          error={!!errors?.postcode?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Country</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="country"
                            value={formData.country}
                            open={countrySelectOpen}
                            onClick={() =>
                              setCountrySelectOpen(!countrySelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setCountrySelectOpen(!countrySelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {countrySelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  height: '200px',
                                },
                              },
                            }}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.country?.[0]}
                          >
                            {state?.countries?.length
                              ? state?.countries.map((option: any) => (
                                  <MenuItem key={option[0]} value={option[0]}>
                                    {option[1]}
                                  </MenuItem>
                                ))
                              : ''}
                          </Select>
                          <FormHelperText>
                            {errors?.country?.[0] ? errors?.country[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Description details  */}
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Description
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="DescriptionDetail">
                      <div className="descriptionTitle">Description</div>
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div ref={quillRef} />
                      </div>
                    </div>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 1.5,
                      }}
                    >
                      <Button
                        className="header-button"
                        onClick={resetQuillToInitialState}
                        size="small"
                        variant="contained"
                        startIcon={
                          <FaTimesCircle
                            style={{
                              fill: 'white',
                              width: '16px',
                              marginLeft: '2px',
                            }}
                          />
                        }
                        sx={{
                          backgroundColor: '#2b5075',
                          ':hover': { backgroundColor: '#1e3750' },
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        className="header-button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            description: quillRef.current.firstChild.innerHTML,
                          });
                        }}
                        variant="contained"
                        size="small"
                        startIcon={
                          <FaCheckCircle
                            style={{
                              fill: 'white',
                              width: '16px',
                              marginLeft: '2px',
                            }}
                          />
                        }
                        sx={{ ml: 1 }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </form>
      </Box>
    </Box>
  );
}
