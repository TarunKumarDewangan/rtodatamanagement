import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaDownload, FaCheckDouble, FaFileCsv } from 'react-icons/fa';

function BackupPage() {
    // Added 'citizen', 'vehicle', and 'master'
    const [selection, setSelection] = useState({
        citizen: true,
        vehicle: true,
        master: true, // <--- The Big Combined File
        tax: true,
        insurance: true,
        fitness: true,
        permit: true,
        pucc: true,
        speed_gov: true,
        vltd: true
    });

    const handleToggle = (key) => {
        setSelection(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectAll = () => {
        const allSelected = Object.values(selection).every(v => v);
        const newState = {};
        Object.keys(selection).forEach(k => newState[k] = !allSelected);
        setSelection(newState);
    };

    const handleDownload = () => {
        const activeKeys = Object.keys(selection).filter(k => selection[k]);

        if (activeKeys.length === 0) {
            alert("Please select at least one file.");
            return;
        }

        const queryString = activeKeys.join(',');
        // Triggers download of .zip file
        window.open(`http://localhost:8000/api/export/backup?include=${queryString}`, '_blank');
    };

    return (
        <Container className="py-5" style={{maxWidth: '900px'}}>
            <Card className="shadow-sm">
                <Card.Header className="bg-white py-3 border-bottom">
                    <h4 className="mb-0 text-primary">Download Data Backup</h4>
                </Card.Header>
                <Card.Body className="p-4">
                    <Alert variant="info">
                        The system will generate a <strong>.ZIP</strong> file containing separate CSV files for each selection below.
                    </Alert>

                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
                            <FaCheckDouble /> Toggle All
                        </Button>
                    </div>

                    <Row className="g-3">
                        {/* Master File Highlighted */}
                        <Col md={12}>
                            <div
                                className={`border rounded p-3 d-flex align-items-center bg-light border-primary`}
                                onClick={() => handleToggle('master')}
                                style={{cursor: 'pointer'}}
                            >
                                <Form.Check type="checkbox" checked={selection.master} onChange={()=>{}} className="me-3 fs-5" />
                                <div>
                                    <div className="fw-bold text-primary">MASTER COMBINED RECORD</div>
                                    <small className="text-muted">Contains all Citizens, Vehicles, and Documents in one big sheet.</small>
                                </div>
                            </div>
                        </Col>

                        {/* Individual Tables */}
                        {Object.keys(selection).filter(k => k !== 'master').map((key) => (
                            <Col md={6} key={key}>
                                <div
                                    className={`border rounded p-3 d-flex align-items-center h-100 ${selection[key] ? 'border-success bg-success-subtle' : ''}`}
                                    onClick={() => handleToggle(key)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <Form.Check type="checkbox" checked={selection[key]} onChange={()=>{}} className="me-3 fs-5" />
                                    <div className="d-flex align-items-center">
                                        <FaFileCsv className="me-2 text-secondary" />
                                        <span className="fw-bold text-uppercase">{key.replace('_', ' ')} Table</span>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <hr className="my-4" />

                    <div className="text-center">
                        <Button variant="success" size="lg" onClick={handleDownload} className="px-5 shadow">
                            <FaDownload className="me-2" /> Download Backup (.ZIP)
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default BackupPage;
