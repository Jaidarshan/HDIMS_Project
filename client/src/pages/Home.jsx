import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero-section p-5 text-white rounded-3 mb-5">
        <div className="row align-items-center">
            <div className="col-md-8">
                <h1 className="display-4 fw-bold mb-3">Welcome to HDIMS</h1>
                <p className="lead mb-4">
                    Advanced Health Data Information Management System powered by intelligent data structures 
                    for efficient healthcare delivery.
                </p>
                <div className="d-flex gap-3">
                    <Link to="/login" className="btn btn-light btn-lg px-4 text-primary fw-bold">
                        <i className="fas fa-sign-in-alt me-2"></i>Login
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg px-4 fw-bold">
                        <i className="fas fa-user-plus me-2"></i>Register
                    </Link>
                </div>
            </div>
            <div className="col-md-4 text-center d-none d-md-block">
                <i className="fas fa-hospital-user fa-8x opacity-75"></i>
            </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
            <div className="card h-100 text-center p-4">
                <div className="feature-icon bg-primary bg-opacity-10 text-primary mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-calendar-check fa-2x"></i>
                </div>
                <h3>Smart Scheduling</h3>
                <p className="text-muted">
                    Priority-based appointment scheduling system ensuring critical cases are attended to first.
                </p>
            </div>
        </div>
        <div className="col-md-4">
            <div className="card h-100 text-center p-4">
                <div className="feature-icon bg-success bg-opacity-10 text-success mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-file-medical-alt fa-2x"></i>
                </div>
                <h3>Electronic Records</h3>
                <p className="text-muted">
                    Secure and efficient storage of patient medical history and treatment records.
                </p>
            </div>
        </div>
        <div className="col-md-4">
            <div className="card h-100 text-center p-4">
                <div className="feature-icon bg-info bg-opacity-10 text-info mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-search fa-2x"></i>
                </div>
                <h3>Quick Search</h3>
                <p className="text-muted">
                    Advanced trie-based search algorithms for instant retrieval of patient and doctor information.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;