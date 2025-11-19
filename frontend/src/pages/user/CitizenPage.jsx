import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Container } from 'react-bootstrap';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

function CitizenPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', mobile_number: '', email: '', birth_date: '',
        relation_type: '', relation_name: '', address: '', state: '', city_district: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/citizens', formData);
            // Redirect to the detailed profile page to add vehicles immediately
            navigate(`/citizens/${data.id}`);
        } catch (err) {
            setError("Failed to create citizen. Check inputs.");
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4>Register New Citizen</h4>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name *</Form.Label>
                                    <Form.Control name="name" required onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile Number *</Form.Label>
                                    <Form.Control name="mobile_number" required onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email (Optional)</Form.Label>
                                    <Form.Control type="email" name="email" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control type="date" name="birth_date" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Relation Type</Form.Label>
                                    <Form.Select name="relation_type" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="S/O">Son of</option>
                                        <option value="W/O">Wife of</option>
                                        <option value="D/O">Daughter of</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Relation Name</Form.Label>
                                    <Form.Control name="relation_name" placeholder="Father/Husband Name" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={2} name="address" onChange={handleChange} />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control name="state" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City / District</Form.Label>
                                    <Form.Control name="city_district" onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => navigate('/user')}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default CitizenPage;
