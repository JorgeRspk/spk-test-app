import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getInfluxSensorValues, getInfluxMeasurements, InfluxSensorData, Measurement } from '@app/services/sensors';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface InfluxSensorChartProps {
  selectedDevice?: string;
  showDeviceSelector?: boolean;
}

interface StatsCard {
    title: string;
    min: number;
    max: number;
    unit: string;
    icon: string;
    color: string;
}

const InfluxSensorChart: React.FC<InfluxSensorChartProps> = ({ 
  selectedDevice: initialDevice,
  showDeviceSelector = true 
}) => {
  const [sensorData, setSensorData] = useState<InfluxSensorData[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>(initialDevice || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    limit: 50
  });
  const [stats, setStats] = useState<StatsCard[]>([]);

  // Función para convertir fecha local a UTC
  const localToUTC = (localDate: string) => {
    if (!localDate) return undefined;
    // Convertir la fecha local del input a UTC
    const date = new Date(localDate);
    return date.toISOString();
  };

  // Función para convertir UTC a fecha local para el input
  const utcToLocal = (utcDate: string) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    // Obtener los componentes de la fecha en la zona horaria local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Cargar los measurements disponibles
  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        console.log('Iniciando carga de measurements...');
        const data = await getInfluxMeasurements();
        console.log('Measurements cargados:', data);
        
        if (!data || data.length === 0) {
          console.error('No se encontraron measurements');
          setError('No hay dispositivos disponibles');
          return;
        }
        
        setMeasurements(data);
        
        if (!selectedDevice && data.length > 0) {
          console.log('Seleccionando primer dispositivo:', data[0].measurements);
          setSelectedDevice(data[0].measurements);
        }
      } catch (error) {
        console.error('Error al obtener measurements:', error);
        setError('No se pudieron cargar los dispositivos disponibles');
      }
    };

    fetchMeasurements();
  }, []);

  // Cargar datos del sensor
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDevice) {
        console.log('No hay dispositivo seleccionado, omitiendo carga de datos');
        return;
      }

      console.log('Iniciando carga de datos para:', selectedDevice);
      setLoading(true);
      setError(null);

      try {
        // Asegurarse de que limit sea un número
        const limitValue = parseInt(filters.limit.toString(), 10);
        console.log('Límite de registros:', limitValue);

        // Convertir fechas locales a UTC
        const startDateUTC = localToUTC(filters.startDate);
        const endDateUTC = localToUTC(filters.endDate);

        console.log('Fechas para la petición:', {
          startDate: startDateUTC,
          endDate: endDateUTC,
          originalStart: filters.startDate,
          originalEnd: filters.endDate
        });

        const data = await getInfluxSensorValues({
          point: selectedDevice,
          startDate: startDateUTC,
          endDate: endDateUTC,
          limit: limitValue
        });

        console.log('Datos recibidos en el componente:', {
          cantidad: data?.length || 0,
          primerDato: data?.[0],
          ultimoDato: data?.[data.length - 1],
          limitSolicitado: limitValue,
          rangoFechas: {
            inicio: startDateUTC,
            fin: endDateUTC
          }
        });

        if (!data || data.length === 0) {
          console.log('No hay datos disponibles');
          setError('No hay datos disponibles para este dispositivo');
          setSensorData([]);
          return;
        }

        setSensorData(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('No se pudieron cargar los datos del sensor');
        setSensorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedDevice, filters]);

  // Nuevo useEffect para calcular estadísticas
  useEffect(() => {
    if (!sensorData.length) return;

    // Calcular estadísticas
    const temperatureData = sensorData.map(d => d.Temperature).filter(t => !isNaN(t));
    const moistureData = sensorData.map(d => d.Moisture_Percent).filter(m => !isNaN(m));

    const statsCards: StatsCard[] = [
        {
            title: 'Temperatura',
            min: Math.min(...temperatureData),
            max: Math.max(...temperatureData),
            unit: '°C',
            icon: 'fas fa-thermometer-half',
            color: 'danger'
        },
        {
            title: 'Humedad',
            min: Math.min(...moistureData),
            max: Math.max(...moistureData),
            unit: '%',
            icon: 'fas fa-tint',
            color: 'info'
        }
    ];

    setStats(statsCards);
  }, [sensorData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Cambio de filtro:', { name, value });
    
    // Asegurarse de que el valor del límite sea un número válido
    if (name === 'limit') {
      const limitValue = parseInt(value, 10);
      if (isNaN(limitValue) || limitValue < 1) {
        console.error('Valor de límite inválido:', value);
        return;
      }
      setFilters(prev => ({
        ...prev,
        limit: limitValue
      }));
      return;
    }

    // Manejar cambios en las fechas
    if (name === 'startDate' || name === 'endDate') {
      if (!value) {
        setFilters(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }

      // El valor viene en la zona horaria local, lo guardamos tal cual
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Cambio de dispositivo:', value);
    setSelectedDevice(value);
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `Datos de Sensores - ${selectedDevice || 'Sin dispositivo seleccionado'}`,
      },
    },
    scales: {
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Humedad (%)',
        },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Temperatura (°C)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const data = {
    labels: sensorData.map(d => {
      const date = new Date(d.time);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }),
    datasets: [
      {
        label: 'Humedad',
        data: sensorData.map(d => d.Moisture_Percent),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Temperatura',
        data: sensorData.map(d => d.Temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y2',
      },
    ],
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="card-title">Monitoreo de Sensores (InfluxDB)</h3>
          {showDeviceSelector && (
            <select 
              className="form-control" 
              style={{ width: 'auto' }}
              value={selectedDevice}
              onChange={handleDeviceChange}
              disabled={loading}
              aria-label="Seleccionar dispositivo"
            >
              <option value="">Seleccione un dispositivo</option>
              {measurements.map((device) => (
                <option key={device.measurements} value={device.measurements}>
                  {device.measurements}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="startDate">Fecha Inicio</label>
              <input
                type="datetime-local"
                className="form-control"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                disabled={loading}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="endDate">Fecha Fin</label>
              <input
                type="datetime-local"
                className="form-control"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                disabled={loading}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="limit">Número de Registros</label>
              <select
                className="form-control"
                id="limit"
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                disabled={loading}
              >
                <option value="10">10 registros</option>
                <option value="25">25 registros</option>
                <option value="50">50 registros</option>
                <option value="100">100 registros</option>
                <option value="200">200 registros</option>
                <option value="500">500 registros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="row mb-4">
            {stats.map((stat, index) => (
                <div key={index} className="col-md-6">
                    <div className={`card bg-gradient-${stat.color}`}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0 text-white">
                                    <i className={`${stat.icon} mr-2`}></i>
                                    {stat.title}
                                </h5>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="text-white">
                                        <p className="mb-0">
                                            <i className="fas fa-arrow-down mr-2"></i>
                                            Mínimo
                                        </p>
                                        <h3 className="mb-0">
                                            {stat.min.toFixed(2)}{stat.unit}
                                        </h3>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-white">
                                        <p className="mb-0">
                                            <i className="fas fa-arrow-up mr-2"></i>
                                            Máximo
                                        </p>
                                        <h3 className="mb-0">
                                            {stat.max.toFixed(2)}{stat.unit}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Cargando...</span>
            </div>
          </div>
        ) : sensorData.length === 0 ? (
          <div className="alert alert-info">No hay datos disponibles para mostrar</div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default InfluxSensorChart; 