import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Row, Col, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../api';

function CitizenLedgerPage() {
    const { id } = useParams();
    const [citizen, setCitizen] = useState(null);
    const [loading, setLoading] = useState(true);

    // Printing State
    const [selectedIds, setSelectedIds] = useState([]); // Stores IDs of selected rows

    // Editing State
    const [editingTxId, setEditingTxId] = useState(null);
    const [editForm, setEditForm] = useState({ amount_paid: '', payment_date: '', remarks: '' });

    const fetchCitizen = async () => {
        try {
            const { data } = await api.get(`/api/citizens/${id}`);
            setCitizen(data);
        } catch (err) {
            console.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCitizen(); }, [id]);

    // --- Flatten Data Logic ---
    let allRecords = [];
    if (citizen) {
        const processDocs = (vehicle, docs, type, label) => {
            docs.forEach(doc => {
                const bill = parseFloat(doc.total_amount || 0);
                const paidTotal = doc.transactions?.reduce((sum, tr) => sum + parseFloat(tr.amount_paid), 0) || 0;
                const balance = bill - paidTotal;

                if (bill >= 0) {
                    allRecords.push({
                        uniqueKey: `${type}-${doc.id}`, // Unique ID for Selection
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
    }

    // --- Selection Logic ---
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(allRecords.map(r => r.uniqueKey));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelectRow = (key) => {
        if (selectedIds.includes(key)) {
            setSelectedIds(selectedIds.filter(id => id !== key));
        } else {
            setSelectedIds([...selectedIds, key]);
        }
    };

    // --- Edit Transaction Logic ---
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
            fetchCitizen(); // Refresh
        } catch (err) { alert("Failed to update"); }
    };

    const deleteTx = async (id) => {
        if(!window.confirm("Delete this payment?")) return;
        try { await api.delete(`/api/transactions/${id}`); fetchCitizen(); } catch (err) { alert("Failed to delete"); }
    };

    // --- Render ---
    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (!citizen) return <Alert variant="danger" className="mt-5">Citizen not found.</Alert>;

    // Calculate Totals based on SELECTION (if printing) or ALL (if viewing)
    // Note: For the summary cards, we usually show total. For printing, we might want selected total.
    const displayedRecords = allRecords; // We show all, but hide unselected during print via CSS class

    const totalBill = allRecords.reduce((sum, r) => sum + r.bill, 0);
    const totalPaid = allRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalBalance = totalBill - totalPaid;

    return (
        <Container className="py-4 bg-white" style={{maxWidth: '1000px'}}>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                    <h2 className="fw-bold text-primary">Account Statement</h2>
                    <h5 className="mb-0">{citizen.name}</h5>
                    <small className="text-muted">Mobile: {citizen.mobile_number}</small>
                </div>
                <div className="text-end no-print">
                    <Button variant="outline-secondary" className="me-2" as={Link} to={`/citizens/${id}`}>
                        <FaArrowLeft /> Back
                    </Button>
                    <Button variant="primary" onClick={() => window.print()} disabled={selectedIds.length === 0}>
                        <FaPrint /> Print Selected
                    </Button>
                </div>
                <div className="d-none d-print-block text-end">
                    <small>Date: {new Date().toLocaleDateString('en-GB')}</small>
                </div>
            </div>

            {/* SUMMARY */}
            <Row className="mb-4 text-center">
                <Col md={4}><Card className="bg-light border-0"><Card.Body><small className="text-muted fw-bold">TOTAL BILLED</small><h3 className="text-primary mb-0">₹{totalBill.toLocaleString()}</h3></Card.Body></Card></Col>
                <Col md={4}><Card className="bg-light border-0"><Card.Body><small className="text-muted fw-bold">TOTAL PAID</small><h3 className="text-success mb-0">₹{totalPaid.toLocaleString()}</h3></Card.Body></Card></Col>
                <Col md={4}><Card className={totalBalance > 0 ? "bg-danger-subtle border-0" : "bg-success-subtle border-0"}><Card.Body><small className="text-muted fw-bold">BALANCE DUE</small><h3 className={totalBalance > 0 ? "text-danger mb-0" : "text-success mb-0"}>₹{totalBalance.toLocaleString()}</h3></Card.Body></Card></Col>
            </Row>

            {/* TABLE */}
            <Table bordered hover size="sm" className="mb-0">
                <thead className="table-dark text-center">
                    <tr>
                        <th className="no-print" style={{width: '40px'}}>
                            <Form.Check
                                type="checkbox"
                                onChange={toggleSelectAll}
                                checked={selectedIds.length === allRecords.length && allRecords.length > 0}
                            />
                        </th>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Service</th>
                        <th className="text-end">Bill Amount</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Balance</th>
                    </tr>
                </thead>
              <tbody>
                    {allRecords.map((row, idx) => {
                        const isSelected = selectedIds.includes(row.uniqueKey);
                        return (
                            <React.Fragment key={idx}>
                                {/* Main Row */}
                                <tr className={`align-middle text-center table-light fw-bold ${isSelected ? '' : 'd-print-none'}`}>
                                    <td className="no-print">
                                        <Form.Check
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectRow(row.uniqueKey)}
                                        />
                                    </td>
                                    <td>{row.date}</td>
                                    <td>{row.vehicle}</td>
                                    <td>{row.type}</td>
                                    <td className="text-end">₹{row.bill}</td>
                                    <td className="text-end">₹{row.paid}</td>
                                    <td className={`text-end ${row.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                        ₹{row.balance}
                                    </td>
                                </tr>

                                {/* Payment Details Row */}
                                {(isSelected || window.matchMedia('print').matches === false) && row.transactions.length > 0 ? (
                                    row.transactions.map((tx, i) => (
                                        <tr key={tx.id} className={`bg-white ${isSelected ? '' : 'd-print-none'}`} style={{fontSize: '0.85rem'}}>
                                            <td className="no-print border-0"></td>

                                            {/* Label Cell */}
                                            <td colSpan="2" className="text-end text-muted fst-italic border-0 align-middle">
                                                ↳ Recv ({new Date(tx.payment_date).toLocaleDateString('en-GB')}):
                                            </td>

                                            {/* Remarks & Amount Area */}
                                            {editingTxId === tx.id ? (
                                                // --- EDIT MODE ---
                                                <>
                                                    <td colSpan="2" className="border-0 p-1">
                                                        <Form.Control
                                                            size="sm"
                                                            value={editForm.remarks}
                                                            placeholder="Remarks"
                                                            onChange={e => setEditForm({...editForm, remarks: e.target.value})}
                                                        />
                                                    </td>
                                                    <td className="border-0 p-1">
                                                        <Form.Control
                                                            size="sm"
                                                            type="number"
                                                            value={editForm.amount_paid}
                                                            className="text-end"
                                                            onChange={e => setEditForm({...editForm, amount_paid: e.target.value})}
                                                        />
                                                    </td>
                                                    <td className="no-print border-0 text-center p-1">
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            <Button size="sm" variant="success" className="py-0 px-2" onClick={() => saveEdit(tx.id)}><FaSave /></Button>
                                                            <Button size="sm" variant="secondary" className="py-0 px-2" onClick={cancelEdit}><FaTimes /></Button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                // --- VIEW MODE ---
                                                <>
                                                    <td colSpan="2" className="text-start text-muted border-0 align-middle">
                                                        {tx.remarks || 'Cash/Online'}
                                                    </td>
                                                    <td className="text-end text-success border-0 fw-bold align-middle">
                                                        - ₹{parseFloat(tx.amount_paid)}
                                                    </td>
                                                    <td className="no-print border-0 text-center align-middle">
                                                        <div className="d-flex gap-2 justify-content-end">
                                                            <FaEdit className="text-primary" style={{cursor:'pointer'}} onClick={() => startEdit(tx)} />
                                                            <FaTrash className="text-danger" style={{cursor:'pointer'}} onClick={() => deleteTx(tx.id)} />
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Table>

            {/* Footer Signature for Print */}
            <div className="d-none d-print-block mt-5 pt-5">
                <div className="d-flex justify-content-between">
                    <div className="border-top pt-2" style={{width: '200px', textAlign: 'center'}}>Customer Signature</div>
                    <div className="border-top pt-2" style={{width: '200px', textAlign: 'center'}}>Authorized Signatory</div>
                </div>
            </div>

        </Container>
    );
}

export default CitizenLedgerPage;
