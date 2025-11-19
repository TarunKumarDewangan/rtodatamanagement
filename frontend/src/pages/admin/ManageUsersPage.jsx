import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import api from '../../api';

function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/admin/users');
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/admin/users', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', password_confirmation: '' });
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create user.");
        }
    };

    const toggleStatus = async (user) => {
        try {
            await api.put(`/api/admin/users/${user.id}/status`);
            fetchUsers();
        } catch (err) {
            alert("Failed to change status");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>User List</h4>
                <Button variant="success" onClick={() => setShowModal(true)}>+ Create User</Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="align-middle">
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <Badge bg={u.status === 'active' ? 'success' : 'secondary'}>
                                                {u.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => toggleStatus(u)}>
                                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button size="sm" variant="outline-danger" onClick={() => deleteUser(u.id)}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan="4" className="text-center">No users found.</td></tr>}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Create User Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add New User</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" required onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create User</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default ManageUsersPage;
