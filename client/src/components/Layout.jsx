import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="main-layout">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* Main Content Area: Pushed to the right by CSS */}
      <div className="main-content w-100 bg-body">
        {children}
      </div>
    </div>
  );
};

export default Layout;