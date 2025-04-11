import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationMenu } from '@app/styles/dropdown-menus';

const NotificationsDropdown = () => {
  const [t] = useTranslation();

  return (
    <NotificationMenu hideArrow>
      <div slot="head">
        <i className="far fa-bell" />
        <span className="badge badge-warning navbar-badge">6</span>
      </div>
      <div slot="body">
        <span className="dropdown-item dropdown-header">
          6 Notificaciones
        </span>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item">
          <i className="fas fa-exclamation-triangle mr-2 text-warning" />
          <span>
            Alerta: Sensor analógico fuera de rango
          </span>
          <span className="float-right text-muted text-sm">hace 2 min</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item">
          <i className="fas fa-exclamation-circle mr-2 text-danger" />
          <span>
            Crítico: Sensor RS485 desconectado
          </span>
          <span className="float-right text-muted text-sm">hace 15 min</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item">
          <i className="fas fa-info-circle mr-2 text-info" />
          <span>
            Mantenimiento programado: Sensor analógico
          </span>
          <span className="float-right text-muted text-sm">hace 3 horas</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item">
          <i className="fas fa-check-circle mr-2 text-success" />
          <span>
            Sensor RS485 reconectado exitosamente
          </span>
          <span className="float-right text-muted text-sm">hace 5 horas</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/messages" className="dropdown-item">
          <i className="fas fa-envelope mr-2" />
          <span>
            Nuevo mensaje del equipo de soporte
          </span>
          <span className="float-right text-muted text-sm">hace 1 día</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item">
          <i className="fas fa-chart-line mr-2 text-primary" />
          <span>
            Reporte semanal de sensores disponible
          </span>
          <span className="float-right text-muted text-sm">hace 2 días</span>
        </Link>
        <div className="dropdown-divider" />
        <Link to="/dashboard" className="dropdown-item dropdown-footer">
          Ver todas las notificaciones
        </Link>
      </div>
    </NotificationMenu>
  );
};

export default NotificationsDropdown;
