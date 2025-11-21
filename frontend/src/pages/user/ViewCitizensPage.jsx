import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Spinner, Badge, Modal, Form, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import api from '../../api';
import { Link, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

function ViewCitizensPage() {
    const [citizens, setCitizens] = useState([]); // All data
    const [filteredCitizens, setFilteredCitizens] = useState([]); // Displayed data
    const [loading, setLoading] = useState(true);

    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search') || '';

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    const fetchCitizens = async () => {
        setLoading(true);
        try {
            // Load ALL citizens initially
            const { data } = await api.get('/api/citizens');
            setCitizens(data);

            // If URL has ?search=xxx, apply it immediately
            if (query) {
                setSearchTerm(query);
                applyFilter(data, query);
            } else {
                setFilteredCitizens(data);
            }
        } catch (err) {
            console.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCitizens(); }, []);

    // --- Filter Logic ---
    const applyFilter = (data, term) => {
        if (!term) {
            setFilteredCitizens(data);
            return;
        }
        const lowerTerm = term.toLowerCase();
        const result = data.filter(c =>
            c.name.toLowerCase().includes(lowerTerm) ||
            c.mobile_number.includes(lowerTerm) ||
            c.vehicles?.some(v => v.registration_no.toLowerCase().includes(lowerTerm))
        );
        setFilteredCitizens(result);
    };

    // Handle Typing in Search Box
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        applyFilter(citizens, term);
    };

    // --- Delete Logic ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete everything for this citizen.")) return;
        try {
            await api.delete(`/api/citizens/${id}`);
            const updated = citizens.filter(c => c.id !== id);
            setCitizens(updated);
            applyFilter(updated, searchTerm); // Re-apply current filter
        } catch (err) { alert("Failed to delete."); }
    };

    // --- Edit Logic ---
    const handleEditClick = (c) => {
        setEditData({...c});
        setShowEditModal(true);
        setEditError(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await api.put(`/api/citizens/${editData.id}`, editData);
            setShowEditModal(false);
            fetchCitizens(); // Reload full list
        } catch (err) { setEditError("Failed to update."); } finally { setEditLoading(false); }
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                    <h4 className="mb-0 text-primary">Citizen Records</h4>
                    <div className="d-flex gap-3">
                        {/* SEARCH BAR */}
                        <InputGroup style={{width: '300px'}}>
                            <InputGroup.Text className="bg-light border-end-0">
                                <FaSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search Name, Mobile, Vehicle..."
                                className="border-start-0 ps-0"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                        <Link to="/create-citizen" className="btn btn-success text-nowrap">+ Add New</Link>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                        <Table responsive hover striped className="align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">#</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Location</th>
                                    <th>Vehicles</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCitizens.map((c, index) => (
                                    <tr key={c.id}>
                                        <td className="ps-4">{index + 1}</td>
                                        <td>
                                            <Link to={`/citizens/${c.id}`} className="fw-bold text-decoration-none text-dark">
                                                {c.name}
                                            </Link>
                                            <div className="small text-muted">{c.relation_type} {c.relation_name}</div>
                                        </td>
                                        <td>{c.mobile_number}</td>
                                        <td>{c.city_district}</td>
                                        <td>
                                            {c.vehicles?.map(v => (
                                                <Badge bg="secondary" className="me-1 fw-normal" key={v.id}>{v.registration_no}</Badge>
                                            ))}
                                        </td>
                                        <td className="text-end pe-4">
                                            <Link to={`/citizens/${c.id}`} className="btn btn-sm btn-outline-primary me-1" title="View">
                                                <FaEye />
                                            </Link>
                                            <Button variant="outline-info" size="sm" className="me-1" onClick={() => handleEditClick(c)} title="Edit">
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.id)} title="Delete">
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCitizens.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted py-5">No matching records found.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* EDIT MODAL */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static">
                <Modal.Header closeButton><Modal.Title>Edit Citizen Details</Modal.Title></Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        {editError && <Alert variant="danger">{editError}</Alert>}
                        {editData && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} required />
                                </Form.Group>
                                <Row>
                                    <Col><Form.Group className="mb-3"><Form.Label>Mobile</Form.Label><Form.Control value={editData.mobile_number} onChange={(e) => setEditData({...editData, mobile_number: e.target.value})} required /></Form.Group></Col>
                                    <Col><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control value={editData.city_district || ''} onChange={(e) => setEditData({...editData, city_district: e.target.value})} /></Form.Group></Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Relation ({editData.relation_type})</Form.Label>
                                    <Form.Control value={editData.relation_name || ''} onChange={(e) => setEditData({...editData, relation_name: e.target.value})} />
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={editLoading}>{editLoading ? <Spinner size="sm" /> : "Save Changes"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default ViewCitizensPage;
