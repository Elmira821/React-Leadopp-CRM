import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  TextareaAutosize,
  MenuItem,
  Tooltip,
  Button,
  Input,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Select,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { ProfileUrl, UserUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { CustomAppBar } from '../../components/CustomAppBar';
import { FaArrowDown, FaTimes, FaUpload } from 'react-icons/fa';
import { AntSwitch, RequiredTextField } from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import '../../styles/style.css';

type FormErrors = {
  email?: string[];
  role?: string[];
  phone?: string[];
  alternate_phone?: string[];
  address_line?: string[];
  street?: string[];
  city?: string[];
  state?: string[];
  postcode?: string[];
  country?: string[];
  expertise?: string[];
  // profile_pic?: string[];
  // has_sales_access?: string[];
  // has_marketing_access?: string[];
  // is_organization_admin?: string[];
};
interface FormData {
  email: string;
  role: string;
  phone: string;
  alternate_phone: string;
  address_line: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  expertise: string;
  // profile_pic: string | null,
  // has_sales_access: boolean,
  // has_marketing_access: boolean,
  // is_organization_admin: boolean
}

export function EditUser() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [reset, setReset] = useState(false);
  const [error, setError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [userErrors, setUserErrors] = useState<FormErrors>({});
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    role: 'ADMIN',
    phone: '',
    alternate_phone: '',
    address_line: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    expertise: '',
    // profile_pic: null,
    // has_sales_access: false,
    // has_marketing_access: false,
    // is_organization_admin: false
  });
  const [countries, setCountries] = useState([]);
  const [, setCountry] = useState('');
  const [expertiseSelectOpen, setExpertiseSelectOpen] = useState(false);

  useEffect(() => {
    if (state?.id) {
      fetchUserData(state.id);
    }
  }, [state?.id]);

  useEffect(() => {
    setFormData(state?.value);
  }, [state.id, state?.value]);

  const fetchUserData = (id: any) => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    fetchData(`user/${id}/`, 'GET', null as any, Header)
      .then((res) => {
        if (!res.error) {
          const profileObj = res.data.profile_obj;
          const formData = {
            email: profileObj.user_details.email,
            role: profileObj.role,
            phone: profileObj.phone,
            alternate_phone: profileObj.alternate_phone,
            address_line: profileObj.address.address_line,
            street: profileObj.address.street,
            city: profileObj.address.city,
            state: profileObj.address.state,
            postcode: profileObj.address.postcode,
            country: profileObj.address.country,
            expertise: profileObj.expertise,
          };

          setFormData(formData);
          setCountries(res.data.countries);

          console.log('fetchUserData success:', formData);
        } else {
          setError(true);
          setProfileErrors(res.errors.profile_errors);
          setUserErrors(res.errors.user_errors);
        }
      })
      .catch((error) => {
        console.error('There was a problem with your fetch operation:', error);
      });
  };

  useEffect(() => {
    if (reset) {
      setFormData(state?.value);
    }
    return () => {
      setReset(false);
    };
  }, [reset]);

  const handleChange = (e: any) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    }
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    console.log(`handleChange: ${name} => ${value}`);
  };

  const backbtnHandle = () => {
    if (state?.edit) {
      navigate('/app/admin');
    } else {
      navigate('/app/admin/user-details', {
        state: { userId: state?.id, detail: true },
      });
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
    console.log('Submitting form:', formData);
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0] || null;
  //     if (file) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //             setFormData({ ...formData, profile_pic: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);
  //     }
  // };

  // const getEditDetail = (id: any) => {
  //     fetchData(`${UserUrl}/${id}/`, 'GET', null as any, headers)
  //         .then((res: any) => {
  //             console.log('edit detail Form data:', res);
  //             if (!res.error) {
  //                 const data = res?.data?.profile_obj
  //                 setFormData({
  //                     email: data?.user_details?.email || '',
  //                     role: data.role || 'ADMIN',
  //                     phone: data.phone || '',
  //                     alternate_phone: data.alternate_phone || '',
  //                     address_line: data?.address?.address_line || '',
  //                     street: data?.address?.street || '',
  //                     city: data?.address?.city || '',
  //                     state: data?.address?.state || '',
  //                     postcode: data?.address?.postcode || '',
  //                     country: data?.address?.country || '',
  //                     profile_pic: data?.user_details?.profile_pic || null,
  //                     has_sales_access: data.has_sales_access || false,
  //                     has_marketing_access: data.has_marketing_access || false,
  //                     is_organization_admin: data.is_organization_admin || false
  //                 })
  //             }
  //             if (res.error) {
  //                 setError(true)
  //             }
  //         })
  //         .catch(() => {
  //         })
  // }
  const submitForm = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    //debugger;
    console.log('Form data:', formData);
    const data = {
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      alternate_phone: formData.alternate_phone,
      address_line: formData.address_line,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      country: formData.country,
      expertise: formData.expertise,
      // profile_pic: formData.profile_pic,
      // has_sales_access: formData.has_sales_access,
      // has_marketing_access: formData.has_marketing_access,
      // is_organization_admin: formData.is_organization_admin
    };

    fetchData(
      `${ProfileUrl}/${state?.id}/`,
      'PUT',
      JSON.stringify(data),
      Header
    )
      .then((res: any) => {
        console.log('editsubmit:', res);
        if (!res.error) {
          resetForm();
          navigate('/app/admin/user-details', {
            state: { userId: state?.id, detail: true },
          });
        }
        if (res.error) {
          setError(true);
          setProfileErrors(
            res?.errors?.profile_errors || res?.profile_errors[0]
          );
          setUserErrors(res?.errors?.user_errors || res?.user_errors[0]);
        }
      })
      .catch(() => {});
  };
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'ADMIN',
      phone: '',
      alternate_phone: '',
      address_line: '',
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      expertise: '',
      // profile_pic: null,
      // has_sales_access: false,
      // has_marketing_access: false,
      // is_organization_admin: false
    });
    setProfileErrors({});
    setUserErrors({});
  };
  const onCancel = () => {
    //setReset(true);
    resetForm();
  };
  const module = 'Admin';
  const crntPage = 'Edit User';
  const backBtn = state?.edit ? 'Back To Admin' : 'Back To UserDetails';

  const inputStyles = {
    display: 'none',
  };

  // console.log(state, 'edit',profileErrors)
  // console.log(formData, 'as', state?.value);
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
                        <div className="fieldTitle">Email</div>
                        <RequiredTextField
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.email?.[0] ||
                            !!userErrors?.email?.[0]
                          }
                          helperText={
                            profileErrors?.email?.[0] ||
                            userErrors?.email?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Role</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="role"
                            value={formData.role}
                            open={roleSelectOpen}
                            onClick={() => setRoleSelectOpen(!roleSelectOpen)}
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setRoleSelectOpen(!roleSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {roleSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.role?.[0]}
                          >
                            {['ADMIN', 'USER'].map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          {/* <FormHelperText>{errors?.[0] ? errors[0] : ''}</FormHelperText> */}
                        </FormControl>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Expertise Level</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="expertise"
                            value={formData.expertise}
                            open={expertiseSelectOpen}
                            onClick={() =>
                              setExpertiseSelectOpen(!expertiseSelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setExpertiseSelectOpen(!expertiseSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {expertiseSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.expertise?.[0]} // Handle errors if needed
                          >
                            {['junior', 'medior', 'senior', 'N/A'].map(
                              (option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Phone Number</div>
                        <Tooltip title="Please enter the country code (e.g., +31).">
                          <RequiredTextField
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{ width: '70%' }}
                            size="small"
                            error={
                              !!profileErrors?.phone?.[0] ||
                              !!userErrors?.phone?.[0]
                            }
                            helperText={
                              profileErrors?.phone?.[0] ||
                              userErrors?.phone?.[0] ||
                              ''
                            }
                          />
                        </Tooltip>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Alternate Phone</div>
                        <Tooltip title="Please enter the country code (e.g., +31).">
                          <TextField
                            required
                            name="alternate_phone"
                            value={formData.alternate_phone}
                            onChange={handleChange}
                            style={{ width: '70%' }}
                            size="small"
                            error={
                              !!profileErrors?.alternate_phone?.[0] ||
                              !!userErrors?.alternate_phone?.[0]
                            }
                            helperText={
                              profileErrors?.alternate_phone?.[0] ||
                              userErrors?.alternate_phone?.[0] ||
                              ''
                            }
                          />
                        </Tooltip>
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
                          required
                          name="address_line"
                          value={formData.address_line}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.address_line?.[0] ||
                            !!userErrors?.address_line?.[0]
                          }
                          helperText={
                            profileErrors?.address_line?.[0] ||
                            userErrors?.address_line?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Street</div>
                        <TextField
                          required
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.street?.[0] ||
                            !!userErrors?.street?.[0]
                          }
                          helperText={
                            profileErrors?.street?.[0] ||
                            userErrors?.street?.[0] ||
                            ''
                          }
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">City</div>
                        <TextField
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.city?.[0] ||
                            !!userErrors?.city?.[0]
                          }
                          helperText={
                            profileErrors?.city?.[0] ||
                            userErrors?.city?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">State</div>
                        <TextField
                          required
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.state?.[0] ||
                            !!userErrors?.state?.[0]
                          }
                          helperText={
                            profileErrors?.state?.[0] ||
                            userErrors?.state?.[0] ||
                            ''
                          }
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">postcode</div>
                        <TextField
                          required
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.postcode?.[0] ||
                            !!userErrors?.postcode?.[0]
                          }
                          helperText={
                            profileErrors?.postcode?.[0] ||
                            userErrors?.postcode?.[0] ||
                            ''
                          }
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
                            className={'select'}
                            onChange={handleChange}
                            error={!!profileErrors?.country?.[0]}
                          >
                            {countries.map((option: any) => (
                              <MenuItem
                                key={option[0]}
                                value={option[0]}
                                onClick={() => setCountry(option[0])}
                              >
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {profileErrors?.country?.[0]
                              ? profileErrors?.country?.[0]
                              : ''}
                          </FormHelperText>
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
}
