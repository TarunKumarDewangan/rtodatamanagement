import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function UserLayout() {
    const { user, logout, hasActivity } = useAuth();
    const location = useLocation();

    return (
        <>
            {/* Top Navigation Bar */}
            <Navbar bg="white" expand="lg" className="shadow-sm border-bottom mb-4 sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/user" className="fw-bold text-primary">
                        RTO Management
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="user-navbar" />
                    <Navbar.Collapse id="user-navbar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/user" active={location.pathname === '/user'}>
                                Dashboard
                            </Nav.Link>

                            {hasActivity('create_citizen') && (
                                <>
                                    <Nav.Link as={Link} to="/view-citizens" active={location.pathname.startsWith('/view-citizens') || location.pathname.startsWith('/citizens/')}>
                                        Citizens
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/create-citizen" active={location.pathname === '/create-citizen'}>
                                        + New Citizen
                                    </Nav.Link>
                                </>
                            )}

                            {hasActivity('view_reports') && (
                                <Nav.Link as={Link} to="/expiry-report" active={location.pathname === '/expiry-report'}>
                                    Expiry Reports
                                </Nav.Link>
                            )}
                        </Nav>

                        <div className="d-flex align-items-center">
                            <span className="me-3 text-muted d-none d-lg-block">
                                Signed in as: <strong>{user?.name}</strong>
                            </span>
                            <Button variant="outline-danger" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Page Content renders here */}
            <Container style={{ minHeight: '80vh' }}>
                <Outlet />
            </Container>

            {/* Simple Footer */}
            <footer className="text-center py-4 text-muted small mt-auto">
                &copy; {new Date().getFullYear()} RTO Data Management System
            </footer>
        </>
    );
}

export default UserLayout;
