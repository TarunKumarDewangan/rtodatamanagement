import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api';
import { FaUsers, FaTruck, FaRupeeSign, FaExclamationTriangle } from 'react-icons/fa';

function UserDashboard() {
    const { user, hasActivity } = useAuth();
    const [stats, setStats] = useState({ citizens: 0, vehicles: 0, revenue_today: 0, expiring_soon: 0 });
    const [loading, setLoading] = useState(true);

    // 1. Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/dashboard/stats');
                setStats(data);
            } catch (err) {
                console.error("Stats load failed");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleDownloadBackup = () => {
        window.open('http://localhost:8000/api/export/backup?include=all', '_blank');
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Dashboard</h2>
                <span className="text-muted">Welcome back, <strong>{user?.name}</strong></span>
            </div>

            {/* --- ANALYTICS WIDGETS --- */}
            {loading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <Row className="mb-5 g-3">
                    {/* Card 1: Expiring Soon */}
                    <Col md={6} xl={3}>
                        <Link to="/expiry-report" className="text-decoration-none">
                            <Card className="border-0 shadow-sm h-100" style={{borderLeft: '5px solid #ffc107'}}>
                                <Card.Body className="d-flex align-items-center">
                                    <div className="bg-warning-subtle p-3 rounded-circle me-3 text-warning">
                                        <FaExclamationTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark">{stats.expiring_soon}</h3>
                                        <small className="text-muted text-uppercase fw-bold">Expiring (15 Days)</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>

                    {/* Card 2: Today's Revenue */}
                    <Col md={6} xl={3}>
                        <Card className="border-0 shadow-sm h-100" style={{borderLeft: '5px solid #198754'}}>
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-success-subtle p-3 rounded-circle me-3 text-success">
                                    <FaRupeeSign size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark">₹{stats.revenue_today.toLocaleString()}</h3>
                                    <small className="text-muted text-uppercase fw-bold">Collected Today</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Card 3: Citizens */}
                    <Col md={6} xl={3}>
                        <Link to="/view-citizens" className="text-decoration-none">
                            <Card className="border-0 shadow-sm h-100" style={{borderLeft: '5px solid #0d6efd'}}>
                                <Card.Body className="d-flex align-items-center">
                                    <div className="bg-primary-subtle p-3 rounded-circle me-3 text-primary">
                                        <FaUsers size={24} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark">{stats.citizens}</h3>
                                        <small className="text-muted text-uppercase fw-bold">Total Citizens</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>

                    {/* Card 4: Vehicles */}
                    <Col md={6} xl={3}>
                        <Card className="border-0 shadow-sm h-100" style={{borderLeft: '5px solid #6c757d'}}>
                            <Card.Body className="d-flex align-items-center">
                                <div className="bg-secondary-subtle p-3 rounded-circle me-3 text-secondary">
                                    <FaTruck size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark">{stats.vehicles}</h3>
                                    <small className="text-muted text-uppercase fw-bold">Total Vehicles</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <h5 className="mb-3 text-secondary">Quick Actions</h5>
            <Row>
                {/* ... Existing Menu Cards ... */}
                {hasActivity('create_citizen') && (
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0 bg-white hover-shadow">
                            <Card.Body className="text-center py-4">
                                <div className="mb-3 text-primary"><FaUsers size={40} /></div>
                                <Card.Title>Manage Citizens</Card.Title>
                                <Card.Text className="text-muted small">Add new customers or update vehicle details.</Card.Text>
                                <div className="d-grid gap-2">
                                    <Button as={Link} to="/create-citizen" variant="primary">+ New Citizen</Button>
                                    <Button as={Link} to="/view-citizens" variant="outline-primary">View All</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {hasActivity('view_reports') && (
                    <Col md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0 bg-white hover-shadow">
                            <Card.Body className="text-center py-4">
                                <div className="mb-3 text-success"><FaExclamationTriangle size={40} /></div>
                                <Card.Title>Expiry Reports</Card.Title>
                                <Card.Text className="text-muted small">Track documents expiring soon and send alerts.</Card.Text>
                                <div className="d-grid">
                                    <Button as={Link} to="/expiry-report" variant="success">View Reports</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                <Col md={6} lg={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0 bg-white hover-shadow">
                        <Card.Body className="text-center py-4">
                            <div className="mb-3 text-secondary">💾</div>
                            <Card.Title>Data Backup</Card.Title>
                            <Card.Text className="text-muted small">Download database backup (CSV/ZIP).</Card.Text>
                            <div className="d-grid">
                                <Button as={Link} to="/backup" variant="secondary">Go to Backup</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default UserDashboard;
