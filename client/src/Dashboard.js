import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { getApiBaseUrl } from './apiConfig';

const apiBaseUrl = getApiBaseUrl();

const Dashboard = () => {
  // State for your table data
  const [tableData, setTableData] = useState([]);
  // State for the search query
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  //builds the actual model
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/patients`);
        const data = await response.json();
        setTableData(data.map(patient => ({
          id: patient._id, 
          fullName: `${patient.formData.firstName || ''} ${patient.formData.middleInitial || ''} ${patient.formData.lastName || ''}`.trim(),
          dob: patient.formData.dateOfBirth, // Adjust according to formData structure
          updatedAtDate: new Date(patient.updatedAt).toLocaleDateString(),
          updatedAtTime: new Date(patient.updatedAt).toLocaleTimeString()
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  
    fetchData();

    //const socket = io('http://localhost:3001'); // Your server URL
    const socket = io(apiBaseUrl)

    //websocket model to update on submit
    socket.on('newPatient', newPatient => {
      setTableData(prevData => [
        {
          id: newPatient._id,
          fullName: `${newPatient.formData.firstName || ''} ${newPatient.formData.middleInitial || ''} ${newPatient.formData.lastName || ''}`.trim(),
          dob: newPatient.formData.dateOfBirth, // Adjust according to formData structure
          updatedAtDate: new Date(newPatient.updatedAt).toLocaleDateString(),
          updatedAtTime: new Date(newPatient.updatedAt).toLocaleTimeString()
        },
        ...prevData
      ]);
    });
    

    return () => socket.disconnect();

  }, []);
  

  // Filtered data based on the search query
  const filteredData = tableData.filter(
    item =>
      (item.fullName && item.fullName.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (item.dob && item.dob.includes(searchQuery))
  );

  

  return (
    <div className="container mt-3">
      <h2>Patient List</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by Name or Date of Birth"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <table className="table">
        <thead>
          <tr>
            {/* <th>#</th> */}
            <th>Full Name</th>
            <th>Date of Birth</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={item.id} onClick={() => navigate(`/patient/${item.id}`)} className='table-row-hover' style={{ cursor: 'pointer' }}>
              <td className="wrap-text">{item.fullName}</td>
              <td>{new Date(item.dob).toLocaleDateString('en-US', {timeZone: 'UTC'})}</td>
              <td className="datetime">
                <span className="date">{item.updatedAtDate}</span>
                <span className="time">{item.updatedAtTime}</span>
              </td>
            </tr>
          ))}
      </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
