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
import { LeadUrl, SERVER, TeamsUrl } from '../../services/ApiUrls';
import { fetchData, Header } from '../../components/FetchData';
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
import {
  CustomPopupIcon,
  CustomSelectField,
  RequiredTextField,
  StyledSelect,
} from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import '../../styles/style.css';

// const useStyles = makeStyles({
//   btnIcon: {
//     height: '14px',
//     color: '#5B5C63'
//   },
//   breadcrumbs: {
//     color: 'white'
//   },
//   fields: {
//     height: '5px'
//   },
//   chipStyle: {
//     backgroundColor: 'red'
//   },
//   icon: {
//     '&.MuiChip-deleteIcon': {
//       color: 'darkgray'
//     }
//   }
// })

// const textFieldStyled = makeStyles(() => ({
//   root: {
//     borderLeft: '2px solid red',
//     height: '35px'
//   },
//   fieldHeight: {
//     height: '35px'
//   }
// }))

// function getStyles (name, personName, theme) {
//   return {
//     fontWeight:
//       theme.typography.fontWeightRegular
//   }
// }

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
interface LeadAttachment {
  id: string;
  file_name: string;
  created_by: string;
}
interface FormData {
  title: string;
  first_name: string;
  last_name: string;
  account_name: string;
  phone: string;
  email: string;
  lead_attachment: LeadAttachment[];
  opportunity_amount: string;
  website: string;
  description: string;
  teams: string;
  assigned_to: string[];
  contacts: string;
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

export function EditLead() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { quill, quillRef } = useQuill();
  // const initialContentRef = useRef(null);
  const initialContentRef = useRef<string | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  const [hasInitialFocus, setHasInitialFocus] = useState(false);

  const autocompleteRef = useRef<any>(null);
  const [reset, setReset] = useState(false);
  const [error, setError] = useState(false);
  //const [selectedContacts, setSelectedContacts] = useState<any[]>([] || '');
  const [selectedContacts, setSelectedContacts] = useState('');
  const [selectedAssignTo, setSelectedAssignTo] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([] || '');
  const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedCountry, setSelectedCountry] = useState<any[]>([] || '');
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
    lead_attachment: [],
    opportunity_amount: '',
    website: '',
    description: '',
    teams: '',
    assigned_to: [],
    contacts: '',
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
    probability: 1,
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
        console.log('teams data:', data.teams)
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTeams();
  }, []); 

  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
    // Set focus to the page container after the Quill editor loads its content
    if (quill && !hasInitialFocus) {
      quill.on('editor-change', () => {
        if (pageContainerRef.current) {
          pageContainerRef.current.focus();
          setHasInitialFocus(true); // Set the flag to true after the initial focus
        }
      });
    }
    // Cleanup: Remove event listener when the component unmounts
    return () => {
      if (quill) {
        quill.off('editor-change');
      }
    };
  }, [quill, hasInitialFocus]);

  useEffect(() => {
    if (state) {
      setFormData((prev) => ({
        ...prev,
        ...state.value, // Ensure state.value matches FormData structure
      }));
      setSelectedTeams(state.value.teams || []);
    }
  }, [state?.id]);

  useEffect(() => {
    setSelectedAssignTo([state.selectedAssignTo?.id]);
    setSelectedContacts(state.selectedContacts?.id);
  }, [state.selectedAssignTo?.id, state.selectedContacts]);

  useEffect(() => {
    // Log selectedAssignTo after it has been updated
    console.log(selectedAssignTo, 'This is selectedAssignTo Edit');
    console.log(selectedContacts, 'This is selectedContacts Edit');
  }, [selectedAssignTo, selectedContacts]);

  useEffect(() => {
    if (reset) {
      setFormData(state?.value);
      if (quill && initialContentRef.current !== null) {
        quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
      }
    }
    return () => {
      setReset(false);
    };
  }, [reset, quill, state?.value]);

  useEffect(() => {
    if (quill && initialContentRef.current === null) {
      // Save the initial state (HTML content) of the Quill editor only if not already saved
      initialContentRef.current = formData.description;
      quill.clipboard.dangerouslyPasteHTML(formData.description);
    }
  }, [quill, formData.description]);

  // useEffect(() => {
  //     if (quill && initialContentRef.current === null) {
  //       // Save the initial state (HTML content) of the Quill editor only if not already saved
  //       initialContentRef.current = quillRef.current.firstChild.innerHTML;
  //     }
  //   }, [quill]);
  // useEffect(() => {
  //     if (quill) {
  //         // Save the initial state (HTML content) of the Quill editor
  //         initialContentRef.current = quillRef.current.firstChild.innerHTML;
  //     }
  // }, [quill]);

  // useEffect(() => {
  //     if (quill) {
  //       quill.clipboard.dangerouslyPasteHTML(formData.description);
  //     }
  //   }, [quill]);

  // const changeHandler = (event: any) => {
  //   if (event.target.files[0]) {
  //     // setLogo(event.target.files[0])
  //     const reader = new FileReader()
  //     reader.addEventListener('load', () => {
  //       // setImgData(reader.result)
  //       // setLogot(true)
  //     })
  //     val.lead_attachment = event.target.files[0]
  //   }
  // }

  const handleChange2 = (title: any, val: any) => {
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // console.log('nd', val)
    if (title === 'contacts') {
      setFormData({
        ...formData,
        contacts: val ? val.id : '',
        //contacts: val.length > 0 ? val.map((item: any) => item.id) : []
      });
      setSelectedContacts(val.id);
    } else if (title === 'assigned_to') {
      setFormData({
        ...formData,
        assigned_to: val ? [val.id] : [],
      });
      setSelectedAssignTo([val.id]);
    }  else if (title === 'teams') {
      setFormData({
        ...formData,
        teams: val.length > 0 ? val.map((item: any) => item.id) : [],
      });
      setSelectedTeams(val);
    } else if (title === 'tags') {
      setFormData({
        ...formData,
        tags: val.length > 0 ? val.map((item: any) => item.id) : [],
      });
      setSelectedTags(val);
    }
    // else if (title === 'country') {
    //   setFormData({ ...formData, country: val || [] })
    //   setSelectedCountry(val);
    // }
    else {
      setFormData({ ...formData, [title]: val });
    }
  };
  const handleChange = (e: any) => {
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // console.log('e.target',e)
    const { name, value, files, type, checked, id } = e.target;
    // console.log('auto', val)
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const resetQuillToInitialState = () => {
    // Reset the Quill editor to its initial state
    setFormData({ ...formData, description: '' });
    // if (quill && initialContentRef.current !== null) {
    //     quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    // }
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML('');
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
  };
  const submitForm = () => {
    const data = {
      title: formData.title,
      first_name: formData.first_name,
      last_name: formData.last_name,
      account_name: formData.account_name,
      phone: formData.phone,
      email: formData.email,
      lead_attachment: formData.file || [],
      opportunity_amount: formData.opportunity_amount,
      website: formData.website,
      description: formData.description,
      teams: formData.teams,
      assigned_to: selectedAssignTo,
      contacts: selectedContacts,
      status: formData.status,
      source: formData.source,
      address_line: formData.address_line,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      country: formData.country,
      tags: formData.tags || [],
      company: formData.company || '',
      probability: formData.probability,
      industry: formData.industry,
      skype_ID: formData.skype_ID,
    };
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    // console.log(data, 'edit')
    fetchData(`${LeadUrl}/${state?.id}/`, 'PUT', JSON.stringify(data), Header)
      .then((res: any) => {
        console.log('Form data:', res);
        if (!res.error) {
          backbtnHandle();
          // setResponceError(data.error)
          // navigate('/contacts')
          // resetForm()
        }
        if (res.error) {
          setError(true);
          setErrors(res?.errors);
        }
      })
      .catch(() => {});
  };
  const resetForm = () => {
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      account_name: '',
      phone: '',
      email: '',
      lead_attachment: [],
      opportunity_amount: '',
      website: '',
      description: '',
      teams: '',
      assigned_to: [],
      contacts: '',
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
      probability: 1,
      industry: 'ADVERTISING',
      skype_ID: '',
      file: null,
    });
    setErrors({});
    //setSelectedContacts([]);
    // setSelectedAssignTo([]);
    setSelectedTags([]);
    // setSelectedCountry([])
    // if (autocompleteRef.current) {
    //   console.log(autocompleteRef.current,'ccc')
    //   autocompleteRef.current.defaultValue([]);
    // }
  };
  const onCancel = () => {
    // resetForm()
    setReset(true);
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
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
  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0] || null;
  //     if (file) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //             // setFormData({ ...formData, lead_attachment: reader.result as string });
  //             setFormData({ ...formData, file: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);
  //     }
  // };
  const backbtnHandle = () => {
    navigate('/app/deals/deal-details', {
      state: {
        leadId: state?.id,
        detail: true,
        selectedAssignTo: selectedAssignTo,
        selectedContacts: selectedContacts,
      },
    });
    console.log(state, 'This is backbutton');
    // navigate('/app/leads')
  };

  const module = 'Deals';
  const crntPage = 'Edit Deal';
  const backBtn = 'Back To Deal Details';

  // console.log(formData, 'leadsform')
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
                        <TextField
                          ref={pageContainerRef}
                          tabIndex={-1}
                          autoFocus
                          name="account_name"
                          value={formData.account_name || ''}
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
                          value={formData.opportunity_amount || ''}
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
                            //multiple
                            value={state.selectedContacts}
                            //limitTags={1}
                            options={state.contacts || ''}
                            getOptionLabel={(option: any) =>
                              state.contacts ? option?.first_name : option
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
                                    state.contacts ? option?.first_name : option
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
                            // ref={autocompleteRef}
                            //multiple
                            //value={formData.assigned_to || ''}
                            value={state.selectedAssignTo}
                            // name='contacts'
                            //limitTags={2}
                            options={state?.users || []}
                            //options={state?.users?.filter(
                            //(user :any) => !selectedAssignTo.map((item) => item.id).includes(user.id)
                            //)}
                            // options={state.contacts ? state.contacts.map((option: any) => option) : ['']}
                            getOptionLabel={(option: any) =>
                              state?.users
                                ? option?.user_details?.email
                                : option
                            }
                            // getOptionLabel={(option: any) => option?.user__email}
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
                                    state?.users
                                      ? option?.user_details?.email
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
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Add User"
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
                              : [['ADVERTISING', 'ADVERTISING']].map(
                                  (option: any) => (
                                    <MenuItem key={option[0]} value={option[1]}>
                                      {option[1]}
                                    </MenuItem>
                                  )
                                )}
                          </Select>
                          <FormHelperText>
                            {errors?.industry?.[0] ? errors?.industry[0] : ''}
                          </FormHelperText>
                        </FormControl>
                        {/* <FormControl sx={{ width: '70%' }} error={!!errors?.industry?.[0]}>
                          <Select
                            // multiple
                            value={formData.industry}
                            onChange={handleChange}
                            sx={{ height: '40px', maxHeight: '40px' }}
                          >
                            {state?.industries?.length && state?.industries.map((option: any) => (
                              <MenuItem key={option[0]} value={option[1]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.industry?.[0] ? errors?.industry[0] : ''}</FormHelperText>
                        </FormControl> */}
                      </div>
                    
                   
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Status</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="status"
                            value={formData.status}
                            open={statusSelectOpen}
                            onClick={() =>
                              setStatusSelectOpen(!statusSelectOpen)
                            }
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
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.status?.[0]}
                          >
                            {LEAD_STATUS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors?.status?.[0] ? errors?.status[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
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
                            {state?.source?.length &&
                              state?.source.map((option: any) => (
                                <MenuItem key={option[0]} value={option[0]}>
                                  {option[1]}
                                </MenuItem>
                              ))}
                          </Select>
                          <FormHelperText>
                            {errors?.source?.[0] ? errors?.source[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                    <div className="fieldSubContainer">
                        <div className="fieldTitle">Lead Attachment</div>
                        <TextField
                          name="lead_attachment"
                          value={formData.lead_attachment?.[0]?.file_name}
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
                                      name="lead_attachment"
                                      onChange={(e: any) => {
                                        //  handleChange(e);
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
                        <Tooltip title="Number must starts with +91">
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
                      {/* <div style={{ width: '40%', display: 'flex', flexDirection: 'row', marginTop: '19px', marginLeft: '6.6%' }}>
                      <div style={{ marginRight: '10px', fontSize: '13px', width: '22%', textAlign: 'right', fontWeight: 'bold' }}>Email Address</div> */}
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
                        <div
                          className="fieldTitle"
                          // style={{ marginRight: '10px', fontSize: '13px', width: '22%', textAlign: 'right', fontWeight: 'bold' }}
                        >
                          Address Line
                        </div>
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
                            {state?.countries?.length &&
                              state?.countries.map((option: any) => (
                                <MenuItem key={option[0]} value={option[0]}>
                                  {option[1]}
                                </MenuItem>
                              ))}
                          </Select>
                          <FormHelperText>
                            {errors?.country?.[0] ? errors?.country[0] : ''}
                          </FormHelperText>
                        </FormControl>
                        {/* <FormControl error={!!errors?.country?.[0]} sx={{ width: '70%' }}>
                          <Autocomplete
                            // ref={autocompleteRef}
                            // freeSolo
                            value={selectedCountry}
                            options={state.countries || []}
                            getOptionLabel={(option: any) => option[1]}
                            onChange={(e: any, value: any) => handleChange2('country', value)}
                            size='small'
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip
                                  deleteIcon={<FaTimes style={{ width: '9px' }} />}
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    height: '18px'

                                  }}
                                  variant='outlined'
                                  label={option[1]}
                                  {...getTagProps({ index })}
                                />
                              ))
                            }
                            popupIcon={<IconButton
                              disableFocusRipple
                              disableRipple
                              sx={{
                                width: '45px', height: '40px',
                                borderRadius: '0px',
                                backgroundColor: '#d3d3d34a'
                              }}><FaArrowDown style={{ width: '15px' }} /></IconButton>}
                            renderInput={(params) => (
                              <TextField {...params}
                                // placeholder='Add co'
                                InputProps={{
                                  ...params.InputProps,
                                   sx: {
                                                                        '& .MuiAutocomplete-popupIndicator': { '&:hover': { backgroundColor: 'white' } },
                                                                        '& .MuiAutocomplete-endAdornment': {
                                                                            mt: '-8px',
                                                                            mr: '-8px',
                                                                        }
                                                                    }
                                }}
                              />
                            )}
                          />
                          <FormHelperText>{errors?.country?.[0] || ''}</FormHelperText>
                        </FormControl> */}
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
                        Cancel
                      </Button>
                      <Button
                        className="header-button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            description: quillRef.current.firstChild.innerHTML,
                          })
                        }
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
