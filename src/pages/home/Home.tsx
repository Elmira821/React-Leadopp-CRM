import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from '../../components/Sidebar'
import Organization from '../organization/Organization'

export const Home = (props: any) => {
  const navigate = useNavigate()
  const [org, setOrg] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('Token')) {
      navigate('/login')
    } else if (!localStorage.getItem('org')) {
      setOrg(false)
    } else if (localStorage.getItem('Token') && localStorage.getItem('org')) {
      setOrg(true);
    }
  }, [navigate])
  return (
    <Box sx={{}}>
      {org ? <Sidebar /> : <Organization />}
    </Box>

  )
}