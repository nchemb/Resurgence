import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubmissionSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="container mt-5">
            <div className="card text-center">
                <div className="card-header">
                    Success!
                </div>
                <div className="card-body">
                    <h5 className="card-title">Form Submission Successful</h5>
                    <p className="card-text">Thank you for submitting the form. Your information has been successfully recorded.</p>
                    <button onClick={() => navigate('/intake')} className="btn btn-primary">Submit Another Form</button>
                </div>
                <div className="card-footer text-muted">
                    JustIntake
                </div>
            </div>
        </div>
    );
};

export default SubmissionSuccess;
