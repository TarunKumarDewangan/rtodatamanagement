import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';

// Configuration for different document types
const CONFIG = {
    fitness: { title: 'Fitness', apiPath: 'fitnesses', listKey: 'fitnesses', numField: 'certificate_no', dateField: 'expiry_date' },
    permit: { title: 'Permit', apiPath: 'permits', listKey: 'permits', numField: 'permit_no', dateField: 'expiry_date' },
    pucc: { title: 'PUCC', apiPath: 'puccs', listKey: 'puccs', numField: 'pucc_number', dateField: 'valid_until' },
    speed_gov: { title: 'Speed Governor', apiPath: 'speed-governors', listKey: 'speed_governors', numField: 'vendor_name', dateField: 'expiry_date', numLabel: 'Vendor Name' },
    vltd: { title: 'VLTd', apiPath: 'vltds', listKey: 'vltds', numField: 'vendor_name', dateField: 'expiry_date', numLabel: 'Vendor Name' },
};

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

function UniversalDocModal({ show, handleClose, vehicle, docType, refreshData }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Edit State
    const [editingId, setEditingId] = useState(null);

    const conf = CONFIG[docType];

    // PUCC uses 'valid_from', others use 'issue_date'
    const startDateField = docType === 'pucc' ? 'valid_from' : 'issue_date';

    // Dynamic State based on config
    const [formData, setFormData] = useState({
        [conf?.numField]: '',
        [conf?.dateField]: '', // Expiry
        [startDateField]: ''   // Start Date
    });

    if (!vehicle || !conf) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Edit Logic ---
    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            [conf.numField]: item[conf.numField] || '',
            [conf.dateField]: formatDateInput(item[conf.dateField]),
            [startDateField]: formatDateInput(item[startDateField])
        });
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            [conf.numField]: '',
            [conf.dateField]: '',
            [startDateField]: ''
        });
        setError(null);
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                await api.put(`/api/${conf.apiPath}/${editingId}`, formData);
            } else {
                await api.post(`/api/vehicles/${vehicle.id}/${conf.apiPath}`, formData);
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
        if(!window.confirm("Delete this record?")) return;
        try { await api.delete(`/api/${conf.apiPath}/${id}`); await refreshData(); } catch(err) { alert("Failed to delete"); }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton onHide={handleCancelEdit}>
                <Modal.Title>Manage {conf.title} - {vehicle.registration_no}</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {/* 1. History List */}
                <div className="table-responsive mb-4" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    <Table size="sm" striped bordered hover className="align-middle">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th>{conf.numLabel || 'Number'}</th>
                                <th>Start Date</th>
                                <th>Expiry Date</th>
                                <th className="text-center" style={{minWidth: '120px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicle[conf.listKey]?.map(item => (
                                <tr key={item.id} className={editingId === item.id ? "table-primary" : ""}>
                                    <td>{item[conf.numField] || '-'}</td>
                                    <td>{formatDateDisplay(item[startDateField])}</td>
                                    <td>
                                        {formatDateDisplay(item[conf.dateField])}
                                        {new Date(item[conf.dateField]) < new Date() && <Badge bg="danger" className="ms-2">Expired</Badge>}
                                    </td>
                                    <td className="text-center">
                                        <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(item)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {(!vehicle[conf.listKey] || vehicle[conf.listKey].length === 0) && (
                                <tr><td colSpan="4" className="text-center text-muted">No records found</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                <hr />

                {/* 2. Add / Edit Form */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className={editingId ? "text-primary fw-bold" : "text-success fw-bold"}>
                        {editingId ? `Edit ${conf.title}` : `Add New ${conf.title}`}
                    </h6>
                    {editingId && (
                        <Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>
                            Cancel Edit
                        </Button>
                    )}
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>{conf.numLabel || 'Certificate / Permit Number'} (Optional)</Form.Label>
                        <Form.Control
                            name={conf.numField}
                            value={formData[conf.numField] || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Issue / Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name={startDateField}
                                    value={formData[startDateField] || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Expiry Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    required
                                    name={conf.dateField}
                                    value={formData[conf.dateField] || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant={editingId ? "primary" : "success"} className="w-100" disabled={loading}>
                        {loading ? <Spinner size="sm"/> : (editingId ? 'Update Record' : 'Add Record')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default UniversalDocModal;
