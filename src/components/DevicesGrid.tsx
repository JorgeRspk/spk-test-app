import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInfluxMeasurements, Measurement } from '@app/services/sensors';

const DevicesGrid: React.FC = () => {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                const data = await getInfluxMeasurements();
                setMeasurements(data);
            } catch (error) {
                console.error('Error al obtener dispositivos:', error);
                setError('No se pudieron cargar los dispositivos');
            } finally {
                setLoading(false);
            }
        };

        fetchMeasurements();
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="row">
            {measurements.map((device) => (
                <div key={device.measurements} className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out',
                        cursor: 'pointer'
                    }}>
                        <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 className="card-title text-primary mb-3">
                                    <i className="fas fa-microchip mr-2"></i>
                                    {device.measurements}
                                </h5>
                                <p className="card-text text-muted">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Haga clic para ver los datos en tiempo real
                                </p>
                            </div>
                            <div className="mt-3">
                                <Link
                                    to={`/dashboard?device=${encodeURIComponent(device.measurements)}&name=${encodeURIComponent(device.measurements)}&sensor=${encodeURIComponent(device.measurements)}`}
                                    className="btn btn-primary btn-block"
                                    style={{
                                        background: 'linear-gradient(45deg, #007bff 0%, #0056b3 100%)',
                                        border: 'none',
                                        borderRadius: '25px',
                                        padding: '10px 20px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <i className="fas fa-chart-line mr-2"></i>
                                    Ver Datos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DevicesGrid; 