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
import { getSensorValues, SensorData } from '@app/services/sensors';

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

const SensorChart = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSensorValues();
        setSensorData(data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener datos de los sensores:', error);
        setError('No se pudieron cargar los datos de los sensores');
      }
    };

    fetchData();
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
        text: 'Datos de Sensores',
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
    labels: sensorData.map(d => new Date(d.time).toLocaleString()),
    datasets: [
      {
        label: 'Humedad',
        data: sensorData.map(d => d.moisture_percent),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Temperatura',
        data: sensorData.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y2',
      },
    ],
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Monitoreo de Sensores</h3>
      </div>
      <div className="card-body">
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default SensorChart; 