import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../api';

function AssignActivitiesPage() {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userActivities, setUserActivities] = useState([]); // IDs of active permissions
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [uRes, aRes] = await Promise.all([
                    api.get('/api/admin/users'),
                    api.get('/api/admin/activities')
                ]);
                setUsers(uRes.data);
                setActivities(aRes.data);
            } catch (err) {
                console.error("Error loading data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // When user selection changes, fetch their specific permissions
    const handleUserChange = async (userId) => {
        setSelectedUserId(userId);
        if (!userId) return;

        setLoading(true);
        try {
            const { data } = await api.get(`/api/admin/users/${userId}`);
            // Extract just the IDs for the checkboxes
            setUserActivities(data.activities.map(a => a.id));
        } catch (err) {
            console.error("Failed to fetch user details");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (activityId) => {
        setUserActivities(prev =>
            prev.includes(activityId)
                ? prev.filter(id => id !== activityId) // Remove
                : [...prev, activityId] // Add
        );
    };

    const handleSave = async () => {
        if (!selectedUserId) return;
        try {
            await api.post(`/api/admin/users/${selectedUserId}/activities`, {
                activity_ids: userActivities
            });
            setMessage({ type: 'success', text: 'Permissions updated successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to save.' });
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h4 className="mb-4">Assign User Permissions</h4>
                {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

                <Form.Group className="mb-4">
                    <Form.Label><strong>Select User:</strong></Form.Label>
                    <Form.Select value={selectedUserId} onChange={(e) => handleUserChange(e.target.value)}>
                        <option value="">-- Choose a user --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </Form.Select>
                </Form.Group>

                {selectedUserId && (
                    <>
                        <hr />
                        <h5>Permissions</h5>
                        {loading ? <Spinner animation="border" size="sm" /> : (
                            <Row className="mt-3">
                                {activities.map(act => (
                                    <Col md={6} key={act.id} className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id={`act-${act.id}`}
                                            label={act.description || act.name}
                                            checked={userActivities.includes(act.id)}
                                            onChange={() => handleToggle(act.id)}
                                            className="fs-5"
                                        />
                                        <small className="text-muted ms-4 d-block">{act.name}</small>
                                    </Col>
                                ))}
                            </Row>
                        )}
                        <div className="mt-4">
                            <Button variant="primary" onClick={handleSave} disabled={loading}>
                                Save Permissions
                            </Button>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default AssignActivitiesPage;
