export interface SensorData {
    sensorId: string;
    Humedad: number;
    Temperatura: number;
    time: string;
}

export interface Measurement {
    measurements: string;
}

const SENSOR_API_URL = import.meta.env.VITE_SENSOR_API_URL ;

export const getPostgresMeasurements = async (orgId: string): Promise<Measurement[]> => {
    try {
        console.log('Obteniendo measurements para la organización:', orgId);

        const url = `${SENSOR_API_URL}api/organizations/${orgId}/measurements`;
        console.log('URL de la petición:', url);

        const response = await fetch(url);
        console.log('Respuesta recibida:', response.status);

        if (!response.ok) {
            throw new Error(`Error al obtener measurements: ${response.status}`);
        }

        const data = await response.json();
        console.log('Measurements recibidos:', data);

        if (!Array.isArray(data)) {
            console.error('Los measurements no son un array:', data);
            throw new Error('Formato de measurements inválido');
        }

        return data; // Devuelve el array de nombres de measurements
    } catch (error) {
        console.error('Error al obtener measurements desde PostgreSQL:', error);
        throw error;
    }
};

export const getPostgresSensorData = async (sensorId: string, limit: number = 50): Promise<SensorData[]> => {
    try {
        console.log('Obteniendo datos del sensor desde PostgreSQL:', { sensorId, limit });

        const url = `${SENSOR_API_URL}api/sensors/${sensorId}/data?limit=${limit}`;
        console.log('URL de la petición:', url);

        const response = await fetch(url);
        console.log('Respuesta recibida:', response.status);

        if (!response.ok) {
            throw new Error(`Error al obtener datos del sensor: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', {
            tipo: typeof data,
            esArray: Array.isArray(data),
            cantidad: data?.length || 0,
            primerDato: data?.[0],
            ultimoDato: data?.[data.length - 1],
        });

        if (!Array.isArray(data)) {
            console.error('Los datos no son un array:', data);
            throw new Error('Formato de datos inválido');
        }

        // Validar y transformar los datos
        const validData = data.map(item => {
            if (!item || typeof item !== 'object') {
                console.error('Dato inválido:', item);
                return null;
            }

            // Asegurarse de que los valores sean números
            const humedad = Number(item.humedad);
            const temperatura = Number(item.temperatura);
            const resolvedSensorId = item.sensorId || sensorId; // Usar sensorId pasado como argumento

            if (isNaN(humedad) || isNaN(temperatura)) {
                console.error('Valores numéricos inválidos:', { humedad, temperatura });
                return null;
            }

            return {
                sensorId: resolvedSensorId,
                Humedad: humedad,
                Temperatura: temperatura,
                time: item.timestamp,
            };
        }).filter(item => item !== null);

        console.log('Datos procesados:', {
            cantidadOriginal: data.length,
            cantidadValidada: validData.length,
            primerDato: validData[0],
            ultimoDato: validData[validData.length - 1],
        });

        return validData;
    } catch (error) {
        console.error('Error al obtener datos del sensor desde PostgreSQL:', error);
        throw error;
    }
};