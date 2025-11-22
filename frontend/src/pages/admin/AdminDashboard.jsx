import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner } from 'react-bootstrap';
import api from '../../api';
import { FaUsers, FaAddressCard, FaTruck, FaFileAlt } from 'react-icons/fa';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/admin/dashboard-stats');
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <h3 className="mb-4 text-primary fw-bold">System Overview</h3>

            {/* 1. Summary Cards */}
            <Row className="mb-4 g-3">
                <StatCard icon={<FaUsers />} color="primary" title="Total Users" value={stats.totals.users} />
                <StatCard icon={<FaAddressCard />} color="success" title="Total Citizens" value={stats.totals.citizens} />
                <StatCard icon={<FaTruck />} color="warning" title="Total Vehicles" value={stats.totals.vehicles} />
                <StatCard icon={<FaFileAlt />} color="info" title="Total Documents" value={stats.totals.documents} />
            </Row>

            {/* 2. Detailed Table */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 text-secondary fw-bold">User Performance Report</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover striped className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">User Name</th>
                                <th>Email</th>
                                <th className="text-center">Citizens Added</th>
                                <th className="text-center">Vehicles Added</th>
                                <th className="text-center">Documents Entry</th>
                                <th className="text-end pe-4">Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.table.map(user => (
                                <tr key={user.id}>
                                    <td className="ps-4 fw-bold text-primary">{user.name}</td>
                                    <td className="text-muted small">{user.email}</td>
                                    <td className="text-center fw-bold">{user.citizen_count}</td>
                                    <td className="text-center fw-bold">{user.vehicle_count}</td>
                                    <td className="text-center">
                                        <span className="badge bg-secondary rounded-pill px-3">
                                            {user.document_count}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4 small text-muted">{user.last_active}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}

// Helper Component for Cards
const StatCard = ({ icon, color, title, value }) => (
    <Col md={6} xl={3}>
        <Card className={`border-0 shadow-sm h-100 border-start border-5 border-${color}`}>
            <Card.Body className="d-flex align-items-center">
                <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle me-3 text-${color} fs-4`}>
                    {icon}
                </div>
                <div>
                    <div className="text-muted small fw-bold text-uppercase">{title}</div>
                    <h2 className="mb-0 fw-bold">{value}</h2>
                </div>
            </Card.Body>
        </Card>
    </Col>
);

export default AdminDashboard;
