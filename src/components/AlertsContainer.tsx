import React, { useEffect, useState } from 'react';
import { Alerta, getPostgresSensorAlerts } from '@app/services/sensors';

interface AlertsContainerProps {
    selectedSensor: string;
    limit?: number;
}

const AlertsContainer: React.FC<AlertsContainerProps> = ({ selectedSensor, limit = 50 }) => {
    const [alerts, setAlerts] = useState<Alerta[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            if (!selectedSensor) return;

            setLoading(true);
            setError(null);

            try {
                const alertsData = await getPostgresSensorAlerts(selectedSensor, limit);
                setAlerts(alertsData);
            } catch (error) {
                console.error('Error al cargar las alertas:', error);
                setError('No se pudieron cargar las alertas del sensor');
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, [selectedSensor, limit]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Cargando alertas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (alerts.length === 0) {
        return <div className="alert alert-info">No hay alertas para mostrar</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Métrica</th>
                        <th>Valor</th>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.map((alert) => (
                        <tr key={alert.id_alerta}>
                            <td>{new Date(alert.hora_creacion).toLocaleString()}</td>
                            <td>{alert.metric_name}</td>
                            <td>{alert.value}</td>
                            <td>
                                <span className={`badge badge-${alert.max_or_min === 'max' ? 'danger' : 'warning'}`}>
                                    {alert.max_or_min === 'max' ? 'Máximo' : 'Mínimo'}
                                </span>
                            </td>
                            <td>
                                {alert.notificacion?.mensaje || 'Sin mensaje'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AlertsContainer;