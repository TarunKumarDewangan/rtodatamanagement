import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../../api';

function PaymentModal({ show, handleClose, docType, docId, refreshData }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/transactions', {
                payable_type: docType, // e.g. 'tax', 'insurance'
                payable_id: docId,
                amount_paid: amount,
                payment_date: date,
                remarks: remarks
            });
            await refreshData(); // Refresh the parent list to show updated balance
            handleClose();
            setAmount('');
            setRemarks('');
        } catch (err) {
            setError("Failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Add Payment</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Amount (₹)</Form.Label>
                        <Form.Control
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Remarks (Optional)</Form.Label>
                        <Form.Control
                            placeholder="e.g. Cash, UPI"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm"/> : 'Save Payment'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default PaymentModal;
