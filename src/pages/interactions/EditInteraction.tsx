import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import {
    TextField,
    FormControl,
    Select,
    AccordionDetails,
    Accordion,
    AccordionSummary,
    Typography,
    Box,
    MenuItem,
    Tooltip,
    Divider,
    FormHelperText,
    Button
} from '@mui/material'
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { InteractionsUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import { fetchData, Header } from '../../components/FetchData';
import { AntSwitch, CustomSelectField, RequiredTextField } from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../styles/style.css'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';

type FormErrors = {
    user?: string[];
    start_at?: string[];
    end_at?: string[];
    type?: string[];
    interact_with?: string[];
    contact?: string[];
    description?: string[];
};

interface User {
    id: string;
    first_name: string;
    last_name: string;
}

export default function EditInteraction() {
    const navigate = useNavigate()
    const location = useLocation();
    const { state } = location;
    const { quill, quillRef } = useQuill();
    // const initialContentRef = useRef(null);
    const initialContentRef = useRef<string | null>(null);
    const pageContainerRef = useRef<HTMLDivElement | null>(null);

    const [hasInitialFocus, setHasInitialFocus] = useState(false);

    const [reset, setReset] = useState(false)
    const [formData, setFormData] = useState({
        start_at: null,
        end_at: null,
        type: 'Call',
        interact_with: '',
        contact: '',
        description: '',
    })
    const [errors, setErrors] = useState<FormErrors>({});
    const [countrySelectOpen, setCountrySelectOpen] = useState(false)
    const [categorySelectOpen, setCategorySelectOpen] = useState(false)
    const [leadSelectOpen, setLeadSelectOpen] = useState(false)
    const [contactSelectOpen, setContactSelectOpen] = useState(false)

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
        setFormData(state?.value)
    }, [state?.id])

    useEffect(() => {
        if (reset) {
            setFormData(state?.value)
            if (quill && initialContentRef.current !== null) {
                quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
            }
        }
        return () => {
            setReset(false)
        }
    }, [reset, quill, state?.value])

    useEffect(() => {
        if (quill && initialContentRef.current === null) {
            // Save the initial state (HTML content) of the Quill editor only if not already saved
            initialContentRef.current = formData.description;
            quill.clipboard.dangerouslyPasteHTML(formData.description);
        }
    }, [quill, formData.description]);

    const handleChange = (e: any) => {
        const { name, value, files, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDateTimeChange = (name: string, date: any) => {
        setFormData({ ...formData, [name]: date ? moment(date).toISOString() : '' });
    };

    const emptyDescription = () => {
        setFormData({ ...formData, description: '' })
        if (quill) {
            quill.clipboard.dangerouslyPasteHTML('');
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
            org: localStorage.getItem('org')
        }
        const data = {
            user: state.value.user_id,
            start_at: formData.start_at,
            end_at: formData.end_at,
            type: formData.type,
            interact_with: formData.interact_with,
            contact: formData.contact,
            description: formData.description,
        }
        fetchData(`${InteractionsUrl}/${state?.id}/`, 'PUT', JSON.stringify(data), Header)
            .then((res: any) => {
                if (!res.error) {
                    backbtnHandle()
                    navigate('/app/interactions')
                }
                if (res.error) {
                    setErrors(res?.errors?.interaction_errors)
                }
            })
            .catch(() => {
            })
    };

    const backbtnHandle = () => {
        navigate('/app/interactions/interaction-details', { state: { 
            interactionId: state?.id, 
            detail: true,
            contacts: state?.contacts || [],
            leads: state?.leads || [],
            users: state?.users || [] 
        } })
    }
    const module = 'Interactions'
    const crntPage = 'Edit Interaction'
    const backBtn = 'Back to Interaction Detail'

    const CategoryList = ['Call', 'Email', 'Meeting', 'Task'];

    const onCancel = () => {
        setReset(true)
    }

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomAppBar backbtnHandle={backbtnHandle} module={module} crntPage={crntPage} backBtn={backBtn} onCancel={onCancel} onSubmit={handleSubmit} />
            <Box sx={{ mt: "120px" }}>
                <form onSubmit={handleSubmit}>
                    {/* lead details */}
                    <div style={{ padding: '10px' }}>
                        <div className='leadContainer'>
                            <Accordion style={{ width: '98%' }}
                                defaultExpanded
                            >
                                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Interaction Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                                        component='form'
                                        autoComplete='off'
                                    >
                                        <div className='fieldContainer'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Owner</div>
                                                <TextField
                                                    name='owner'
                                                    className="custom-textfield"
                                                    value={`${state.value.user_first_name} ${state.value.user_last_name}`}
                                                    style={{ width: '70%' }}
                                                    size='small'
                                                    error={!!errors?.user?.[0]}
                                                    helperText={errors?.user?.[0] ? errors?.user[0] : ''}
                                                />
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Started at</div>
                                                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="en-gb">
                                                    <DateTimePicker
                                                        name="start_at"
                                                        label="Start Date and Time"
                                                        value={formData.start_at ? moment(formData.start_at) : null}
                                                        onChange={(date) => handleDateTimeChange('start_at', date)}
                                                        sx={{ width: '70%' }}
                                                        format="DD-MM-YYYY HH:mm"
                                                        ampm={false}
                                                    />
                                                </LocalizationProvider>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className="fieldTitle">Type</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name="type"
                                                        value={formData.type}
                                                        open={categorySelectOpen}
                                                        onClick={() => setCategorySelectOpen(!categorySelectOpen)}
                                                        IconComponent={() => (
                                                            <div
                                                                onClick={() =>
                                                                    setCategorySelectOpen(!categorySelectOpen)
                                                                }
                                                                className="select-icon-background"
                                                            >
                                                                {categorySelectOpen ? (
                                                                    <FiChevronUp className="select-icon" />
                                                                ) : (
                                                                    <FiChevronDown className="select-icon" />
                                                                )}
                                                            </div>
                                                        )}
                                                        className={'select'}
                                                        onChange={handleChange}
                                                        error={!!errors?.type?.[0]}
                                                    >
                                                        {CategoryList.map((option) => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Ended at</div>
                                                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="en-gb">
                                                    <DateTimePicker
                                                        name='end_at'
                                                        label="End Date and Time"
                                                        value={formData.end_at ? moment(formData.end_at) : null}
                                                        onChange={(date) => handleDateTimeChange('end_at', date)}
                                                        minDateTime={formData?.start_at ? moment(formData?.start_at) : undefined}
                                                        sx={{ width: '70%' }}
                                                        format="DD-MM-YYYY HH:mm"
                                                        ampm={false}
                                                    />
                                                </LocalizationProvider>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Lead</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name="interact_with"
                                                        value={formData.interact_with}
                                                        open={leadSelectOpen}
                                                        onClick={() => setLeadSelectOpen(!leadSelectOpen)}
                                                        IconComponent={() => (
                                                            <div
                                                                onClick={() =>
                                                                    setLeadSelectOpen(!leadSelectOpen)
                                                                }
                                                                className="select-icon-background"
                                                            >
                                                                {leadSelectOpen ? (
                                                                    <FiChevronUp className="select-icon" />
                                                                ) : (
                                                                    <FiChevronDown className="select-icon" />
                                                                )}
                                                            </div>
                                                        )}
                                                        className={'select'}
                                                        onChange={handleChange}
                                                    >
                                                        {state?.leads.map((option: any) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.account_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Contact person</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name="contact"
                                                        value={formData.contact}
                                                        open={contactSelectOpen}
                                                        onClick={() => setContactSelectOpen(!contactSelectOpen)}
                                                        IconComponent={() => (
                                                            <div
                                                                onClick={() =>
                                                                    setContactSelectOpen(!contactSelectOpen)
                                                                }
                                                                className="select-icon-background"
                                                            >
                                                                {contactSelectOpen ? (
                                                                    <FiChevronUp className="select-icon" />
                                                                ) : (
                                                                    <FiChevronDown className="select-icon" />
                                                                )}
                                                            </div>
                                                        )}
                                                        className={'select'}
                                                        onChange={handleChange}
                                                    >
                                                        {state?.contacts.map((option: any) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.first_name}&nbsp;{option.last_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                        {/* Description details  */}
                        <div className='leadContainer'>
                            <Accordion
                                defaultExpanded
                                style={{ width: '98%' }}>
                                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Description</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '100%', color: '#1A3353', mb: 1 }}
                                        component='form'
                                        noValidate
                                        autoComplete='off'
                                    >
                                        <div className='DescriptionDetail'>
                                            <div className='descriptionTitle'>Description</div>
                                            <div style={{ width: '100%', marginBottom: '3%' }}>
                                                <div ref={quillRef} />
                                            </div>
                                        </div>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                            <Button
                                                className='header-button'
                                                onClick={emptyDescription}
                                                size='small'
                                                variant='contained'
                                                startIcon={<FaTimesCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                                                sx={{ backgroundColor: '#2b5075', ':hover': { backgroundColor: '#1e3750' } }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className='header-button'
                                                onClick={() => setFormData({ ...formData, description: quillRef.current.firstChild.innerHTML })}
                                                variant='contained'
                                                size='small'
                                                startIcon={<FaCheckCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
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
    )
}