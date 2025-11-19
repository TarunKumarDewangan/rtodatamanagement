import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';

// Helper: Display format (DD-MM-YYYY)
const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
};

// Helper: Input format (YYYY-MM-DD)
const formatDateInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};

function InsuranceModal({ show, handleClose, vehicle, refreshData }) {
    // State for Form
    const [formData, setFormData] = useState({ company: '', type: '', start_date: '', end_date: '', status: 'Active' });

    // State for Editing
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!vehicle) return null;

    // --- Edit Logic ---
    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            company: item.company || '',
            type: item.type || '',
            start_date: formatDateInput(item.start_date),
            end_date: formatDateInput(item.end_date),
            status: item.status || 'Active'
        });
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ company: '', type: '', start_date: '', end_date: '', status: 'Active' });
        setError(null);
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                await api.put(`/api/insurances/${editingId}`, formData);
            } else {
                await api.post(`/api/vehicles/${vehicle.id}/insurances`, formData);
            }
            await refreshData();
            handleCancelEdit();
        } catch (err) {
            setError("Failed to save record.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this insurance?")) return;
        try { await api.delete(`/api/insurances/${id}`); await refreshData(); } catch(err) { alert("Failed to delete"); }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton onHide={handleCancelEdit}>
                <Modal.Title>Manage Insurance - {vehicle.registration_no}</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {/* 1. History List */}
                <div className="table-responsive mb-4" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    <Table size="sm" striped bordered hover className="align-middle">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th>Company</th>
                                <th>Type</th>
                                <th>Start Date</th> {/* Added Column */}
                                <th>End Date</th>
                                <th className="text-center" style={{minWidth: '120px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicle.insurances?.map(i => (
                                <tr key={i.id} className={editingId === i.id ? "table-primary" : ""}>
                                    <td>{i.company || '-'}</td>
                                    <td>{i.type}</td>
                                    <td>{formatDateDisplay(i.start_date)}</td> {/* Added Data */}
                                    <td>
                                        {formatDateDisplay(i.end_date)} <br/>
                                        {new Date(i.end_date) < new Date() && <Badge bg="danger">Expired</Badge>}
                                    </td>
                                    <td className="text-center">
                                        <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(i)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(i.id)}>
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {(!vehicle.insurances || vehicle.insurances.length === 0) && (
                                <tr><td colSpan="5" className="text-center text-muted">No records found</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                <hr />

                {/* 2. Add / Edit Form */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className={editingId ? "text-primary fw-bold" : "text-success fw-bold"}>
                        {editingId ? 'Edit Insurance Record' : 'Add New Insurance'}
                    </h6>
                    {editingId && (
                        <Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>
                            Cancel Edit
                        </Button>
                    )}
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Company (Optional)</Form.Label>
                                <Form.Control
                                    value={formData.company}
                                    onChange={e => setFormData({...formData, company: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Type</Form.Label>
                                <Form.Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option>Third Party</option>
                                    <option>Comprehensive</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date *</Form.Label>
                                <Form.Control type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant={editingId ? "primary" : "success"} disabled={loading} className="w-100">
                        {loading ? <Spinner size="sm" /> : (editingId ? 'Update Record' : 'Add Record')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default InsuranceModal;
