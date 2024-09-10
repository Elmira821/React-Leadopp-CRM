import { CustomToolbar, RequiredTextField } from '../../styles/CssStyled';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, FormControl, FormGroup, InputLabel, Input, Typography, Select, MenuItem, Card, Stack, Accordion, AccordionSummary, Divider, AccordionDetails, TextField, Tooltip } from '@mui/material';
import { FiChevronUp, FiChevronDown, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { SERVER, ProfileUrl } from '../../services/ApiUrls';
import { COUNTRIES } from '../../components/Data';

interface EditUserProfileProps {
    onUpdate: () => void;
}

type FormErrors = {
    email?: string[];
    first_name?: string[];
    last_name?: string[];
    job_title?: string[];
    address_line?: string[];
    street?: string[];
    city?: string[];
    state?: string[];
    postcode?: string[];
    country?: string[];
    mobile_number?: string[];
    profile_pic?: string[];
};

const EditUserProfile: React.FC<EditUserProfileProps> = ({ onUpdate }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        job_title: '',
        address_line: '',
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        mobile_number: '',
        profile_pic: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [countrySelectOpen, setCountrySelectOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: e.target.files?.[0] || null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, profile_pic: reader.result as string });
            };
            reader.readAsDataURL(file);
            setSelectedFile(file); // Update selected file state
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('Token');
            const org = localStorage.getItem('org');

            if (!token || !org) {
                setError('Missing token or organization ID in localStorage');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${SERVER}${ProfileUrl}/`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'org': org,
                        'Authorization': token,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching profile: ${response.statusText}`);
                }

                const data = await response.json();

                // Safely access address properties with optional chaining and provide default values
                const address = data.user_obj.address || {};

                setFormData({
                    email: data.user_obj.user_details.email || '',
                    first_name: data.user_obj.user_details.first_name || '',
                    last_name: data.user_obj.user_details.last_name || '',
                    job_title: data.user_obj.user_details.job_title || '',
                    address_line: address.address_line || '',
                    street: address.street || '',
                    city: address.city || '',
                    state: address.state || '',
                    postcode: address.postcode || '',
                    country: address.country || '',
                    mobile_number: data.user_obj.phone || '',
                    profile_pic: data.user_obj.user_details.profile_pic || '',
                });
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id]);

    const submitForm = async () => {
        const token = localStorage.getItem('Token');
        const org = localStorage.getItem('org');
    
        if (!token || !org) {
            setError('Missing token or organization ID in localStorage');
            return;
        }
    
        try {
            const response = await fetch(`${SERVER}${ProfileUrl}/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({
                    user_details: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        profile_pic: formData.profile_pic,
                    },
                    /* role: 'ADMIN', */ /*IT CHANGES THE USER ROLE TO ADMIN WHEN UPDATING*/
                    address: {
                        address_line: formData.address_line,
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        postcode: formData.postcode,
                        country: formData.country,
                    },
                    phone: formData.mobile_number,
                    alternate_phone: formData.mobile_number, // Include this if needed
                }),
            });
    
            if (!response.ok) {
                const data = await response.json();
                if (data.errors) {
                    // Map phone error to mobile_number
                    const newErrors: FormErrors = {
                        ... data.errors,
                        mobile_number : data.errors.phone
                    }; 
                    setErrors(newErrors);
                } else {
                    setError('Failed to update profile. Please check your inputs.');
                }
                return;
            }
    
            onUpdate();
            navigate('/app/profile/');
        } catch (error: any) {
            setError('Error updating profile.');
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomToolbar sx={{ flexDirection: 'row-reverse' }}>
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Button
                        sx={{ background: 'white', marginLeft: '15px', color: 'black' }}
                        variant="contained"
                        className="add-button"
                        component={Link}
                        to="/app/profile/"
                    >
                        <FiChevronLeft style={{ fontSize: '20px', marginRight: '2px' }} />Back
                    </Button>
                    <Button
                        type="submit"
                        form="edit-profile-form"
                        variant="contained"
                        className="add-button"
                        sx={{ marginLeft: '15px' }}
                    >
                        <FiCheckCircle style={{ fontSize: '25px', marginRight: '8px' }} /> Save Changes
                    </Button>
                </Stack>
            </CustomToolbar>

            <Box sx={{ mt: '30px' }}>
                <form id="edit-profile-form" onSubmit={handleFormSubmit}>
                    <div style={{ padding: '10px' }}>
                        <div className="leadContainer">
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                                <AccordionSummary
                                    expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                                >
                                    <Typography className="accordion-header">
                                        User Information
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
                                                <div className="fieldTitle">First Name</div>
                                                <TextField
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.first_name}
                                                    helperText={errors.first_name ? errors.first_name.join(', ') : ''}
                                                />
                                            </div>
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Last Name</div>
                                                <TextField
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.last_name}
                                                    helperText={errors.last_name ? errors.last_name.join(', ') : ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="fieldContainer">
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Mobile Number</div>
                                                <Tooltip title="Number must start with +31">
                                                <RequiredTextField
                                                    name="mobile_number"
                                                    value={formData.mobile_number}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.mobile_number}
                                                    helperText={errors.mobile_number ? errors.mobile_number.join(', ') : ''}
                                                />
                                                </Tooltip>
                                            </div>
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Email</div>
                                                <TextField
                                                    disabled
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.email}
                                                    helperText={errors.email ? errors.email.join(', ') : ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="fieldContainer">
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Image</div>
                                                {/* <InputLabel htmlFor="upload-photo">Upload Photo</InputLabel> */}
                                                <Input id="upload-photo" name="profile_pic" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                                                <Button variant="outlined" component="label" htmlFor="upload-photo">
                                                    {selectedFile ? 'File Selected' : 'Choose File'}
                                                </Button>
                                            </div>
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Job Title</div>
                                                <TextField
                                                    disabled
                                                    name="job_title"
                                                    value={formData.job_title || '---'}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.job_title}
                                                    helperText={errors.job_title ? errors.job_title.join(', ') : ''}
                                                />
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                        {/* Address Details */}
                        <div className="leadContainer">
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
                                                    error={!!errors.address_line}
                                                    helperText={errors.address_line ? errors.address_line.join(', ') : ''}
                                                />
                                            </div>
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Street</div>
                                                <TextField
                                                    name="street"
                                                    value={formData.street}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.street}
                                                    helperText={errors.street ? errors.street.join(', ') : ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="fieldContainer">
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">City</div>
                                                <TextField
                                                    required
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.city}
                                                    helperText={errors.city ? errors.city.join(', ') : ''}
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
                                                    error={!!errors.state}
                                                    helperText={errors.state ? errors.state.join(', ') : ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="fieldContainer">
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Postcode</div>
                                                <TextField
                                                    required
                                                    name="postcode"
                                                    value={formData.postcode}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size="small"
                                                    error={!!errors.postcode}
                                                    helperText={errors.postcode ? errors.postcode.join(', ') : ''}
                                                />
                                            </div>
                                            <div className="fieldSubContainer">
                                                <div className="fieldTitle">Country</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name="country"
                                                        value={formData.country || '---'}
                                                        open={countrySelectOpen}
                                                        onClick={() => setCountrySelectOpen(!countrySelectOpen)}
                                                        IconComponent={() => (
                                                            <div
                                                                onClick={() => setCountrySelectOpen(!countrySelectOpen)}
                                                                className="select-icon-background"
                                                            >
                                                                {countrySelectOpen ? <FiChevronUp className="select-icon" /> : <FiChevronDown className="select-icon" />}
                                                            </div>
                                                        )}
                                                        onChange={handleChange}
                                                        sx={{ height: '40px', }}
                                                    >
                                                        {COUNTRIES.map((option) => (
                                                            <MenuItem key={option.code} value={option.code}>
                                                                {option.name}
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
                    </div>
                </form>
            </Box>
        </Box>
    );
};

export default EditUserProfile;
