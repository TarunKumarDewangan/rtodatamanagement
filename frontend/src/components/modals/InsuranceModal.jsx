import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';
import PaymentModal from './PaymentModal';

const formatDateDisplay = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : '-';
const formatDateInput = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

function InsuranceModal({ show, handleClose, vehicle, refreshData }) {
    const [formData, setFormData] = useState({ company: '', type: '', start_date: '', end_date: '', status: 'Active', total_amount: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Payment State
    const [showPayment, setShowPayment] = useState(false);
    const [payId, setPayId] = useState(null);

    if (!vehicle) return null;

    // Helper to calculate balance
    const getBalance = (item) => {
        const bill = parseFloat(item.total_amount || 0);
        const paid = item.transactions?.reduce((sum, tr) => sum + parseFloat(tr.amount_paid), 0) || 0;
        return bill - paid;
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            company: item.company || '',
            type: item.type || '',
            start_date: formatDateInput(item.start_date),
            end_date: formatDateInput(item.end_date),
            status: item.status || 'Active',
            total_amount: item.total_amount || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ company: '', type: '', start_date: '', end_date: '', status: 'Active', total_amount: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) await api.put(`/api/insurances/${editingId}`, formData);
            else await api.post(`/api/vehicles/${vehicle.id}/insurances`, formData);
            await refreshData();
            handleCancelEdit();
        } catch (err) { setError("Failed to save."); } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete?")) return;
        try { await api.delete(`/api/insurances/${id}`); await refreshData(); } catch(err) { alert("Failed"); }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
                <Modal.Header closeButton onHide={handleCancelEdit}><Modal.Title>Manage Insurance - {vehicle.registration_no}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className="table-responsive mb-4" style={{maxHeight: '250px', overflowY: 'auto'}}>
                        <Table size="sm" striped bordered hover className="align-middle">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Company</th>
                                    <th>Period</th>
                                    <th>Bill Amount</th>
                                    <th>Balance</th>
                                    <th className="text-center" style={{minWidth:'160px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicle.insurances?.map(i => {
                                    const bal = getBalance(i);
                                    return (
                                        <tr key={i.id} className={editingId === i.id ? "table-primary" : ""}>
                                            <td>{i.company || '-'} <br/> <small className="text-muted">{i.type}</small></td>
                                            <td>
                                                <small>{formatDateDisplay(i.start_date)} <br/> to {formatDateDisplay(i.end_date)}</small>
                                                {new Date(i.end_date) < new Date() && <Badge bg="danger" className="ms-1">Exp</Badge>}
                                            </td>
                                            <td>₹{parseFloat(i.total_amount || 0).toFixed(2)}</td>
                                            <td className={bal > 0 ? 'text-danger fw-bold' : 'text-success'}>₹{bal.toFixed(2)}</td>
                                            <td className="text-center">
                                                {/* PAY BUTTON IS HERE */}
                                                {bal > 0 && <Button size="sm" variant="success" className="me-1" onClick={() => { setPayId(i.id); setShowPayment(true); }}>Pay</Button>}
                                                <Button size="sm" variant="info" className="me-1 text-white" onClick={() => handleEditClick(i)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(i.id)}>X</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <hr />
                    <h6 className="text-primary fw-bold">{editingId ? 'Edit Record' : 'Add New Insurance'}</h6>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label>Company</Form.Label><Form.Control value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label>Type</Form.Label><Form.Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="">Select...</option><option>Third Party</option><option>Comprehensive</option></Form.Select></Form.Group></Col>
                            <Col md={4}><Form.Group className="mb-2"><Form.Label className="text-primary fw-bold">Bill Amount *</Form.Label><Form.Control type="number" required value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Start Date</Form.Label><Form.Control type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>End Date *</Form.Label><Form.Control type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} /></Form.Group></Col>
                        </Row>
                        <Button type="submit" variant={editingId ? "primary" : "success"} disabled={loading} className="w-100">{loading ? <Spinner size="sm" /> : 'Save Record'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <PaymentModal show={showPayment} handleClose={() => setShowPayment(false)} docType="insurance" docId={payId} refreshData={refreshData} />
        </>
    );
}

export default InsuranceModal;
