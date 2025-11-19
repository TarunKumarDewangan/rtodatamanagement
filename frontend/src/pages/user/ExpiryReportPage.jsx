import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Spinner, Badge, Pagination } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

function ExpiryReportPage() {
    const [filters, setFilters] = useState({
        owner_name: '',
        vehicle_no: '',
        doc_type: '',
        expiry_from: '',
        expiry_upto: ''
    });

    const [results, setResults] = useState(null); // Pagination Object
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchReport = async (pageNo = 1) => {
        setLoading(true);
        try {
            // Convert filters to query string
            const params = new URLSearchParams({ ...filters, page: pageNo });

            // Remove empty keys
            for (const [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }

            const { data } = await api.get(`/api/reports/expiry?${params.toString()}`);
            setResults(data);
            setPage(pageNo);
        } catch (err) {
            console.error("Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => { fetchReport(1); }, []);

    const handleFilterChange = (e) => {
        setFilters({...filters, [e.target.name]: e.target.value});
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport(1); // Reset to page 1 on new search
    };

    const handleReset = () => {
        setFilters({ owner_name: '', vehicle_no: '', doc_type: '', expiry_from: '', expiry_upto: '' });
        setPage(1);
        // We can optionally trigger fetchReport(1) here or let user click Search
    };

    // Helper for Badge Colors
    const getTypeColor = (type) => {
        switch(type) {
            case 'Tax': return 'primary';
            case 'Insurance': return 'success';
            case 'Fitness': return 'info';
            case 'PUCC': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <Container className="py-4">
            <h3 className="mb-4">Expiry Report</h3>

            {/* 1. Filter Card */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white fw-bold">Filters</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label>Owner Name</Form.Label>
                                <Form.Control name="owner_name" value={filters.owner_name} onChange={handleFilterChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Vehicle No</Form.Label>
                                <Form.Control name="vehicle_no" value={filters.vehicle_no} onChange={handleFilterChange} placeholder="e.g. CG04..." />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Doc Type</Form.Label>
                                <Form.Select name="doc_type" value={filters.doc_type} onChange={handleFilterChange}>
                                    <option value="">All</option>
                                    <option value="Tax">Tax</option>
                                    <option value="Insurance">Insurance</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Permit">Permit</option>
                                    <option value="PUCC">PUCC</option>
                                    <option value="Speed Gov">Speed Gov</option>
                                    <option value="VLTd">VLTd</option>
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label>From Date</Form.Label>
                                <Form.Control type="date" name="expiry_from" value={filters.expiry_from} onChange={handleFilterChange} />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Upto Date</Form.Label>
                                <Form.Control type="date" name="expiry_upto" value={filters.expiry_upto} onChange={handleFilterChange} />
                            </Col>
                        </Row>
                        <div className="mt-3 d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={handleReset}>Reset</Button>
                            <Button variant="primary" type="submit">Search Records</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* 2. Results Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                        <>
                            <Table responsive hover striped className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Owner</th>
                                        <th>Mobile</th>
                                        <th>Vehicle No</th>
                                        <th>Doc Type</th>
                                        <th>Expiry Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results?.data?.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-bold">{row.owner_name}</td>
                                            <td>{row.mobile_number}</td>
                                            <td>{row.vehicle_no}</td>
                                            <td>
                                                <Badge bg={getTypeColor(row.doc_type)}>{row.doc_type}</Badge>
                                            </td>
                                            <td className={new Date(row.expiry_date) < new Date() ? 'text-danger fw-bold' : ''}>
                                                {new Date(row.expiry_date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td>
                                                <Link to={`/citizens/${row.citizen_id}`} className="btn btn-sm btn-outline-primary">
                                                    View Profile
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {results?.data?.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-3">No records found matching filters.</td></tr>
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination Controls */}
                            {results && results.last_page > 1 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <Pagination>
                                        <Pagination.First onClick={() => fetchReport(1)} disabled={page === 1} />
                                        <Pagination.Prev onClick={() => fetchReport(page - 1)} disabled={page === 1} />
                                        <Pagination.Item active>{page}</Pagination.Item>
                                        <Pagination.Next onClick={() => fetchReport(page + 1)} disabled={page === results.last_page} />
                                        <Pagination.Last onClick={() => fetchReport(results.last_page)} disabled={page === results.last_page} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ExpiryReportPage;
