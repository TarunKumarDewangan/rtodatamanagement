import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';
import PaymentModal from './PaymentModal';

// Helper: Display format
const formatDateDisplay = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : '-';
const formatDateInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

function TaxModal({ show, handleClose, vehicle, refreshData }) {
    // Added 'total_amount'
    const [formData, setFormData] = useState({ tax_mode: '', from_date: '', upto_date: '', amount: '', total_amount: '', vehicle_type_opt: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Payment State
    const [showPayment, setShowPayment] = useState(false);
    const [payId, setPayId] = useState(null);

    if (!vehicle) return null;

    const handleEditClick = (tax) => {
        setEditingId(tax.id);
        setFormData({
            tax_mode: tax.tax_mode,
            from_date: formatDateInput(tax.from_date),
            upto_date: formatDateInput(tax.upto_date),
            amount: tax.amount,
            total_amount: tax.total_amount || '',
            vehicle_type_opt: tax.vehicle_type_opt || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ tax_mode: '', from_date: '', upto_date: '', amount: '', total_amount: '', vehicle_type_opt: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) await api.put(`/api/taxes/${editingId}`, formData);
            else await api.post(`/api/vehicles/${vehicle.id}/taxes`, formData);

            await refreshData();
            handleCancelEdit();
        } catch (err) { setError("Failed to save."); } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this record?")) return;
        try { await api.delete(`/api/taxes/${id}`); await refreshData(); } catch(err) { alert("Failed"); }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
                <Modal.Header closeButton onHide={handleCancelEdit}><Modal.Title>Manage Tax - {vehicle.registration_no}</Modal.Title></Modal.Header>
                <Modal.Body>

                    {/* History Table */}
                    <div className="table-responsive mb-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <Table size="sm" striped bordered hover className="align-middle text-center">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Mode</th>
                                    <th>From</th>
                                    <th>Upto</th>
                                    <th>Govt Fee</th> {/* New Column */}
                                    <th>Bill Amount</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th style={{minWidth: '150px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicle.taxes?.map(t => {
                                    const billAmount = parseFloat(t.total_amount || 0);
                                    const totalPaid = t.transactions?.reduce((sum, tr) => sum + parseFloat(tr.amount_paid || 0), 0) || 0;
                                    const currentBal = (billAmount - totalPaid).toFixed(2);

                                    return (
                                        <tr key={t.id} className={editingId === t.id ? "table-primary" : ""}>
                                            <td>{t.tax_mode}</td>
                                            <td>{formatDateDisplay(t.from_date)}</td>
                                            <td>
                                                {formatDateDisplay(t.upto_date)}
                                                {new Date(t.upto_date) < new Date() && <Badge bg="danger" className="ms-1">Exp</Badge>}
                                            </td>
                                            <td>₹{t.amount || '0'}</td>
                                            <td>₹{t.total_amount || '0'}</td>
                                            <td className="text-success">₹{totalPaid}</td>
                                            <td className={currentBal > 0 ? 'text-danger fw-bold' : 'text-success'}>₹{currentBal}</td>
                                            <td>
                                                {/* Pay Button ALWAYS visible */}
                                                <Button size="sm" variant="success" className="me-1" onClick={() => { setPayId(t.id); setShowPayment(true); }}>
                                                    Pay
                                                </Button>
                                                <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(t)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>X</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <hr />

                    {/* Form */}
                    <h6 className="text-primary fw-bold">{editingId ? 'Edit Tax Record' : 'Add New Tax'}</h6>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Tax Mode</Form.Label>
                                    <Form.Select required value={formData.tax_mode} onChange={e => setFormData({...formData, tax_mode: e.target.value})}>
                                        <option value="">Select...</option>
                                        <option value="MTT">MTT</option>
                                        <option value="QTT">QTT</option>
                                        <option value="HYT">HYT</option>
                                        <option value="YTT">YTT</option>
                                        <option value="LTT">LTT</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Govt Fee (Optional)</Form.Label>
                                    <Form.Control type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="text-primary fw-bold">Bill Amount (Optional)</Form.Label>
                                    {/* Removed 'required' */}
                                    <Form.Control type="number" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Type (Opt)</Form.Label>
                                    <Form.Control placeholder="LMV" value={formData.vehicle_type_opt} onChange={e => setFormData({...formData, vehicle_type_opt: e.target.value})} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>From</Form.Label><Form.Control type="date" value={formData.from_date} onChange={e => setFormData({...formData, from_date: e.target.value})} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Upto *</Form.Label><Form.Control type="date" required value={formData.upto_date} onChange={e => setFormData({...formData, upto_date: e.target.value})} /></Form.Group></Col>
                        </Row>
                        <Button type="submit" variant={editingId ? "primary" : "success"} disabled={loading} className="w-100">{loading ? <Spinner size="sm" /> : 'Save Record'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <PaymentModal
                show={showPayment}
                handleClose={() => setShowPayment(false)}
                docType="tax"
                docId={payId}
                refreshData={refreshData}
            />
        </>
    );
}

export default TaxModal;
