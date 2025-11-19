import React from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col md={3} lg={2} className="bg-light min-vh-100 p-3 border-end">
                    <h5 className="mb-4 text-primary">Admin Panel</h5>
                    <Nav variant="pills" className="flex-column mb-auto">
                        <Nav.Item className="mb-2">
                            <Nav.Link as={NavLink} to="/admin/users">
                                Manage Users
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="mb-2">
                            <Nav.Link as={NavLink} to="/admin/assign-activities">
                                Assign Permissions
                            </Nav.Link>
                        </Nav.Item>
                        <hr />
                        <Nav.Item>
                            <Nav.Link onClick={logout} className="text-danger" style={{ cursor: 'pointer' }}>
                                Logout
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>

                {/* Main Content Area */}
                <Col md={9} lg={10} className="p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                        <h3>Dashboard</h3>
                        <span className="text-muted">Welcome, <strong>{user?.name}</strong></span>
                    </div>

                    {/* This is where the specific page content will load */}
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
}

export default AdminLayout;
