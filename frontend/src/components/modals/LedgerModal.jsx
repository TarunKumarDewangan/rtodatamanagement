import React, { useState } from 'react';
import { Modal, Table, Badge, Alert, Button, Card, Form, Row, Col } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../api';

function LedgerModal({ show, handleClose, citizen, refreshData }) { // <--- Added refreshData prop
    const [expandedRow, setExpandedRow] = useState(null);

    // Edit State
    const [editingTxId, setEditingTxId] = useState(null);
    const [editForm, setEditForm] = useState({ amount_paid: '', payment_date: '', remarks: '' });

    if (!citizen) return null;

    // --- 1. Flatten Data ---
    let allRecords = [];
    const processDocs = (vehicle, docs, type, label) => {
        docs.forEach(doc => {
            const bill = parseFloat(doc.total_amount || 0);
            const paidTotal = doc.transactions?.reduce((sum, tr) => sum + parseFloat(tr.amount_paid), 0) || 0;
            const balance = bill - paidTotal;

            if (bill >= 0) {
                allRecords.push({
                    id: `${type}-${doc.id}`,
                    vehicle: vehicle.registration_no,
                    type: label,
                    date: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-GB') : '-',
                    bill,
                    paid: paidTotal,
                    balance,
                    status: balance <= 0 ? 'Paid' : 'Pending',
                    transactions: doc.transactions || []
                });
            }
        });
    };

    citizen.vehicles.forEach(v => {
        processDocs(v, v.taxes, 'tax', 'Tax');
        processDocs(v, v.insurances, 'insurance', 'Insurance');
        processDocs(v, v.fitnesses, 'fitness', 'Fitness');
        processDocs(v, v.permits, 'permit', 'Permit');
        processDocs(v, v.puccs, 'pucc', 'PUCC');
        processDocs(v, v.speed_governors, 'speed_gov', 'Speed Gov');
        processDocs(v, v.vltds, 'vltd', 'VLTd');
    });

    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalBill = allRecords.reduce((sum, r) => sum + r.bill, 0);
    const totalPaid = allRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalBalance = totalBill - totalPaid;

    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

    // --- Actions ---
    const startEdit = (tx) => {
        setEditingTxId(tx.id);
        setEditForm({
            amount_paid: tx.amount_paid,
            payment_date: tx.payment_date,
            remarks: tx.remarks || ''
        });
    };

    const cancelEdit = () => setEditingTxId(null);

    const saveEdit = async (id) => {
        try {
            await api.put(`/api/transactions/${id}`, editForm);
            setEditingTxId(null);
            if(refreshData) refreshData(); // Reload parent data to update UI
        } catch (err) {
            alert("Failed to update");
        }
    };

    const deleteTx = async (id) => {
        if(!window.confirm("Delete this payment permanently?")) return;
        try {
            await api.delete(`/api/transactions/${id}`);
            if(refreshData) refreshData();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>Account Statement: <span className="fw-bold text-primary">{citizen.name}</span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-between p-3 mb-3 border rounded bg-white shadow-sm">
                    <div className="text-center"><small className="text-muted">Total Billed</small><h4 className="text-primary">₹{totalBill.toLocaleString()}</h4></div>
                    <div className="text-center border-start border-end px-4"><small className="text-muted">Total Paid</small><h4 className="text-success">₹{totalPaid.toLocaleString()}</h4></div>
                    <div className="text-center"><small className="text-muted">Outstanding Balance</small><h4 className={totalBalance > 0 ? "text-danger fw-bold" : "text-success"}>₹{totalBalance.toLocaleString()}</h4></div>
                </div>

                {allRecords.length === 0 ? <Alert variant="info" className="text-center">No records found.</Alert> : (
                    <div className="table-responsive">
                        <Table striped hover bordered size="sm" className="align-middle">
                            <thead className="table-dark text-center">
                                <tr><th style={{width: '40px'}}></th><th>Date</th><th>Vehicle</th><th>Service</th><th>Bill Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr>
                            </thead>
                            <tbody className="text-center">
                                {allRecords.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <tr onClick={() => toggleRow(row.id)} style={{cursor: 'pointer'}} className={expandedRow === row.id ? "table-active" : ""}>
                                            <td>{row.transactions.length > 0 ? (expandedRow === row.id ? <FaChevronUp /> : <FaChevronDown />) : null}</td>
                                            <td>{row.date}</td><td className="fw-bold">{row.vehicle}</td><td>{row.type}</td><td>₹{row.bill}</td><td className="text-success">₹{row.paid}</td>
                                            <td className={row.balance > 0 ? "fw-bold text-danger" : "text-muted"}>₹{row.balance}</td>
                                            <td><Badge bg={row.status === 'Paid' ? 'success' : 'warning'} text="dark">{row.status}</Badge></td>
                                        </tr>

                                        {expandedRow === row.id && row.transactions.length > 0 && (
                                            <tr>
                                                <td colSpan="8" className="p-0">
                                                    <Card className="border-0 m-2 bg-light">
                                                        <Card.Body className="p-2">
                                                            <Table size="sm" className="mb-0" style={{fontSize: '0.9rem'}}>
                                                                <thead><tr><th>Date</th><th>Amount Paid</th><th>Remarks</th><th className="text-end">Actions</th></tr></thead>
                                                                <tbody>
                                                                    {row.transactions.map((tx) => (
                                                                        <tr key={tx.id}>
                                                                            {editingTxId === tx.id ? (
                                                                                // --- EDIT MODE ---
                                                                                <>
                                                                                    <td><Form.Control type="date" size="sm" value={editForm.payment_date} onChange={e => setEditForm({...editForm, payment_date: e.target.value})} /></td>
                                                                                    <td><Form.Control type="number" size="sm" value={editForm.amount_paid} onChange={e => setEditForm({...editForm, amount_paid: e.target.value})} /></td>
                                                                                    <td><Form.Control size="sm" value={editForm.remarks} onChange={e => setEditForm({...editForm, remarks: e.target.value})} /></td>
                                                                                    <td className="text-end">
                                                                                        <Button size="sm" variant="success" className="me-1" onClick={() => saveEdit(tx.id)}><FaSave/></Button>
                                                                                        <Button size="sm" variant="secondary" onClick={cancelEdit}><FaTimes/></Button>
                                                                                    </td>
                                                                                </>
                                                                            ) : (
                                                                                // --- VIEW MODE ---
                                                                                <>
                                                                                    <td>{new Date(tx.payment_date).toLocaleDateString('en-GB')}</td>
                                                                                    <td className="fw-bold text-success">₹{tx.amount_paid}</td>
                                                                                    <td className="text-muted">{tx.remarks || '-'}</td>
                                                                                    <td className="text-end">
                                                                                        <Button size="sm" variant="outline-primary" className="me-1 py-0 px-2" onClick={(e) => { e.stopPropagation(); startEdit(tx); }}><FaEdit/></Button>
                                                                                        <Button size="sm" variant="outline-danger" className="py-0 px-2" onClick={(e) => { e.stopPropagation(); deleteTx(tx.id); }}><FaTrash/></Button>
                                                                                    </td>
                                                                                </>
                                                                            )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </Card.Body>
                                                    </Card>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer><Button variant="secondary" onClick={handleClose}>Close</Button></Modal.Footer>
        </Modal>
    );
}

export default LedgerModal;
