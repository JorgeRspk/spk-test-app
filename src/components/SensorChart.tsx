import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getPostgresSensorData, SensorData } from '@app/services/sensors';

interface SensorChartProps {
  sensorId: string;
}

const SensorChart: React.FC<SensorChartProps> = ({ sensorId }) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const data = await getPostgresSensorData(sensorId, 50); // Usar el ID dinámico
              setSensorData(data);
          } catch (error) {
              console.error('Error al obtener datos del sensor:', error);
              setError('No se pudieron cargar los datos del sensor');
          }
      };

      fetchData();
  }, [sensorId]); // Volver a cargar los datos si cambia el ID del sensor

  const data = {
      labels: sensorData.map(d => new Date(d.time).toLocaleString()),
      datasets: [
          {
              label: 'Humedad',
              data: sensorData.map(d => d.Humedad),
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
              label: 'Temperatura',
              data: sensorData.map(d => d.Temperatura),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
      ],
  };

  return (
      <div>
          {error ? (
              <div className="alert alert-danger">{error}</div>
          ) : (
              <Line data={data} />
          )}
      </div>
  );
};

export default SensorChart;