import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Import Bootstrap CSS first
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. Import Bootstrap JS (for navbar toggles/dropdowns)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 3. Import your custom styles LAST so they override Bootstrap
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);