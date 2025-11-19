import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';

// Helper to format date for display (DD-MM-YYYY)
const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
};

// Helper to format date for Input field (YYYY-MM-DD)
const formatDateInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};

function TaxModal({ show, handleClose, vehicle, refreshData }) {
    // State for Form Data
    const [formData, setFormData] = useState({
        tax_mode: '',
        from_date: '',
        upto_date: '',
        amount: '',
        vehicle_type_opt: ''
    });

    // State for Edit Mode
    const [editingId, setEditingId] = useState(null); // If null, we are adding. If set, we are editing.

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!vehicle) return null;

    // Load data into form when "Edit" is clicked
    const handleEditClick = (tax) => {
        setEditingId(tax.id);
        setFormData({
            tax_mode: tax.tax_mode,
            from_date: formatDateInput(tax.from_date),
            upto_date: formatDateInput(tax.upto_date),
            amount: tax.amount,
            vehicle_type_opt: tax.vehicle_type_opt || ''
        });
        setError(null);
    };

    // Cancel Edit Mode
    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ tax_mode: '', from_date: '', upto_date: '', amount: '', vehicle_type_opt: '' });
        setError(null);
    };

    // Handle Submit (Create OR Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                // UPDATE Existing
                await api.put(`/api/taxes/${editingId}`, formData);
            } else {
                // CREATE New
                await api.post(`/api/vehicles/${vehicle.id}/taxes`, formData);
            }

            // Refresh parent data
            await refreshData();

            // Reset Form
            handleCancelEdit();

        } catch (err) {
            setError("Failed to save record. Please checks inputs.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this record?")) return;
        try {
            await api.delete(`/api/taxes/${id}`);
            await refreshData();
        } catch(err) {
            alert("Failed to delete");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton onHide={handleCancelEdit}>
                <Modal.Title>Manage Tax - {vehicle.registration_no}</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {/* 1. History Table */}
                <h6 className="text-muted">History</h6>
                <div className="table-responsive mb-4" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    <Table size="sm" striped bordered hover className="align-middle">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th>Mode</th>
                                <th>From</th>
                                <th>Upto</th>
                                <th>Amount</th>
                                <th className="text-center" style={{minWidth: '120px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicle.taxes?.map(t => (
                                <tr key={t.id} className={editingId === t.id ? "table-primary" : ""}>
                                    <td>{t.tax_mode}</td>
                                    <td>{formatDateDisplay(t.from_date)}</td>
                                    <td>
                                        {formatDateDisplay(t.upto_date)} <br/>
                                        {new Date(t.upto_date) < new Date() && <Badge bg="danger">Expired</Badge>}
                                    </td>
                                    <td>{t.amount}</td>
                                    <td className="text-center">
                                        <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(t)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {(!vehicle.taxes || vehicle.taxes.length === 0) && (
                                <tr><td colSpan="5" className="text-center text-muted">No records found</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                <hr />

                {/* 2. Add / Edit Form */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className={editingId ? "text-primary fw-bold" : "text-success fw-bold"}>
                        {editingId ? 'Edit Tax Record' : 'Add New Tax'}
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
                        <Col md={4}>
                            <Form.Group className="mb-2">
                                <Form.Label>Tax Mode</Form.Label>
                                <Form.Select required value={formData.tax_mode} onChange={e => setFormData({...formData, tax_mode: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option value="MTT">MTT (Monthly)</option>
                                    <option value="QTT">QTT (Quarterly)</option>
                                    <option value="HYT">HYT (Half Yearly)</option>
                                    <option value="YTT">YTT (Yearly)</option>
                                    <option value="LTT">LTT (Lifetime)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-2">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-2">
                                <Form.Label>Type (Optional)</Form.Label>
                                <Form.Control placeholder="LMV/HGMV" value={formData.vehicle_type_opt} onChange={e => setFormData({...formData, vehicle_type_opt: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>From Date</Form.Label>
                                <Form.Control type="date" value={formData.from_date} onChange={e => setFormData({...formData, from_date: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Upto Date *</Form.Label>
                                <Form.Control type="date" required value={formData.upto_date} onChange={e => setFormData({...formData, upto_date: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant={editingId ? "primary" : "success"} disabled={loading} className="w-100">
                        {loading ? <Spinner size="sm" animation="border" /> : (editingId ? 'Update Record' : 'Add Record')}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default TaxModal;
