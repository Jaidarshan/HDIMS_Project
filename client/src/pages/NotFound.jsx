import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead text-muted mb-5">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
            <i className="fas fa-home me-2"></i>Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;