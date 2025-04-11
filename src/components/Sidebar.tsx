import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <Link to="/" className="brand-link">
                <img
                    src="/img/logo.png"
                    alt="AdminLTE Logo"
                    className="brand-image img-circle elevation-3"
                    style={{ opacity: '.8' }}
                />
                <span className="brand-text font-weight-light">SPK</span>
            </Link>

            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column">
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link">
                                <i className="nav-icon fas fa-tachometer-alt" />
                                <p>Sensores</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/general-dashboard" className="nav-link">
                                <i className="nav-icon fas fa-chart-line" />
                                <p>Dashboard General</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/diagrama" className="nav-link">
                                <i className="nav-icon fas fa-project-diagram" />
                                <p>Diagrama</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar; 