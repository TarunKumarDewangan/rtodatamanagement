import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../api';

const INITIAL_STATE = { registration_no: '', type: '', make_model: '', chassis_no: '', engine_no: '' };

function VehicleModal({ show, handleClose, citizenId, vehicleToEdit, refreshData }) {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load data if editing, else reset
    useEffect(() => {
        if (vehicleToEdit) {
            setFormData({
                registration_no: vehicleToEdit.registration_no,
                type: vehicleToEdit.type || '',
                make_model: vehicleToEdit.make_model || '',
                chassis_no: vehicleToEdit.chassis_no || '',
                engine_no: vehicleToEdit.engine_no || ''
            });
        } else {
            setFormData(INITIAL_STATE);
        }
        setError(null);
    }, [vehicleToEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (vehicleToEdit) {
                await api.put(`/api/vehicles/${vehicleToEdit.id}`, formData);
            } else {
                await api.post(`/api/citizens/${citizenId}/vehicles`, formData);
            }
            await refreshData(); // Reload the background page
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save vehicle.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>{vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Registration No *</Form.Label>
                        <Form.Control
                            value={formData.registration_no}
                            onChange={(e) => setFormData({...formData, registration_no: e.target.value.toUpperCase()})}
                            required
                        />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Vehicle Type</Form.Label>
                                <Form.Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option value="Motorcycle">Motorcycle</option>
                                    <option value="Car">Car</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Bus">Bus</option>
                                    <option value="Tractor">Tractor</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Make / Model</Form.Label>
                                <Form.Control value={formData.make_model} onChange={(e) => setFormData({...formData, make_model: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Chassis No</Form.Label>
                                <Form.Control value={formData.chassis_no} onChange={(e) => setFormData({...formData, chassis_no: e.target.value})} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Engine No</Form.Label>
                                <Form.Control value={formData.engine_no} onChange={(e) => setFormData({...formData, engine_no: e.target.value})} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border"/> : 'Save Vehicle'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default VehicleModal;
