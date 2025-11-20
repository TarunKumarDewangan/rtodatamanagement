import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';
import PaymentModal from './PaymentModal';

const CONFIG = {
    fitness: { title: 'Fitness', apiPath: 'fitnesses', listKey: 'fitnesses', numField: 'certificate_no', dateField: 'expiry_date', docType: 'fitness', numLabel: 'Certificate No' },
    permit: { title: 'Permit', apiPath: 'permits', listKey: 'permits', numField: 'permit_no', dateField: 'expiry_date', docType: 'permit', numLabel: 'Permit No' },
    pucc: { title: 'PUCC', apiPath: 'puccs', listKey: 'puccs', numField: 'pucc_number', dateField: 'valid_until', docType: 'pucc', numLabel: 'PUCC No' },
    speed_gov: { title: 'Speed Governor', apiPath: 'speed-governors', listKey: 'speed_governors', numField: 'vendor_name', dateField: 'expiry_date', docType: 'speed_gov', numLabel: 'Vendor Name' },
    vltd: { title: 'VLTd', apiPath: 'vltds', listKey: 'vltds', numField: 'vendor_name', dateField: 'expiry_date', docType: 'vltd', numLabel: 'Vendor Name' },
};

const formatDateDisplay = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : '-';
const formatDateInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

function UniversalDocModal({ show, handleClose, vehicle, docType, refreshData }) {
    const conf = CONFIG[docType];
    // Safety check: if docType is invalid, don't render
    if (!vehicle || !conf) return null;

    const startDateField = docType === 'pucc' ? 'valid_from' : 'issue_date';

    // Form State
    const [formData, setFormData] = useState({ [conf.numField]: '', [conf.dateField]: '', [startDateField]: '', total_amount: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Payment State
    const [showPayment, setShowPayment] = useState(false);
    const [payId, setPayId] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Helper to calculate balance
    const getBalance = (item) => {
        const bill = parseFloat(item.total_amount || 0);
        const paid = item.transactions?.reduce((sum, tr) => sum + parseFloat(tr.amount_paid), 0) || 0;
        return bill - paid;
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            [conf.numField]: item[conf.numField] || '',
            [conf.dateField]: formatDateInput(item[conf.dateField]),
            [startDateField]: formatDateInput(item[startDateField]),
            total_amount: item.total_amount || '' // Ensure this loads correctly
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ [conf.numField]: '', [conf.dateField]: '', [startDateField]: '', total_amount: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Ensure total_amount is sent properly
            const payload = { ...formData, total_amount: parseFloat(formData.total_amount) || 0 };

            if (editingId) await api.put(`/api/${conf.apiPath}/${editingId}`, payload);
            else await api.post(`/api/vehicles/${vehicle.id}/${conf.apiPath}`, payload);

            await refreshData();
            handleCancelEdit();
        } catch (err) {
            console.error(err);
            setError("Failed to save. Check inputs.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete?")) return;
        try { await api.delete(`/api/${conf.apiPath}/${id}`); await refreshData(); } catch(err) { alert("Failed"); }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
                <Modal.Header closeButton onHide={handleCancelEdit}><Modal.Title>Manage {conf.title} - {vehicle.registration_no}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className="table-responsive mb-4" style={{maxHeight: '250px', overflowY: 'auto'}}>
                        <Table size="sm" striped bordered hover className="align-middle">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>{conf.numLabel}</th>
                                    <th>Expiry</th>
                                    <th>Bill Amount</th>
                                    <th>Balance</th>
                                    <th className="text-center" style={{minWidth:'160px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Access the dynamic list key safely */}
                                {vehicle[conf.listKey]?.map(item => {
                                    const bal = getBalance(item);
                                    return (
                                        <tr key={item.id} className={editingId === item.id ? "table-primary" : ""}>
                                            <td>{item[conf.numField] || '-'}</td>
                                            <td>
                                                {formatDateDisplay(item[conf.dateField])}
                                                {new Date(item[conf.dateField]) < new Date() && <Badge bg="danger" className="ms-2">Exp</Badge>}
                                            </td>
                                            <td>₹{parseFloat(item.total_amount || 0).toFixed(2)}</td>
                                            <td className={bal > 0 ? 'text-danger fw-bold' : 'text-success'}>₹{bal.toFixed(2)}</td>
                                            <td className="text-center">
                                                {/* PAY BUTTON */}
                                                {bal > 0 && <Button size="sm" variant="success" className="me-1" onClick={() => { setPayId(item.id); setShowPayment(true); }}>Pay</Button>}
                                                <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(item)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>X</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <hr />
                    <h6 className="text-primary fw-bold">{editingId ? 'Edit Record' : 'Add New'}</h6>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{conf.numLabel} (Optional)</Form.Label>
                                    <Form.Control name={conf.numField} value={formData[conf.numField] || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-primary fw-bold">Bill Amount *</Form.Label>
                                    <Form.Control type="number" required name="total_amount" value={formData.total_amount} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Start Date</Form.Label><Form.Control type="date" name={startDateField} value={formData[startDateField] || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Expiry Date *</Form.Label><Form.Control type="date" required name={conf.dateField} value={formData[conf.dateField] || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                        <Button type="submit" variant={editingId ? "primary" : "success"} className="w-100" disabled={loading}>{loading ? <Spinner size="sm"/> : 'Save Record'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* IMPORTANT: docType passed here must match the key in TransactionController */}
            <PaymentModal
                show={showPayment}
                handleClose={() => setShowPayment(false)}
                docType={conf.docType} // This passes 'fitness', 'permit', etc.
                docId={payId}
                refreshData={refreshData}
            />
        </>
    );
}

export default UniversalDocModal;
