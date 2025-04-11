import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import packageJSON from '../../../../package.json';

const Footer = ({
  style = {},
  containered,
}: {
  style?: any;
  containered?: boolean;
}) => {
  const [t] = useTranslation();

  return (
    <footer className="main-footer" style={{ ...style }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        className={containered ? 'container' : ''}
      >
        <div>
          <strong>
            <span>© {DateTime.now().toFormat('y')} </span>
            <span>SPK IoT - Sistema de Monitoreo Industrial</span>
          </strong>
          <span className="ml-1">- Desarrollado por Sparkling Data</span>
        </div>
        <div className="float-right d-none d-sm-inline-block">
          <span className="mr-2">Soporte técnico: soporte@sparklingdata.com</span>
          <b>Versión</b>
          <span>&nbsp;{packageJSON.version}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
