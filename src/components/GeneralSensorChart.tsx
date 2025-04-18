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

interface StatsCard {
    title: string;
    min: number;
    max: number;
    unit: string;
    icon: string;
    color: string;
}

interface SensorDataWithSource extends InfluxSensorData {
  sensor: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    borderWidth: number;
    pointRadius: number;
    pointHoverRadius: number;
    pointHoverBackgroundColor: string;
    pointHoverBorderColor: string;
    pointHoverBorderWidth: number;
  }>;
}

interface Props {
  showCard?: boolean;
  showStats?: boolean;
}

const GeneralSensorChart: React.FC<Props> = ({ showCard = true, showStats = true }) => {
  const [sensorData, setSensorData] = useState<SensorDataWithSource[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    limit: 50
  });
  const [stats, setStats] = useState<StatsCard[]>([]);

  // Variables disponibles
  const availableVariables = [
    { value: 'Temperature', label: 'Temperatura' },
    { value: 'Moisture_Percent', label: 'Humedad' }
  ];

  // Función para convertir fecha local a UTC
  const localToUTC = (localDate: string) => {
    if (!localDate) return undefined;
    const date = new Date(localDate);
    return date.toISOString();
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
      } catch (error) {
        console.error('Error al obtener measurements:', error);
        setError('No se pudieron cargar los dispositivos disponibles');
      }
    };

    fetchMeasurements();
  }, []);

  // Cargar datos de los sensores
  useEffect(() => {
    const fetchData = async () => {
      if (selectedSensors.length === 0 || !selectedVariable) {
        console.log('No hay sensores o variable seleccionada, omitiendo carga de datos');
        return;
      }

      console.log('Iniciando carga de datos para:', selectedSensors);
      setLoading(true);
      setError(null);

      try {
        const limitValue = parseInt(filters.limit.toString(), 10);
        const startDateUTC = localToUTC(filters.startDate);
        const endDateUTC = localToUTC(filters.endDate);

        // Cargar datos para cada sensor seleccionado
        const dataPromises = selectedSensors.map(sensor =>
          getInfluxSensorValues({
            point: sensor,
            startDate: startDateUTC,
            endDate: endDateUTC,
            limit: limitValue
          })
        );

        const results = await Promise.all(dataPromises);
        
        // Combinar los datos de todos los sensores, manteniendo la referencia al sensor
        const combinedData = results.flatMap((sensorData, index) => 
          sensorData.map(data => ({
            ...data,
            sensor: selectedSensors[index]
          }))
        );

        if (!combinedData || combinedData.length === 0) {
          console.log('No hay datos disponibles');
          setError('No hay datos disponibles para los sensores seleccionados');
          setSensorData([]);
          return;
        }

        setSensorData(combinedData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('No se pudieron cargar los datos de los sensores');
        setSensorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedSensors, selectedVariable, filters]);

  // Calcular estadísticas
  useEffect(() => {
    if (!sensorData.length || !selectedVariable) return;

    const variableData = sensorData.map(d => {
      const value = d[selectedVariable as keyof InfluxSensorData];
      return typeof value === 'number' ? value : NaN;
    }).filter(v => !isNaN(v));

    const unit = selectedVariable === 'Temperature' ? '°C' : '%';
    const icon = selectedVariable === 'Temperature' ? 'fas fa-thermometer-half' : 'fas fa-tint';
    const color = selectedVariable === 'Temperature' ? 'danger' : 'info';

    const statsCards: StatsCard[] = [{
      title: availableVariables.find(v => v.value === selectedVariable)?.label || selectedVariable,
      min: Math.min(...variableData),
      max: Math.max(...variableData),
      unit,
      icon,
      color
    }];

    setStats(statsCards);
  }, [sensorData, selectedVariable]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
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

    if (name === 'startDate' || name === 'endDate') {
      if (!value) {
        setFilters(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }

      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSensorChange = (sensor: string) => {
    setSelectedSensors(prev => 
      prev.includes(sensor) 
        ? prev.filter(s => s !== sensor)
        : [...prev, sensor]
    );
  };

  const handleVariableChange = (variable: string) => {
    setSelectedVariable(variable);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `Datos de Sensores - ${selectedVariable ? availableVariables.find(v => v.value === selectedVariable)?.label : 'Sin variable seleccionada'}`,
      },
      legend: {
        display: true,
        position: 'top' as const,
      }
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 5
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tiempo'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: selectedVariable === 'Temperature' ? 'Temperatura (°C)' : 'Humedad (%)',
        },
        min: 0,
      },
    },
  };

  // Primero creamos las etiquetas de tiempo únicas y ordenadas
  const timeLabels = Array.from(new Set(sensorData.map(d => d.time)))
    .sort()
    .map(time => {
      const date = new Date(time);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    });

  // Creamos un mapa de tiempo ISO a tiempo formateado para buscar los valores
  const isoToFormattedTime = new Map(
    Array.from(new Set(sensorData.map(d => d.time))).sort().map(time => [
      time,
      new Date(time).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    ])
  );

  // Luego creamos los datasets usando las etiquetas
  const datasets = selectedSensors.map((sensor, index) => {
    // Filtrar datos para este sensor específico
    const filteredSensorData = sensorData.filter((d: SensorDataWithSource) => d.sensor === sensor);
    
    // Crear un mapa de tiempo ISO a valor para este sensor
    const timeToValue = new Map(
      filteredSensorData.map((d: SensorDataWithSource) => [
        d.time,
        d[selectedVariable as keyof InfluxSensorData]
      ])
    );

    // Crear el array de datos alineado con las etiquetas de tiempo
    const alignedData: (number | null)[] = Array.from(new Set(sensorData.map(d => d.time)))
      .sort()
      .map(time => {
        const value = timeToValue.get(time);
        return typeof value === 'number' ? value : null;
      });

    return {
      label: sensor,
      data: alignedData,
      borderColor: `hsl(${(index * 360) / selectedSensors.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / selectedSensors.length}, 70%, 50%, 0.5)`,
      fill: false,
      tension: 0,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: `hsl(${(index * 360) / selectedSensors.length}, 70%, 50%)`,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      spanGaps: true,
    };
  });

  // Finalmente creamos el objeto data
  const data: ChartData = {
    labels: timeLabels,
    datasets
  };

  return showCard ? (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Monitoreo General de Sensores</h3>
      </div>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="form-group">
              <label>Sensores</label>
              {measurements.map((device) => (
                <div key={device.measurements} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`sensor-${device.measurements}`}
                    checked={selectedSensors.includes(device.measurements)}
                    onChange={() => handleSensorChange(device.measurements)}
                  />
                  <label className="form-check-label" htmlFor={`sensor-${device.measurements}`}>
                    {device.measurements}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group">
              <label>Variable</label>
              {availableVariables.map((variable) => (
                <div key={variable.value} className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id={`variable-${variable.value}`}
                    checked={selectedVariable === variable.value}
                    onChange={() => handleVariableChange(variable.value)}
                  />
                  <label className="form-check-label" htmlFor={`variable-${variable.value}`}>
                    {variable.label}
                  </label>
                </div>
              ))}
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
        {showStats && (
          <div className="row mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-md-12">
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
        )}

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
          <div style={{ height: '600px', width: '100%' }}>
            <Line options={options} data={data} />
          </div>
        )}
      </div>
    </div>
  ) : (
    <>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="form-group">
            <label>Sensores</label>
            {measurements.map((device) => (
              <div key={device.measurements} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`sensor-${device.measurements}`}
                  checked={selectedSensors.includes(device.measurements)}
                  onChange={() => handleSensorChange(device.measurements)}
                />
                <label className="form-check-label" htmlFor={`sensor-${device.measurements}`}>
                  {device.measurements}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label>Variable</label>
            {availableVariables.map((variable) => (
              <div key={variable.value} className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`variable-${variable.value}`}
                  checked={selectedVariable === variable.value}
                  onChange={() => handleVariableChange(variable.value)}
                />
                <label className="form-check-label" htmlFor={`variable-${variable.value}`}>
                  {variable.label}
                </label>
              </div>
            ))}
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
      {showStats && (
        <div className="row mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-md-12">
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
      )}

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
        <div style={{ height: '600px', width: '100%' }}>
          <Line options={options} data={data} />
        </div>
      )}
    </>
  );
};

export default GeneralSensorChart; 