import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import api from '../../api';

function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const initialForm = { id: null, name: '', email: '', password: '', password_confirmation: '', whatsapp_key: '', whatsapp_host: '' };
    const [formData, setFormData] = useState(initialForm);
    const [isEdit, setIsEdit] = useState(false);

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

    const handleOpenCreate = () => {
        setFormData(initialForm);
        setIsEdit(false);
        setShowModal(true);
    };

    const handleOpenEdit = (user) => {
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '', // Leave blank
            password_confirmation: '',
            whatsapp_key: user.whatsapp_key || '',
            whatsapp_host: user.whatsapp_host || ''
        });
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isEdit) {
                await api.put(`/api/admin/users/${formData.id}`, formData);
            } else {
                await api.post('/api/admin/users', formData);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save user.");
        }
    };

    const toggleStatus = async (user) => {
        try { await api.put(`/api/admin/users/${user.id}/status`); fetchUsers(); } catch (err) { alert("Failed"); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try { await api.delete(`/api/admin/users/${id}`); fetchUsers(); } catch (err) { alert("Failed"); }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>User List</h4>
                <Button variant="success" onClick={handleOpenCreate}>+ Create User</Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body>
                    {loading ? <Spinner animation="border" /> : (
                        <Table hover responsive className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>WA Config</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.whatsapp_key ? <Badge bg="info">Configured</Badge> : <span className="text-muted small">Default</span>}
                                        </td>
                                        <td>
                                            <Badge bg={u.status === 'active' ? 'success' : 'secondary'}>{u.status}</Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button size="sm" variant="primary" className="me-2" onClick={() => handleOpenEdit(u)}>Edit</Button>
                                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => toggleStatus(u)}>
                                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button size="sm" variant="outline-danger" onClick={() => deleteUser(u.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>{isEdit ? 'Edit User' : 'Add New User'}</Modal.Title></Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </Form.Group>

                        <hr />
                        <h6 className="text-muted">WhatsApp Configuration (Optional)</h6>
                        <Form.Group className="mb-2">
                            <Form.Label>API Key</Form.Label>
                            <Form.Control placeholder="Leave empty to use System Default" value={formData.whatsapp_key} onChange={e => setFormData({...formData, whatsapp_key: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>API Host</Form.Label>
                            <Form.Control placeholder="e.g. api.iconicsolution.co.in" value={formData.whatsapp_host} onChange={e => setFormData({...formData, whatsapp_host: e.target.value})} />
                        </Form.Group>
                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label>{isEdit ? 'New Password (Optional)' : 'Password'}</Form.Label>
                            <Form.Control type="password" required={!isEdit} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" required={!isEdit} value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEdit ? 'Update User' : 'Create User'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default ManageUsersPage;
