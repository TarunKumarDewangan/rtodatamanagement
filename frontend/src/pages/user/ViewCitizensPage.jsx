import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import api from '../../api';
import { Link, useSearchParams } from 'react-router-dom';

function ViewCitizensPage() {
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hook to read URL params (e.g. ?search=CG04)
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search') || '';

    useEffect(() => {
        const fetchCitizens = async () => {
            setLoading(true);
            try {
                // Pass the search query to the backend
                const endpoint = query
                    ? `/api/citizens?search=${query}`
                    : '/api/citizens';

                const { data } = await api.get(endpoint);
                setCitizens(data);
            } catch (err) {
                console.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchCitizens();
    }, [query]); // Re-run whenever the URL search query changes

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0 text-primary">Citizen Records</h4>
                        {query && <small className="text-muted">Showing results for: <strong>"{query}"</strong></small>}
                    </div>
                    <Link to="/create-citizen" className="btn btn-success">+ Add New</Link>
                </Card.Header>
                <Card.Body>
                    {loading ? <div className="text-center py-4"><Spinner animation="border" /></div> : (
                        <Table responsive hover striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Location</th>
                                    <th>Vehicles</th> {/* New Column */}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {citizens.map((c, index) => (
                                    <tr key={c.id} className="align-middle">
                                        <td>{index + 1}</td>
                                        <td className="fw-bold">{c.name}</td>
                                        <td>{c.mobile_number}</td>
                                        <td>{c.city_district}</td>
                                        <td>
                                            {/* Show Vehicle Numbers to confirm search works */}
                                            {c.vehicles?.map(v => (
                                                <Badge bg="secondary" className="me-1" key={v.id}>{v.registration_no}</Badge>
                                            ))}
                                        </td>
                                        <td>
                                            <Link to={`/citizens/${c.id}`} className="btn btn-sm btn-primary">
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {citizens.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted py-4">No records found.</td></tr>
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
