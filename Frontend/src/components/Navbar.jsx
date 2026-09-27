import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import "./navbar.scss";

const Navbar = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = async () => {
        await handleLogout();
        navigate("/login");
    };

    return (
        <header className="site-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="22"
                            height="22"
                        >
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </span>
                    <span className="brand-name">
                        GenAI <span className="brand-highlight">Interview</span>
                    </span>
                </Link>

                <nav className="navbar-nav">
                    {user ? (
                        <>
                            {location.pathname !== "/" && (
                                <Link to="/" className="nav-link">
                                    + New Plan
                                </Link>
                            )}
                            <div className="user-badge">
                                <span className="user-avatar">
                                    {user.username
                                        ? user.username[0].toUpperCase()
                                        : "U"}
                                </span>
                                <span className="user-name">
                                    {user.username}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="logout-btn"
                                title="Log Out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="nav-btn primary-nav-btn"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
