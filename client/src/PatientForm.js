import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from './apiConfig';
import './PatientForm.css'
import { useNavigate } from 'react-router-dom';


const apiBaseUrl = getApiBaseUrl();
const MAX_CHARACTERS = 50; //max characters for the full name field

//all fields for the form
const PatientForm = () => {

  const navigate = useNavigate();
  const [clientConfig, setClientConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  //grab the clientConfig data
  useEffect(() => {
    //fetch(`${apiBaseUrl}/api/client-config`)
    fetch(`${apiBaseUrl}/api/client-config`)
      .then(response => response.json())
      .then(data => {
        setClientConfig(data);
        // Initialize formData based on clientConfig
        let initialFormData = {};
        data.formFields.forEach(field => {
          // Set initial value for slider fields to 0
          if (field.type === 'slider') {
            initialFormData[field.field] = '0';
          } else {
            initialFormData[field.field] = '';
          }
        });
        setFormData(initialFormData);
      })
      .catch(error => console.error('Error:', error));
  }, []);


  const handleChange = (e) => {
    const { id, value, files, type } = e.target;

    if (type === 'file') {
        const file = files[0];
        if (file) {
            // Handle file input (e.g., image upload)
            const reader = new FileReader();
            reader.onloadend = () => {
                // Update formData with the file data
                setFormData({ ...formData, [id]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    } else if (id === 'firstName' && value.length > MAX_CHARACTERS) {
        // Optionally handle the character limit exceed here for specific fields
        return; // Prevents exceeding the limit
    } else {
        // Handle all other input types
        setFormData({ ...formData, [id]: value });
    }
  };

  //submit 
  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      clientId: clientConfig.clientId // Ensure client ID is included
    };
  
    fetch(`${apiBaseUrl}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })
    .then(response => {
      if(response.ok) {
        navigate('/submission-success');
      } else {
        setSubmitStatus('Failed to submit form. Please try again.');
      }
    })
    .then(data => console.log(data))
    .catch(error => {
      console.error('Error:', error);
      setSubmitStatus('An error occurred. Please try again.');
    });
  };
  

  //renders each individual field based on the clientConfig data
  const renderFormField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <div className="mb-3" key={field.field}>
            <label htmlFor={field.field} className="form-label">{field.label}</label>
            <input
              type="text"
              className="form-control"
              id={field.field}
              required={field.required}
              value={formData[field.field]}
              onChange={handleChange}
              maxLength={field.maxLength || undefined}
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
              required={field.required}
              value={formData[field.field]}
              onChange={handleChange}
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
              required={field.required}
              value={formData[field.field]}
              onChange={handleChange}>
              <option value="">Select...</option>
              {field.options.map(option => (
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
                    onChange={e => {
                      const checked = e.target.checked;
                      setFormData(prev => {
                        // Get current values or initialize as empty array
                        const currentValues = prev[field.field] || [];
                        if (checked) {
                          // Add checked option
                          return { ...prev, [field.field]: [...currentValues, option] };
                        } else {
                          // Remove unchecked option
                          return { ...prev, [field.field]: currentValues.filter(item => item !== option) };
                        }
                      });
                    }}
                  />
                  <label className="form-check-label" htmlFor={`${field.field}-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
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
                  value={formData[field.field]}
                  onChange={handleChange}
                  required={field.required}
                />
              </div>
            );
          case 'slider':
            const marks = Array.from({ length: 11 }, (_, i) => i); // Creates an array [0, 1, 2, ..., 10]
          
            return (
              <div className="mb-3" key={field.field}>
                <label htmlFor={field.field} className="form-label">
                  {field.label}
                </label>
                <input
                  type="range"
                  className="form-range custom-range"
                  min="0"
                  max="10"
                  id={field.field}
                  value={formData[field.field]}
                  onChange={handleChange}
                  style={{
                    '--value': formData[field.field],
                    '--min': 0,
                    '--max': 10
                  }}
                />
                <div className="d-flex justify-content-between">
                  {marks.map(mark => (
                    <small key={mark} className="mark">{mark}</small>
                  ))}
                </div>
              </div>
            );
          case 'file-upload':
            return (
              <div className="mb-3" key={field.field}>
                <label htmlFor={field.field} className="form-label">{field.label}</label>
                <input
                  type="file"
                  className="form-control"
                  id={field.field}
                  name={field.field}
                  onChange={handleChange}
                  accept="image/*;capture=camera"
                />
              </div>
            );
            
            
      // Add more cases for other field types if necessary
      default:
        return null;
    }
  };

  if (!clientConfig) {
    return <div>Loading...</div>;
  }



  return (
    <div className="container mt-5 form-container">
      <h2 className="mb-4">Patient Intake Form</h2>
      {submitStatus && <p>{submitStatus}</p>} {/* Display submission status */}
      <form onSubmit={handleSubmit}>
        {clientConfig.formFields.map(field => renderFormField(field))}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
  
};

export default PatientForm;
