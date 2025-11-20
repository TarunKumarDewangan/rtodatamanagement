import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Spinner, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import api from '../../api';
import { Link, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa'; // Ensure you have react-icons installed

function ViewCitizensPage() {
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search') || '';

    // --- Edit Modal State ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    const fetchCitizens = async () => {
        setLoading(true);
        try {
            const endpoint = query ? `/api/citizens?search=${query}` : '/api/citizens';
            const { data } = await api.get(endpoint);
            setCitizens(data);
        } catch (err) {
            console.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitizens();
    }, [query]);

    // --- DELETE Logic ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the Citizen, all Vehicles, and all Documents permanently.")) {
            return;
        }
        try {
            await api.delete(`/api/citizens/${id}`); // You might need to add this route to API if not exists, usually standard resource controller has it.
            // Optimistic update: remove from UI immediately
            setCitizens(citizens.filter(c => c.id !== id));
        } catch (err) {
            alert("Failed to delete. Please try again.");
        }
    };

    // --- EDIT Logic ---
    const handleEditClick = (citizen) => {
        setEditData({ ...citizen }); // Clone data to edit form
        setEditError(null);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError(null);
        try {
            // We need a PUT route for citizens.
            // If using resource controller, it is PUT /api/citizens/{id}
            // Note: You might need to add `Route::put('/citizens/{citizen}', ...)` in api.php if missing.
            await api.put(`/api/citizens/${editData.id}`, editData);

            setShowEditModal(false);
            fetchCitizens(); // Refresh list
        } catch (err) {
            setEditError("Failed to update details.");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0 text-primary">Citizen Records</h4>
                        {query && <small className="text-muted">Showing results for: <strong>"{query}"</strong></small>}
                    </div>
                    <Link to="/create-citizen" className="btn btn-success">+ Add New</Link>
                </Card.Header>
                <Card.Body>
                    {loading ? <div className="text-center py-4"><Spinner animation="border" /></div> : (
                        <Table responsive hover striped className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Location</th>
                                    <th>Vehicles</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {citizens.map((c, index) => (
                                    <tr key={c.id}>
                                        <td>{index + 1}</td>

                                        {/* 1. Clickable Name */}
                                        <td>
                                            <Link to={`/citizens/${c.id}`} className="fw-bold text-decoration-none text-dark hover-primary">
                                                {c.name}
                                            </Link>
                                            <div className="small text-muted">{c.relation_type} {c.relation_name}</div>
                                        </td>

                                        <td>{c.mobile_number}</td>
                                        <td>{c.city_district}</td>

                                        {/* 2. Vehicles Column */}
                                        <td>
                                            {c.vehicles?.length > 0 ? c.vehicles.map(v => (
                                                <Badge bg="secondary" className="me-1 mb-1 fw-normal" key={v.id}>
                                                    {v.registration_no}
                                                </Badge>
                                            )) : <span className="text-muted small">-</span>}
                                        </td>

                                        {/* 3. Actions: View, Edit, Delete */}
                                        <td className="text-end">
                                            <Link to={`/citizens/${c.id}`} className="btn btn-sm btn-outline-primary me-1" title="View Profile">
                                                <FaEye />
                                            </Link>
                                            <Button variant="outline-info" size="sm" className="me-1" onClick={() => handleEditClick(c)} title="Edit Details">
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.id)} title="Delete">
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {citizens.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted py-4">No records found.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* --- EDIT CITIZEN MODAL --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Citizen Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        {editError && <Alert variant="danger">{editError}</Alert>}
                        {editData && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mobile</Form.Label>
                                            <Form.Control
                                                value={editData.mobile_number}
                                                onChange={(e) => setEditData({...editData, mobile_number: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City/District</Form.Label>
                                            <Form.Control
                                                value={editData.city_district || ''}
                                                onChange={(e) => setEditData({...editData, city_district: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Relation ({editData.relation_type})</Form.Label>
                                    <Form.Control
                                        value={editData.relation_name || ''}
                                        onChange={(e) => setEditData({...editData, relation_name: e.target.value})}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={editLoading}>
                            {editLoading ? <Spinner size="sm" /> : "Save Changes"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
}

export default ViewCitizensPage;
