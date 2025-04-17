export interface SensorData {
    moisture_percent: number;
    temperature: number;
    time: string;
}

export interface InfluxSensorData {
    Moisture_Percent: number;
    Temperature: number;
    time: string;
}

export interface Measurement {
    measurements: string;
}

export interface GetInfluxSensorValuesParams {
    point: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}

const SENSOR_API_URL = import.meta.env.VITE_SENSOR_API_URL ;

export const getSensorValues = async (): Promise<SensorData[]> => {
    try {
        const response = await fetch(`${SENSOR_API_URL}/sensor-values`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener datos de sensores:', error);
        throw error;
    }
};

export const getInfluxMeasurements = async (): Promise<Measurement[]> => {
    try {
        console.log('Iniciando petición de measurements...');
        const response = await fetch(`${SENSOR_API_URL }/influxdb-measurements`);
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
        
        return data;
    } catch (error) {
        console.error('Error al obtener measurements:', error);
        throw error;
    }
};

export const getInfluxSensorValues = async (params: GetInfluxSensorValuesParams): Promise<InfluxSensorData[]> => {
    try {
        const { point, startDate, endDate, limit = 50 } = params;
        console.log('Parámetros recibidos:', { point, startDate, endDate, limit });

        const queryParams = new URLSearchParams();
        queryParams.append('point', point);
        
        // Manejar las fechas
        if (startDate) {
            // Convertir la fecha a formato ISO y asegurarse de que esté en UTC
            const startDateObj = new Date(startDate);
            const startDateISO = startDateObj.toISOString();
            console.log('Fecha inicio formateada:', startDateISO);
            queryParams.append('startDate', startDateISO);
        }
        
        if (endDate) {
            // Convertir la fecha a formato ISO y asegurarse de que esté en UTC
            const endDateObj = new Date(endDate);
            const endDateISO = endDateObj.toISOString();
            console.log('Fecha fin formateada:', endDateISO);
            queryParams.append('endDate', endDateISO);
        }

        const limitValue = parseInt(limit.toString(), 10);
        queryParams.append('limit', limitValue.toString());

        const url = `${SENSOR_API_URL}/influxdb-data?${queryParams.toString()}`;
        console.log('URL de la petición:', url);

        const response = await fetch(url);
        console.log('Respuesta recibida:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', {
            tipo: typeof data,
            esArray: Array.isArray(data),
            cantidad: data?.length || 0,
            primerDato: data?.[0],
            ultimoDato: data?.[data.length - 1],
            limitSolicitado: limitValue,
            rangoFechas: {
                inicio: startDate,
                fin: endDate
            }
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
            const moisture = Number(item.Moisture_Percent);
            const temperature = Number(item.Temperature);

            if (isNaN(moisture) || isNaN(temperature)) {
                console.error('Valores numéricos inválidos:', { moisture, temperature });
                return null;
            }

            return {
                Moisture_Percent: moisture,
                Temperature: temperature,
                time: item.time
            };
        }).filter(item => item !== null);

        // Ordenar los datos por fecha
        validData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        // Si hay fechas especificadas, filtrar por el rango de fechas
        let filteredData = validData;
        if (startDate || endDate) {
            const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
            const endTimestamp = endDate ? new Date(endDate).getTime() : Date.now();
            
            filteredData = validData.filter(item => {
                const itemTimestamp = new Date(item.time).getTime();
                return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
            });
        }

        // Aplicar el límite después de filtrar por fechas
        const limitedData = filteredData.slice(-limitValue);

        console.log('Datos procesados:', {
            cantidadOriginal: data.length,
            cantidadValidada: validData.length,
            cantidadFiltrada: filteredData.length,
            cantidadLimitada: limitedData.length,
            limitSolicitado: limitValue,
            primerDato: limitedData[0],
            ultimoDato: limitedData[limitedData.length - 1],
            rangoFechas: {
                inicio: startDate,
                fin: endDate
            }
        });

        return limitedData;
    } catch (error) {
        console.error('Error al obtener datos de InfluxDB:', error);
        throw error;
    }
}; 