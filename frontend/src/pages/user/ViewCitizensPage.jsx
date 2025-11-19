import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Spinner, Form } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

function ViewCitizensPage() {
    const [citizens, setCitizens] = useState([]);
    const [filteredCitizens, setFilteredCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCitizens = async () => {
            try {
                const { data } = await api.get('/api/citizens');
                setCitizens(data);
                setFilteredCitizens(data);
            } catch (err) {
                console.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchCitizens();
    }, []);

    // Simple Frontend Filter
    useEffect(() => {
        const result = citizens.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.mobile_number.includes(search)
        );
        setFilteredCitizens(result);
    }, [search, citizens]);

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Citizen Records</h4>
                    <Link to="/create-citizen" className="btn btn-success">+ Add New</Link>
                </Card.Header>
                <Card.Body>
                    <Form.Control
                        type="text"
                        placeholder="Search by Name or Mobile..."
                        className="mb-3"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                        <Table responsive hover striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCitizens.map((c, index) => (
                                    <tr key={c.id} className="align-middle">
                                        <td>{index + 1}</td>
                                        <td className="fw-bold">{c.name}</td>
                                        <td>{c.mobile_number}</td>
                                        <td>{c.city_district}</td>
                                        <td>
                                            <Link to={`/citizens/${c.id}`} className="btn btn-sm btn-primary">
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCitizens.length === 0 && (
                                    <tr><td colSpan="5" className="text-center">No records found.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ViewCitizensPage;
