export interface Organization {
    id: string;
    nombre: string;
}

export interface Device {
    id: string;
    nombre: string;
    description: string;
    fk_modelo_id: string;
    fecha_creacion: string;
    enable: boolean;
    last_connection: string;
    mac: string;
    modelo: {
        id: string;
        nombre: string;
        descripcion: string;
    };
}

export interface Sensor {
    id: string;
    nombre: string;
    fecha_creacion: string;
    habilitada: boolean;
    nodo: string;
    id_tipo_sensor: string;
    id_modelo: string;
    last_connection: string;
    tipo_sensor: {
        id: string;
        nombre: string;
        descripcion: string;
    };
    modelo_sensor: {
        id: string;
        nombre: string;
        descripcion: string;
    };
    columnas: Array<{
        id: string;
        nombre: string;
        data_type: string;
        unidad_medida: string;
    }>;
}

const API_URL = 'http://localhost:3002';

export const getOrganization = async (orgId: string): Promise<Organization> => {
    const response = await fetch(`${API_URL}/api/organizations/${orgId}`);
    if (!response.ok) {
        throw new Error('Error al obtener la organización');
    }
    return response.json();
};

export const getOrganizationDevices = async (orgId: string): Promise<Device[]> => {
    const response = await fetch(`${API_URL}/api/organizations/${orgId}/devices`);
    if (!response.ok) {
        throw new Error('Error al obtener los dispositivos');
    }
    return response.json();
};

export const getDeviceSensors = async (deviceId: string): Promise<Sensor[]> => {
    const response = await fetch(`${API_URL}/api/devices/${deviceId}/sensors`);
    if (!response.ok) {
        throw new Error('Error al obtener los sensores');
    }
    return response.json();
}; 