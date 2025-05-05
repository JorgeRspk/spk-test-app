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
import { getPostgresSensorData, getPostgresMeasurements, Measurement, SensorData } from '@app/services/sensors';
import { getOrganizationSensors, Sensor } from '@app/services/organization';

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
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('Humedad'); // Valor por defecto
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    limit: 50
  });
  const [stats, setStats] = useState<StatsCard[]>([]);
  const organizationId = 'org-001'; // ID de la organización, puedes cambiarlo según sea necesario

  // Variables disponibles
  const [availableVariables, setAvailableVariables] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchVariables = async () => {
        try {
            // Obtener las variables (measurements) desde el servidor
            const measurements = await getPostgresMeasurements(organizationId);
            console.log('Variables disponibles:', measurements);

            if (measurements && measurements.length > 0) {
                // Mapear los measurements a variables disponibles
                const variables = [
                    { value: 'Humedad', label: 'Humedad (%)' },
                    { value: 'Temperatura', label: 'Temperatura (°C)' }
                ];
                setAvailableVariables(variables);

                // Seleccionar la primera variable por defecto
                if (!selectedVariable) {
                    setSelectedVariable(variables[0].value);
                    console.log('Variable seleccionada por defecto:', variables[0].value);
                }
            }
        } catch (error) {
            console.error('Error al obtener las variables:', error);
            setError('No se pudieron cargar las variables disponibles');
        }
    };

    fetchVariables();
}, [selectedVariable]); // Agregar selectedVariable como dependencia

  // Función para convertir fecha local a UTC
  const localToUTC = (localDate: string) => {
    if (!localDate) return undefined;
    const date = new Date(localDate);
    return date.toISOString();
  };

  // Cargar los sensores disponibles
  useEffect(() => {
    const fetchSensors = async () => {
        try {
            console.log('Iniciando carga de measurements...');
            const data = await getOrganizationSensors(organizationId);
            console.log('Sensores cargados:', data);

            if (!data || data.length === 0) {
                console.error('No se encontraron measurements');
                setError('No hay dispositivos disponibles');
                return;
            }

            setSensors(data);

            // Seleccionar el primer sensor por defecto si no hay ninguno seleccionado
            if (data.length > 0 && selectedSensors.length === 0) {
                const firstSensor = data[0];
                setSelectedSensors([firstSensor.id]);
                console.log('Sensor seleccionado por defecto:', firstSensor.id);
            }
        } catch (error) {
            console.error('Error al obtener measurements:', error);
            setError('No se pudieron cargar los dispositivos disponibles');
        }
    };

    fetchSensors();
}, []);

  // Cargar datos de los sensores
  useEffect(() => {
    const fetchData = async () => {
        if (selectedSensors.length === 0 || !selectedVariable) {
            console.log('No hay sensores o variable seleccionada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const limitValue = parseInt(filters.limit.toString(), 10);
            console.log('Cargando datos con:', { 
                selectedSensors, 
                selectedVariable,
                limitValue,
                filters 
            });

            // Cargar datos para todos los sensores seleccionados
            const dataPromises = selectedSensors.map(sensorId =>
                getPostgresSensorData(sensorId, limitValue)
            );

            const results = await Promise.all(dataPromises);
            
            // Combinar y formatear los datos
            const combinedData = results.flatMap((sensorData, index) =>
                (sensorData || []).map(data => ({
                    sensorId: selectedSensors[index],
                    Humedad: data.Humedad,
                    Temperatura: data.Temperatura,
                    time: data.time,
                }))
            );

            console.log('Datos combinados:', combinedData);
            setSensorData(combinedData);
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setError('No se pudieron cargar los datos de los sensores');
            setSensorData([]); // Limpiar datos en caso de error
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [selectedSensors, selectedVariable, filters.limit]); // Solo incluir las dependencias necesarias

  // Calcular estadísticas
  useEffect(() => {
    if (!sensorData.length || !selectedVariable) return;

    const variableData = sensorData.map(d => {
      const value = d[selectedVariable as keyof SensorData];
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

  useEffect(() => {
    console.log('Estado actual:', {
        sensoresSeleccionados: selectedSensors,
        variableSeleccionada: selectedVariable,
        datosSensores: sensorData.length,
        filtros: filters
    });
}, [selectedSensors, selectedVariable, sensorData, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log('Cambiando filtro:', { name, value });
    
    setFilters(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleSensorChange = (sensorId: string) => {
    setSelectedSensors(prev => 
      prev.includes(sensorId) 
        ? prev.filter(s => s !== sensorId)
        : [...prev, sensorId]
    );
  };

  const handleVariableChange = (variable: string) => {
    console.log('Cambiando variable a:', variable);
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
        tension: 0 // Cambiar a 0 para líneas rectas (antes era 0.4)
      },
      point: {
        radius: 3, // Aumentar el radio para hacer los puntos más visibles
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
        },
        ticks: {
          maxRotation: 45, // Rotar las etiquetas para mejor legibilidad
          minRotation: 45,
          autoSkip: true, // Saltar etiquetas automáticamente si hay muchas
          maxTicksLimit: 10 // Limitar el número máximo de etiquetas
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
  const timeLabels = Array.from(new Set(
    sensorData
      .filter(d => {
        // Filtrar por fechas si hay filtros activos
        if (filters.startDate && filters.endDate) {
          const date = new Date(d.time);
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          return date >= start && date <= end;
        }
        return true;
      })
      .map(d => d.time)
  ))
  .filter(time => !isNaN(new Date(time).getTime())) // Filtrar fechas inválidas
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
  const datasets = selectedSensors.map((sensorId, index) => {
    // Filtrar datos por sensor y fechas
    const filteredSensorData = sensorData.filter(d => {
        if (d.sensorId !== sensorId) return false;
        
        if (filters.startDate && filters.endDate) {
            const date = new Date(d.time);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            return date >= start && date <= end;
        }
        return true;
    });

    const sensorInfo = sensors.find(s => s.id === sensorId);
    
    console.log(`Datos filtrados para sensor ${sensorId}:`, {
        dataLength: filteredSensorData.length,
        variable: selectedVariable,
        valores: filteredSensorData.map(d => d[selectedVariable as keyof SensorData])
    });

    return {
        label: sensorInfo?.nombre || sensorId,
        data: filteredSensorData.map(d => d[selectedVariable as keyof SensorData]),
        borderColor: `hsl(${(index * 360) / selectedSensors.length}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 360) / selectedSensors.length}, 70%, 50%, 0.5)`,
        fill: false,
        tension: 0,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: `hsl(${(index * 360) / selectedSensors.length}, 70%, 50%)`,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
    };
  });

  // Log filtered data for each sensor
  selectedSensors.forEach(sensor => {
    const filteredSensorData = sensorData.filter(d => d.sensorId === sensor);
    console.log(`Datos filtrados para el sensor ${sensor}:`, filteredSensorData);
  });

  // Finalmente creamos el objeto data
  const data: ChartData = {
    labels: timeLabels,
    datasets: datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.map((value) => (typeof value === 'number' ? value : null)),
        fill: false,
        tension: 0,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: dataset.borderColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
    })),
  };

  if (!sensorData || sensorData.length === 0) {
    return <div className="alert alert-info">No hay datos disponibles para mostrar</div>;
  }

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
              {sensors.map((device) => (
                <div key={device.id} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`sensor-${device.id}`}
                    checked={selectedSensors.includes(device.id)}
                    onChange={() => handleSensorChange(device.id)}
                  />
                  <label className="form-check-label" htmlFor={`sensor-${device.id}`}>
                    {device.nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group">
              <label>Variable</label>
              <select
                  className="form-control"
                  value={selectedVariable}
                  onChange={(e) => setSelectedVariable(e.target.value)}
              >
                  {availableVariables.map((variable) => (
                      <option key={variable.value} value={variable.value}>
                          {variable.label}
                      </option>
                  ))}
              </select>
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
            {sensors.map((device) => (
              <div key={device.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`sensor-${device.id}`}
                  checked={selectedSensors.includes(device.id)}
                  onChange={() => handleSensorChange(device.id)}
                />
                <label className="form-check-label" htmlFor={`sensor-${device.id}`}>
                  {device.nombre}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label>Variable</label>
            <select
                className="form-control"
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
            >
                {availableVariables.map((variable) => (
                    <option key={variable.value} value={variable.value}>
                        {variable.label}
                    </option>
                ))}
            </select>
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