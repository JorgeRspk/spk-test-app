import React, { useEffect, useState } from 'react';
import { ContentHeader } from '@components';
import { getOrganization, getOrganizationDevices, getDeviceSensors, Organization, Device, Sensor } from '@app/services/organization';

interface Alert {
    id: string;
    deviceName: string;
    sensorName: string;
    message: string;
    timestamp: Date;
    type: 'warning' | 'danger';
}

// Datos de ejemplo para alertas (después se reemplazarán con datos reales)
const mockAlerts: Alert[] = [
    {
        id: '1',
        deviceName: 'ESP32-001',
        sensorName: 'Sensor Temp 1',
        message: 'Temperatura excede el límite máximo (30°C)',
        timestamp: new Date(),
        type: 'danger'
    },
    {
        id: '2',
        deviceName: 'Arduino-001',
        sensorName: 'Sensor Hum 1',
        message: 'Humedad por debajo del límite mínimo (20%)',
        timestamp: new Date(),
        type: 'warning'
    }
];

const Home: React.FC = () => {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [allSensors, setAllSensors] = useState<Sensor[]>([]);
    const [alerts] = useState<Alert[]>(mockAlerts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar datos de la organización
                const orgData = await getOrganization('org-001');
                setOrganization(orgData);

                // Cargar dispositivos
                const devicesData = await getOrganizationDevices('org-001');
                setDevices(devicesData);

                // Cargar sensores de todos los dispositivos
                const sensorsPromises = devicesData.map(device => getDeviceSensors(device.id));
                const sensorsArrays = await Promise.all(sensorsPromises);
                const allSensorsData = sensorsArrays.flat();
                setAllSensors(allSensorsData);

            } catch (err) {
                console.error('Error cargando datos:', err);
                setError('Error al cargar los datos. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getStatusBadge = (status: boolean) => {
        return status ? (
            <span className="badge badge-success">Activo</span>
        ) : (
            <span className="badge badge-danger">Inactivo</span>
        );
    };

    if (loading) {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-12 text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Cargando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-12">
                                <div className="alert alert-danger">{error}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <ContentHeader title={organization?.nombre || 'Organización'} />
            
            <section className="content">
                <div className="container-fluid">
                    {/* Resumen de estadísticas */}
                    <div className="row">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{devices.length}</h3>
                                    <p>Dispositivos</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-microchip"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{allSensors.length}</h3>
                                    <p>Sensores</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-thermometer-half"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{devices.filter(d => d.enable).length}</h3>
                                    <p>Dispositivos Activos</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{alerts.length}</h3>
                                    <p>Alertas Hoy</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Lista de Dispositivos */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-microchip mr-2"></i>
                                        Dispositivos
                                    </h3>
                                </div>
                                <div className="card-body table-responsive p-0" style={{ maxHeight: '400px' }}>
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Modelo</th>
                                                <th>Estado</th>
                                                <th>Última Conexión</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {devices.map(device => (
                                                <tr key={device.id}>
                                                    <td>{device.nombre}</td>
                                                    <td>{device.modelo.nombre}</td>
                                                    <td>{getStatusBadge(device.enable)}</td>
                                                    <td>
                                                        {new Date(device.last_connection).toLocaleString('es-ES')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Sensores */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-thermometer-half mr-2"></i>
                                        Sensores
                                    </h3>
                                </div>
                                <div className="card-body table-responsive p-0" style={{ maxHeight: '400px' }}>
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Tipo</th>
                                                <th>Nodo</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allSensors.map(sensor => (
                                                <tr key={sensor.id}>
                                                    <td>{sensor.nombre}</td>
                                                    <td>{sensor.tipo_sensor.nombre}</td>
                                                    <td>{sensor.nodo}</td>
                                                    <td>{getStatusBadge(sensor.habilitada)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alertas del día */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        Alertas del Día
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {alerts.length === 0 ? (
                                        <div className="alert alert-success">
                                            <i className="fas fa-check-circle mr-2"></i>
                                            No hay alertas para mostrar
                                        </div>
                                    ) : (
                                        <div className="timeline">
                                            {alerts.map(alert => (
                                                <div key={alert.id} className="timeline-item">
                                                    <div className="timeline-item-marker"></div>
                                                    <div className={`alert alert-${alert.type} mb-3`}>
                                                        <h5 className="alert-heading">
                                                            <i className="fas fa-exclamation-circle mr-2"></i>
                                                            {alert.deviceName} - {alert.sensorName}
                                                        </h5>
                                                        <p className="mb-0">{alert.message}</p>
                                                        <small className="text-muted">
                                                            {alert.timestamp.toLocaleString('es-ES')}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 