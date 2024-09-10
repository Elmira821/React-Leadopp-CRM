import React, { useState, useEffect } from "react";

import { SERVER, UsersUrl, TeamsUrl } from "../../services/ApiUrls";
import AddModal from "../../components/AddModal";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton } from "material-ui";
import { FaFileExcel } from "react-icons/fa";

interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_pic: string | null;
}

interface UserProfile {
  id: string;
  user_details: UserDetails;
}

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: UserProfile;
  created_on_arrow: string;
}

const AddTeamMember: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const fetchTeamsAndProfiles = async () => {
    const token = localStorage.getItem("Token");
    const org = localStorage.getItem("org");

    if (!token || !org) {
      setError("Token or organization information is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${SERVER}${UsersUrl}/get-teams-and-users/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token,
          org: org,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching teams and users: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Log the response to inspect its structure

      if (Array.isArray(data.teams) && Array.isArray(data.profiles)) {
        setTeams(data.teams);
        if (data.teams.length > 0) {
          setSelectedTeamId(data.teams[0].id);
        } else {
          setError("No teams available.");
        }
        setProfiles(data.profiles);
      } else {
        throw new Error("Unexpected response structure.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndProfiles();
  }, []);

  const handleAddUser = async () => {
    const token = localStorage.getItem("Token");
    const org = localStorage.getItem("org");

    if (!token || !org) {
      setError("Token or organization information is missing.");
      return;
    }

    if (!selectedTeamId || !selectedUserId) {
      setMessage("Please select a user.");
      return;
    }

    try {
      const response = await fetch(`${SERVER}${TeamsUrl}${selectedTeamId}/user/${selectedUserId}/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token,
          org: org,
        },
      });

      const data = await response.json();
      console.log("Add User Response:", data); // Log the response for debugging

      if (response.ok) {       
        setMessage(data.message);
        handleCloseModal();
        window.location.reload();
      } else {
        setMessage(data.message || "An error occurred while adding the user.");
      }
    } catch (error) {
      setMessage("An error occurred while making the request.");
      console.error("Error:", error);
    }
  };

  return (
    <div
    style={{display: 'flex', flexDirection: 'column'}}>
      
        <AddCircleIcon onClick={handleOpenModal}/>
      
       
      <AddModal
        isOpen={isModalOpen}
        title="Add User"
        onClose={handleCloseModal}
        onSubmit={handleAddUser}
        isLoading={loading}
        submitLabel="Add User"
      >
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label 
          style={{marginRight:'10px', marginLeft: '6px', }}
          htmlFor="user-select">Select User:</label>

          <select
          style={{borderRadius:'7px'}}
            id="user-select"
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a user</option>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.user_details.email}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No users available
              </option>
            )}
          </select>
        </div>
        <div 
        style={{marginRight:'10px', marginLeft: '6px', marginTop:'6px', }}>
          <label htmlFor="team-select">Select Team:</label>
          <select
           style={{marginLeft:'8px', borderRadius:'7px',width:'141px'}}
            id="team-select"
            value={selectedTeamId || ""}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={loading}
          >
            {teams.length > 0 ? (
              teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No teams available
              </option>
            )}
          </select>
        </div>
        {message && <p>{message}</p>}
      </AddModal>
    </div>
  );
};

export default AddTeamMember;
