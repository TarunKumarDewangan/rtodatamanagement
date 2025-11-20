import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';
import api from '../../api';

function CitizenLedgerPage() {
    const { id } = useParams();
    const [citizen, setCitizen] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data
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

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (!citizen) return <Alert variant="danger" className="mt-5">Citizen not found.</Alert>;

    // --- Process Data (Flattening Logic) ---
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

    // Sort by date
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Totals
    const totalBill = allRecords.reduce((sum, r) => sum + r.bill, 0);
    const totalPaid = allRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalBalance = totalBill - totalPaid;

    return (
        <Container className="py-4 bg-white" style={{maxWidth: '1000px'}}>

            {/* HEADER - Visible on Print */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                    <h2 className="fw-bold text-primary">Account Statement</h2>
                    <h5 className="mb-0">{citizen.name}</h5>
                    <small className="text-muted">Mobile: {citizen.mobile_number}</small><br/>
                    <small className="text-muted">Address: {citizen.city_district}, {citizen.state}</small>
                </div>
                <div className="text-end no-print">
                    <Button variant="outline-secondary" className="me-2" as={Link} to={`/citizens/${id}`}>
                        <FaArrowLeft /> Back
                    </Button>
                    <Button variant="primary" onClick={() => window.print()}>
                        <FaPrint /> Print Statement
                    </Button>
                </div>
                {/* Date for Print */}
                <div className="d-none d-print-block text-end">
                    <small>Date: {new Date().toLocaleDateString('en-GB')}</small>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <Row className="mb-4 text-center">
                <Col md={4}>
                    <Card className="bg-light border-0">
                        <Card.Body>
                            <small className="text-muted text-uppercase fw-bold">Total Billed</small>
                            <h3 className="text-primary mb-0">₹{totalBill.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="bg-light border-0">
                        <Card.Body>
                            <small className="text-muted text-uppercase fw-bold">Total Paid</small>
                            <h3 className="text-success mb-0">₹{totalPaid.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className={totalBalance > 0 ? "bg-danger-subtle border-0" : "bg-success-subtle border-0"}>
                        <Card.Body>
                            <small className="text-muted text-uppercase fw-bold">Balance Due</small>
                            <h3 className={totalBalance > 0 ? "text-danger mb-0" : "text-success mb-0"}>
                                ₹{totalBalance.toLocaleString()}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* MAIN TABLE */}
            <Table bordered hover size="sm" className="mb-0">
                <thead className="table-dark">
                    <tr className="text-center">
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Service</th>
                        <th className="text-end">Bill Amount</th>
                        <th className="text-end">Paid</th>
                        <th className="text-end">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {allRecords.map((row, idx) => (
                        <React.Fragment key={idx}>
                            {/* Main Row */}
                            <tr className="align-middle text-center table-light fw-bold">
                                <td>{row.date}</td>
                                <td>{row.vehicle}</td>
                                <td>{row.type}</td>
                                <td className="text-end">₹{row.bill}</td>
                                <td className="text-end">₹{row.paid}</td>
                                <td className={`text-end ${row.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                    ₹{row.balance}
                                </td>
                            </tr>
                            {/* Transactions Sub-Rows (Printed as details) */}
                            {row.transactions.length > 0 ? (
                                row.transactions.map((tx, i) => (
                                    <tr key={i} style={{fontSize: '0.85rem'}} className="bg-white">
                                        <td colSpan="2" className="text-end text-muted fst-italic border-0">
                                            ↳ Payment Received ({new Date(tx.payment_date).toLocaleDateString('en-GB')}):
                                        </td>
                                        <td colSpan="2" className="text-start text-muted border-0">
                                            {tx.remarks || 'Cash/Online'}
                                        </td>
                                        <td className="text-end text-success border-0">
                                            - ₹{parseFloat(tx.amount_paid)}
                                        </td>
                                        <td className="border-0"></td>
                                    </tr>
                                ))
                            ) : (
                                // If unpaid, maybe show a "Pending" note line
                                row.balance > 0 && (
                                    <tr style={{fontSize: '0.85rem'}}>
                                        <td colSpan="6" className="text-center text-danger fst-italic bg-white border-0">
                                            (Payment Pending)
                                        </td>
                                    </tr>
                                )
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>

            {/* Footer Signature Area for Print */}
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
