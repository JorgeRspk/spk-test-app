const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3002;

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Endpoint para obtener los datos de los sensores
app.get('/sensor-values', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT moisture_percent, temperature, time FROM sensorvalues ORDER BY time DESC LIMIT 50'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de sensores:', error);
        res.status(500).json({ error: 'Error al obtener datos de sensores' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Sensores funcionando');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 