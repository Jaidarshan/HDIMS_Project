import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container py-4">
            {/* 1. Hero Section (Updated with .hero-gradient) */}
            <div className="hero-gradient text-center text-md-start">
                <div className="row align-items-center">
                    <div className="col-md-7">
                        <h1 className="display-5 fw-bold mb-3">Welcome to HDIMS</h1>
                        <p className="lead mb-4 opacity-90">
                            Advanced Health Data Information Management System.
                            Secure, efficient, and powered by intelligent data structures.
                        </p>
                        <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                            <Link to="/login" className="btn btn-light text-primary fw-bold px-4 py-2">
                                <i className="fas fa-sign-in-alt me-2"></i>Login
                            </Link>
                            <Link to="/register" className="btn btn-outline-light fw-bold px-4 py-2">
                                <i className="fas fa-user-plus me-2"></i>Register
                            </Link>
                        </div>
                    </div>
                    {/* Icon only shows on desktop */}
                    <div className="col-md-5 text-center d-none d-md-block">
                        <i className="fas fa-hospital-user fa-8x opacity-50"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;