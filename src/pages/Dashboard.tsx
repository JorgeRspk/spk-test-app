import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentHeader } from '@components';
import InfluxSensorChart from '@app/components/InfluxSensorChart';
import DevicesGrid from '@app/components/DevicesGrid';
import Diagrama from './Diagrama';
import AlertsContainer from '@app/components/AlertsContainer';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const selectedDevice = searchParams.get('device');
    const deviceName = searchParams.get('name') || 'Dispositivo';
    const selectedSensor = searchParams.get('sensor') || undefined;

    return (
        <div className="content-wrapper">
            <ContentHeader title={selectedDevice ? selectedSensor || 'Sensor Desconocido' : 'Sensores'} />
            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-body">
                            {selectedDevice ? (
                                <>
                                    <InfluxSensorChart 
                                        selectedDevice={selectedSensor} 
                                        showDeviceSelector={false} 
                                    />
                                    {selectedSensor && (
                                        <>
                                            <div className="mt-4">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h3 className="card-title">Ubicación del Sensor en el Sistema</h3>
                                                    </div>
                                                    <div className="card-body">
                                                        <Diagrama selectedSensor={selectedSensor} showExample={true} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h3 className="card-title">Alertas del Sensor</h3>
                                                    </div>
                                                    <div className="card-body">
                                                        <AlertsContainer selectedSensor={selectedSensor} limit={10} />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <DevicesGrid />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
