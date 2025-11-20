import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

// --- Import Modals ---
import VehicleModal from '../../components/VehicleModal';
import TaxModal from '../../components/modals/TaxModal';
import InsuranceModal from '../../components/modals/InsuranceModal';
import UniversalDocModal from '../../components/modals/UniversalDocModal';
import LedgerModal from '../../components/modals/LedgerModal'; // <--- NEW

// --- Helper: Calculate Status Badge ---
const getStatusBadge = (documents, dateField) => {
    const style = { fontSize: '0.7rem', padding: '4px 0', whiteSpace: 'nowrap' };

    if (!documents || documents.length === 0) {
        return <Badge bg="light" text="secondary" className="w-100 border fw-normal" style={style}>Missing</Badge>;
    }
    const latest = documents[0];
    const expiryDateStr = latest[dateField];
    if (!expiryDateStr) return <Badge bg="warning" text="dark" className="w-100" style={style}>No Date</Badge>;

    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (expiryDate < today) {
        return <Badge bg="danger" className="w-100" style={style}>{expiryDate.toLocaleDateString('en-GB')}</Badge>;
    }
    return <Badge bg="success" className="w-100" style={style}>{expiryDate.toLocaleDateString('en-GB')}</Badge>;
};

function CitizenProfilePage() {
    const { id } = useParams();
    const [citizen, setCitizen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Modal States ---
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showLedger, setShowLedger] = useState(false); // <--- NEW
    const [vehicleToEdit, setVehicleToEdit] = useState(null);
    const [activeDocModal, setActiveDocModal] = useState(null);
    const [activeVehicleId, setActiveVehicleId] = useState(null);

    const activeVehicle = citizen?.vehicles?.find(v => v.id === activeVehicleId) || null;

    const fetchCitizen = async () => {
        try {
            const { data } = await api.get(`/api/citizens/${id}`);
            setCitizen(data);
        } catch (err) {
            setError("Failed to load citizen profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCitizen(); }, [id]);

    const handleDeleteVehicle = async (vehicleId) => {
        if(!window.confirm("Are you sure? This will delete the vehicle and ALL its history.")) return;
        try {
            await api.delete(`/api/vehicles/${vehicleId}`);
            fetchCitizen();
        } catch(err) { alert("Failed to delete vehicle."); }
    };

    const openEditVehicle = (vehicle) => {
        setVehicleToEdit(vehicle);
        setShowVehicleModal(true);
    };

    const openAddVehicle = () => {
        setVehicleToEdit(null);
        setShowVehicleModal(true);
    };

    const openDocModal = (type, vehicleId) => {
        setActiveVehicleId(vehicleId);
        setActiveDocModal(type);
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
    if (!citizen) return <Container className="mt-5"><Alert variant="danger">Citizen Not Found</Alert></Container>;

    return (
        <Container className="py-3" style={{maxWidth: '1400px'}}>

            {/* 1. Header & Citizen Info */}
            <Card className="mb-4 shadow-sm border-0 bg-white">
                <Card.Body className="py-3 px-4">
                    <Row className="align-items-center g-3">
                        <Col xs={12} md={6}>
                            <h4 className="fw-bold text-primary mb-1">{citizen.name}</h4>
                            <div className="text-muted small">
                                <span className="me-3">📱 {citizen.mobile_number}</span>
                                <span>📍 {citizen.city_district || 'No Location'}</span>
                            </div>
                        </Col>
                        <Col xs={12} md={6} className="text-md-end d-flex gap-2 justify-content-md-end">
                            {/*<Button variant="primary" size="sm" onClick={() => setShowLedger(true)}>View Accounts</Button>  */}{/* <--- NEW BUTTON */}
                            <Link to={`/citizens/${id}/account`} className="btn btn-primary btn-sm">
                                 View Accounts
                            </Link>
                            <Button variant="success" size="sm" onClick={openAddVehicle}>+ Add Vehicle</Button>
                            <Link to="/view-citizens" className="btn btn-outline-secondary btn-sm">Back</Link>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* 2. Vehicles List */}
            {citizen.vehicles.length === 0 ? (
                <Alert variant="info" className="text-center p-4">No Vehicles Found. Click Add Vehicle.</Alert>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {citizen.vehicles.map(v => (
                        <Card key={v.id} className="shadow-sm border-0 overflow-hidden">
                            <Row className="g-0">
                                <Col xs={12} lg={2} className="bg-dark text-white p-3 d-flex flex-lg-column justify-content-between align-items-center text-center">
                                    <div className="d-flex flex-column align-items-center d-lg-block">
                                        <div className="fw-bold text-warning fs-5">{v.registration_no}</div>
                                        <Badge bg="secondary" className="mt-1">{v.type}</Badge>
                                    </div>
                                    <div className="d-flex gap-2 mt-lg-3">
                                        <Button variant="outline-light" size="sm" style={{fontSize: '0.7rem'}} onClick={() => openEditVehicle(v)}>Edit</Button>
                                        <Button variant="danger" size="sm" style={{fontSize: '0.7rem'}} onClick={() => handleDeleteVehicle(v.id)}>Del</Button>
                                    </div>
                                </Col>
                                <Col xs={12} lg={2} className="bg-light border-end p-2 d-flex flex-column justify-content-center small">
                                    <div className="d-flex justify-content-between px-2 py-1 border-bottom">
                                        <span className="text-muted">Make:</span> <strong>{v.make_model || '-'}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between px-2 py-1 border-bottom">
                                        <span className="text-muted">Chassis:</span> <strong>{v.chassis_no || '-'}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between px-2 py-1">
                                        <span className="text-muted">Engine:</span> <strong>{v.engine_no || '-'}</strong>
                                    </div>
                                </Col>
                                <Col xs={12} lg={8} className="p-3">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' }}>
                                        <DocumentCard label="Tax" data={v.taxes} dateField="upto_date" onClick={() => openDocModal('tax', v.id)} />
                                        <DocumentCard label="Ins" data={v.insurances} dateField="end_date" onClick={() => openDocModal('insurance', v.id)} />
                                        <DocumentCard label="Fit" data={v.fitnesses} dateField="expiry_date" onClick={() => openDocModal('fitness', v.id)} />
                                        <DocumentCard label="Pmt" data={v.permits} dateField="expiry_date" onClick={() => openDocModal('permit', v.id)} />
                                        <DocumentCard label="PUCC" data={v.puccs} dateField="valid_until" onClick={() => openDocModal('pucc', v.id)} />
                                        <DocumentCard label="Spd.Gov" data={v.speed_governors} dateField="expiry_date" onClick={() => openDocModal('speed_gov', v.id)} />
                                        <DocumentCard label="VLTd" data={v.vltds} dateField="expiry_date" onClick={() => openDocModal('vltd', v.id)} />
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>
            )}

            {/* --- MODALS --- */}
            <VehicleModal show={showVehicleModal} handleClose={() => setShowVehicleModal(false)} citizenId={id} vehicleToEdit={vehicleToEdit} refreshData={fetchCitizen} />

            <TaxModal show={activeDocModal === 'tax'} handleClose={() => setActiveDocModal(null)} vehicle={activeVehicle} refreshData={fetchCitizen} />
            <InsuranceModal show={activeDocModal === 'insurance'} handleClose={() => setActiveDocModal(null)} vehicle={activeVehicle} refreshData={fetchCitizen} />
            {['fitness', 'permit', 'pucc', 'speed_gov', 'vltd'].includes(activeDocModal) && (
                <UniversalDocModal show={true} handleClose={() => setActiveDocModal(null)} vehicle={activeVehicle} docType={activeDocModal} refreshData={fetchCitizen} />
            )}

            {/* --- LEDGER MODAL --- */}
            <LedgerModal show={showLedger} handleClose={() => setShowLedger(false)} citizen={citizen} refreshData={fetchCitizen} />

        </Container>
    );
}

// --- Document Card Component ---
const DocumentCard = ({ label, data, dateField, onClick }) => (
    <div
        onClick={onClick}
        className="border rounded p-1 text-center d-flex flex-column justify-content-center shadow-sm"
        style={{ cursor: 'pointer', backgroundColor: '#ffffff', minHeight: '60px', transition: 'transform 0.1s' }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
        <div className="fw-bold text-secondary mb-1" style={{fontSize: '0.65rem', textTransform: 'uppercase'}}>{label}</div>
        <div>{getStatusBadge(data, dateField)}</div>
    </div>
);

export default CitizenProfilePage;
