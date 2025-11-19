import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect away from login page
    if (isAuthenticated && user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login({ email, password });
            // AuthContext updates 'user', triggering the redirect above automatically
        } catch (err) {
            // Handle Laravel Validation Errors or 401s
            if (err.response?.status === 422) {
                setError(err.response.data.message);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Login failed. Please check your server connection.");
            }
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }} className="shadow">
                <Card.Header className="bg-primary text-white text-center">
                    <h4>RTO System Login</h4>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging In...' : 'Login'}
                        </Button>
                    </Form>
                </Card.Body>
                <Card.Footer className="text-muted text-center small">
                    RTO Data Management v2.0
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default LoginPage;
