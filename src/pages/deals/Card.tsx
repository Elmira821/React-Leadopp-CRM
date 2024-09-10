//This is where the design of Card is handled inside of Deals component.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface CardProps {
    title: string;
    content: React.ReactNode;
    leadId: string; // Asegúrate de que el id del lead se pase como prop
}

const PipelineCard: React.FC<CardProps> = ({ title, content, leadId }) => {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [status, setStatus] = useState([]);
    const [source, setSource] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [countries, setCountries] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [selectedAssignTo, setSelectedAssignTo] = useState<any>(); // Define the type if known
    const [selectedContacts, setSelectedContacts] = useState<any>(); // Define the type if known

    const handleClick = () => {
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
    };

    const cardStyle: React.CSSProperties = {
        border: '1px solid lightgray', // Fixed border style
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        borderRadius: '4px',
        padding: '10px',
        margin: '10px 20px 10px 10px',
        background: 'white',
        overflow: 'hidden',
        color: 'black',
        marginRight: '10px',
        marginLeft: '30px',
        width: '75%',
    };

    const titleStyle: React.CSSProperties = {
        color: 'rgb(26, 51, 83)',
        fontSize: '1.2rem',
        fontWeight: '500',
        cursor: 'pointer',
        marginLeft: '10px',
    };

    const contentStyle: React.CSSProperties = {
        lineHeight: '1.5',
        color: 'gray',
        fontSize: '16px',
        textTransform: 'capitalize',
        marginLeft: '10px',
    };

    return (
        <div style={cardStyle}>
            <h3 style={titleStyle} onClick={handleClick}>
                {title}
            </h3>
            <div style={contentStyle}>{content}</div>
        </div>
    );
};

export default PipelineCard;