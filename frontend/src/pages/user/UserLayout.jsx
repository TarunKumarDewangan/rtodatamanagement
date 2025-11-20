import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Nav, Button, Form, InputGroup, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUser, FaCar } from 'react-icons/fa'; // npm install react-icons
import api from '../../api';

function UserLayout() {
    const { user, logout, hasActivity } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // --- Live Search States ---
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null); // To detect clicks outside

    // --- 1. Debounced Search Logic ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchText.length > 1) {
                setLoading(true);
                try {
                    const { data } = await api.get(`/api/citizens?search=${searchText}`);
                    setSuggestions(data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    // --- 2. Handle Click Outside (to close dropdown) ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    // --- 3. Handle Selection ---
    const handleSelectResult = (id) => {
        setSearchText('');
        setShowDropdown(false);
        navigate(`/citizens/${id}`);
    };

    const handleGlobalSearchSubmit = (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            setShowDropdown(false);
            navigate(`/view-citizens?search=${searchText}`);
        }
    };

    return (
        <>
            <Navbar bg="white" expand="lg" className="shadow-sm border-bottom mb-4 sticky-top">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/user" className="fw-bold text-primary me-4">
                        RTO Management
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="user-navbar" />
                    <Navbar.Collapse id="user-navbar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/user" active={location.pathname === '/user'}>Dashboard</Nav.Link>
                            {hasActivity('create_citizen') && (
                                <Nav.Link as={Link} to="/view-citizens" active={location.pathname.startsWith('/view-citizens')}>Citizens</Nav.Link>
                            )}
                            {hasActivity('view_reports') && (
                                <Nav.Link as={Link} to="/expiry-report" active={location.pathname === '/expiry-report'}>Expiry Reports</Nav.Link>
                            )}
                        </Nav>

                        {/* --- LIVE SEARCH BOX CONTAINER --- */}
                        <div className="position-relative me-4" style={{width: '350px'}} ref={searchRef}>
                            <Form onSubmit={handleGlobalSearchSubmit}>
                                <InputGroup>
                                    <Form.Control
                                        type="search"
                                        placeholder="Search Name, Mobile, Vehicle..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onFocus={() => { if(searchText.length > 1) setShowDropdown(true); }}
                                        style={{fontSize: '0.9rem'}}
                                    />
                                    <Button variant="primary" type="submit">
                                        <FaSearch />
                                    </Button>
                                </InputGroup>
                            </Form>

                            {/* --- DROPDOWN RESULTS --- */}
                            {showDropdown && (
                                <ListGroup className="position-absolute w-100 shadow mt-1 overflow-auto"
                                    style={{maxHeight: '300px', zIndex: 1050, backgroundColor: 'white', borderRadius: '5px'}}>

                                    {loading && <div className="text-center p-3 text-muted"><Spinner size="sm" /> Searching...</div>}

                                    {!loading && suggestions.length === 0 && (
                                        <div className="text-center p-3 text-muted small">No records found.</div>
                                    )}

                                    {!loading && suggestions.map((item) => (
                                        <ListGroup.Item
                                            key={item.id}
                                            action
                                            onClick={() => handleSelectResult(item.id)}
                                            className="border-0 border-bottom py-2"
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold text-dark small">
                                                        <FaUser className="me-1 text-secondary"/> {item.name}
                                                    </div>
                                                    <div className="text-muted smaller" style={{fontSize: '0.75rem'}}>
                                                        📱 {item.mobile_number}
                                                    </div>
                                                </div>
                                                {/* Show matched vehicles if any */}
                                                <div className="text-end">
                                                    {item.vehicles.slice(0, 2).map(v => (
                                                        <Badge bg="light" text="dark" className="d-block border mb-1" key={v.id} style={{fontSize: '0.65rem'}}>
                                                            <FaCar className="me-1 text-muted"/>{v.registration_no}
                                                        </Badge>
                                                    ))}
                                                    {item.vehicles.length > 2 && <small className="text-muted" style={{fontSize: '0.6rem'}}>+{item.vehicles.length - 2} more</small>}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                        {/* --------------------------------- */}

                        <div className="d-flex align-items-center border-start ps-3">
                            <div className="me-3 text-end" style={{lineHeight: '1.2'}}>
                                <div className="fw-bold text-dark small">Signed in as</div>
                                <div className="text-primary small">{user?.name}</div>
                            </div>
                            <Button variant="outline-danger" size="sm" onClick={logout}>Logout</Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container style={{ minHeight: '80vh' }}>
                <Outlet />
            </Container>

            <footer className="text-center py-4 text-muted small mt-auto">
                &copy; {new Date().getFullYear()} RTO Data Management System
            </footer>
        </>
    );
}

export default UserLayout;
