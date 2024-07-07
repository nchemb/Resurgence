import React from 'react';

const NavBar = ({ onSignOut }) => {

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">The Resurgence Clinic</span>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Add your navigation links here if needed */}
          </ul>
          <button className="btn btn-outline-danger" type="button" onClick={ onSignOut }>Sign Out</button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
