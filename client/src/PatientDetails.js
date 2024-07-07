import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getApiBaseUrl } from './apiConfig';
import './PatientDetails.css';


const apiBaseUrl = getApiBaseUrl();


const PatientDetails = () => {
  const [patient, setPatient] = useState(null);
  const [clientConfig, setClientConfig] = useState(null);
  const { id } = useParams(); // Get the patient id from the URL
  const [lastCopiedField, setLastCopiedField] = useState(null);

  //for modal image previews
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const openModal = (image, fileName) => {
    setSelectedImage({ src: image, name: fileName });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  //Tracks if patient is in edit mode or not
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedPatient, setUpdatedPatient] = useState({ ...patient });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const patientResponse = await fetch(`${apiBaseUrl}/api/patients/${id}`);
        const patientData = await patientResponse.json();
        
        const configResponse = await fetch(`${apiBaseUrl}/api/client-config`);
        const configData = await configResponse.json();

        setPatient(patientData);
        setUpdatedPatient(patientData); // Set updatedPatient here after fetching
        setClientConfig(configData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchPatientDetails();
  }, [id]);
  

  const generatePDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(20);
    doc.text('Patient Details', 20, 20);
  
    // Starting position for the first line of dynamic content
    let yPos = 30;
    const lineSpacing = 10;
  
    clientConfig.formFields.forEach(field => {
      const fieldValue = patient.formData[field.field] || 'N/A';
      doc.setFontSize(14);
      doc.text(`${field.label}: ${fieldValue}`, 20, yPos);
      yPos += lineSpacing; // Move to the next line
    });
  
    doc.save(`${patient.formData.firstName || ''} ${patient.formData.middleInitial || ''} ${patient.formData.lastName || ''} details.pdf`);
  };
  

  //handling the edit mode
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/api/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPatient),
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
        setIsEditMode(false);
        alert('Patient updated successfully');
      } else {
        alert('Error updating patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };
  
  
  //delete patient
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/patients/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Patient deleted successfully');
          navigate('/Dashboard');
        } else {
          alert('Error deleting patient');
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setUpdatedPatient({ ...patient });
    }
  };
  
  const handlePatientChange = (e, field) => {
    setUpdatedPatient(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: e.target.value
      }
    }));
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setUpdatedPatient(prev => {
      const currentValues = prev.formData[fieldName] || [];
      if (checked) {
        return { ...prev, formData: { ...prev.formData, [fieldName]: [...currentValues, value] } };
      } else {
        return { ...prev, formData: { ...prev.formData, [fieldName]: currentValues.filter(item => item !== value) } };
      }
    });
  };
  
  

  const renderEditFormFields = () => {
    if (!clientConfig || !updatedPatient) {
      return <p>Loading form fields...</p>;
    }

    return clientConfig.formFields.map((field) => {
      const fieldValue = updatedPatient.formData[field.field] || '';
  
      switch (field.type) {
        case 'text':
          return (
            <div className="mb-3" key={field.field}>
              <label htmlFor={field.field} className="form-label">{field.label}</label>
              <input
                type="text"
                className="form-control"
                id={field.field}
                name={field.field}
                value={fieldValue}
                onChange={(e) => handlePatientChange(e, field.field)}
                required={field.required}
              />
            </div>
          );
        case 'textarea':
          return (
            <div className="mb-3" key={field.field}>
              <label htmlFor={field.field} className="form-label">{field.label}</label>
              <textarea
                className="form-control"
                id={field.field}
                name={field.field}
                value={fieldValue}
                onChange={(e) => handlePatientChange(e, field.field)}
              />
            </div>
          );
        case 'date':
          return (
            <div className="mb-3" key={field.field}>
              <label htmlFor={field.field} className="form-label">{field.label}</label>
              <input
                type="date"
                className="form-control"
                id={field.field}
                name={field.field}
                value={fieldValue}
                onChange={(e) => handlePatientChange(e, field.field)} 
                required={field.required}
              />
            </div>
          );
        case 'select':
          return (
            <div className="mb-3" key={field.field}>
              <label htmlFor={field.field} className="form-label">{field.label}</label>
              <select
                className="form-select"
                id={field.field}
                name={field.field}
                value={fieldValue}
                onChange={(e) => handlePatientChange(e, field.field)} 
                required={field.required}>
                <option value="">Select...</option>
                {field.options && field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          );
        case 'checkbox-group':
          return (
            <div className="mb-3" key={field.field}>
              <label className="form-label">{field.label}</label>
              {field.options.map(option => (
                <div className="form-check" key={option}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`${field.field}-${option}`}
                    name={field.field}
                    value={option}
                    checked={updatedPatient.formData[field.field]?.includes(option) || false}
                    onChange={e => handleCheckboxChange(e, field.field)}
                  />
                  <label className="form-check-label" htmlFor={`${field.field}-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          );
        case 'slider':
          return (
            <div className="mb-3" key={field.field}>
              <label htmlFor={field.field} className="form-label">
                {field.label} ({fieldValue})
              </label>
              <input
                type="range"
                className="form-range"
                min="1"
                max="10"
                id={field.field}
                name={field.field}
                value={fieldValue}
                onChange={(e) => handlePatientChange(e, field.field)}
              />
            </div>
          );
        // You can add more cases for other types like 'number', 'checkbox', etc.
        default:
          return null;
      }
    });
  };

  //copy to clipboard function
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setLastCopiedField(field); // Update the last copied field
        setTimeout(() => setLastCopiedField(null), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };

  const renderPatientDetails = () => {
    return clientConfig.formFields.map((field) => {
        let fieldValue = patient.formData[field.field] || 'N/A';
        const firstName = patient.formData.firstName || '';
        const lastName = patient.formData.lastName || '';

        // Special handling for file-upload type
        if (field.type === 'file-upload' && fieldValue !== 'N/A') {
            const fileName = `${firstName} ${lastName} ${field.field}`;
            return (
                <li key={field.field} className="list-group-item d-flex align-items-center">
                    <div className="me-2">
                        <strong>{field.label}:</strong>
                        <div>
                          <img
                            src={fieldValue}
                            alt={`${fileName}`}
                            style={{ maxHeight: '100px', maxWidth: '100px', cursor: 'pointer' }}
                            onClick={() => openModal(fieldValue, fileName)}
                          />
                          <a href={fieldValue} download={`${fileName}.png`} className="btn btn-primary btn-sm ms-2">Download</a>
                        </div>
                    </div>
                </li>
            );
        }

        // Handling for other field types
        if (field.type === 'checkbox-group') {
            fieldValue = (patient.formData[field.field] || []).join(', ');
        }

        return (
            <li key={field.field} className="list-group-item d-flex align-items-center">
                <div className="me-2">
                    <strong>{field.label}:</strong> {fieldValue}
                </div>
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => copyToClipboard(fieldValue, field.field)}
                        title="Copy to clipboard"
                        aria-label={`Copy ${field.label}`}
                    >
                        <i className="fas fa-copy"></i>
                    </button>
                    {lastCopiedField === field.field && <span className="text-success">Copied!</span>}
                </div>
            </li>
        );
    });
  };


  return (
    <div className="container mt-4 form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Patient Details</h2>
        <div>
          <button className="btn btn-primary me-2" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button>
          <button className="btn btn-secondary me-2" onClick={generatePDF}>Generate PDF</button>
          <button className={`btn ${isEditMode ? 'btn-danger' : 'btn-warning'} me-2`} onClick={toggleEditMode}>
            {isEditMode ? 'Cancel Edit' : 'Edit Patient'}
          </button>
          {isEditMode && (
            <button className="btn btn-danger" onClick={handleDelete}>Delete Patient</button>
          )}
        </div>
      </div>
  
      {patient && clientConfig ? (
        isEditMode ? (
          <form onSubmit={handleEdit}>
            {renderEditFormFields()}
            <button type="submit" className="btn btn-success">Save Changes</button>
          </form>
        ) : (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">
                {`${patient.formData.firstName || ''} ${patient.formData.middleInitial || ''} ${patient.formData.lastName || ''}`.trim() || 'No Name'}
              </h3>
              <div className="card-text">
                <ul className="list-group list-group-flush">
                  {renderPatientDetails()}
                </ul>
              </div>
            </div>
          </div>
        )
      ) : (
        <p>Loading...</p>
      )}
  
      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedImage.name}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <img src={selectedImage.src} alt={selectedImage.name} style={{ width: '100%' }} />
              </div>
              <div className="modal-footer">
                <a href={selectedImage.src} download={`${selectedImage.name}.png`} className="btn btn-primary">Download</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  
  
  
  
};

export default PatientDetails;
