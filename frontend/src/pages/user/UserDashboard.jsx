import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function UserDashboard() {
    const { user, hasActivity } = useAuth();

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Dashboard</h2>
                <span className="text-muted">Welcome, <strong>{user?.name}</strong></span>
            </div>

            {/* Permission Warning */}
            {user?.activities?.length === 0 && (
                <Alert variant="warning">
                    You have no permissions assigned. Please contact an Admin.
                </Alert>
            )}

            <Row>
                {/* Card: Manage Citizens */}
                {hasActivity('create_citizen') && (
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body className="d-flex flex-column text-center">
                                <h1 className="display-4 text-primary mb-3">👤</h1>
                                <Card.Title>Citizen Management</Card.Title>
                                <Card.Text className="text-muted">
                                    Register new citizens and manage their vehicles/documents.
                                </Card.Text>
                                <div className="mt-auto d-grid gap-2">
                                    <Button as={Link} to="/create-citizen" variant="primary">
                                        + New Citizen
                                    </Button>
                                    <Button as={Link} to="/view-citizens" variant="outline-primary">
                                        View All Records
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Card: Reports */}
                {hasActivity('view_reports') && (
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body className="d-flex flex-column text-center">
                                <h1 className="display-4 text-success mb-3">📊</h1>
                                <Card.Title>Expiry Reports</Card.Title>
                                <Card.Text className="text-muted">
                                    Generate reports for expiring Taxes, Insurance, and Fitness records.
                                </Card.Text>
                                <div className="mt-auto d-grid">
                                    <Button as={Link} to="/expiry-report" variant="success">
                                        View Reports
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default UserDashboard;
