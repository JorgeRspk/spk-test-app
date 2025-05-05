import { removeWindowClass } from '@app/utils/helpers';


// Actualizada la URL para apuntar al contenedor Docker en el puerto 3001
const API_URL = import.meta.env.VITE_LOGIN_API_URL ;

// export const loginByAuth = async (email: string, password: string) => {
//   const token = 'I_AM_THE_TOKEN';
//   localStorage.setItem('token', token);
//   removeWindowClass('login-page');
//   removeWindowClass('hold-transition');
//   return token;
// };

// export const registerByAuth = async (email: string, password: string) => {
//   const token = 'I_AM_THE_TOKEN';
//   localStorage.setItem('token', token);
//   removeWindowClass('register-page');
//   removeWindowClass('hold-transition');
//   return token;
// };

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: email,
        password 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el registro');
    }

    // Después del registro exitoso, hacemos login automáticamente
    return loginWithEmail(email, password);
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: email,
        password 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el inicio de sesión');
    }

    const token = data.user._id;
    localStorage.setItem('token', token);
    removeWindowClass('login-page');
    removeWindowClass('hold-transition');
    
    return { user: { ...data.user, token } };
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    localStorage.removeItem('token');
  } catch (error) {
    // Incluso si hay error en el servidor, eliminamos el token local
    localStorage.removeItem('token');
    throw error;
  }
};

export const getUserData = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos del usuario');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    throw error;
  }
}