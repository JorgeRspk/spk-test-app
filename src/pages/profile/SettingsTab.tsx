import { Button } from '@profabric/react-components';
import { Link } from 'react-router-dom';

const SettingsTab = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className={`tab-pane ${isActive ? 'active' : ''}`}>
      <form className="form-horizontal">
        <div className="form-group row">
          <label htmlFor="inputName" className="col-sm-2 col-form-label">
            Nombre
          </label>
          <div className="col-sm-10">
            <input
              type="email"
              className="form-control"
              id="inputName"
              placeholder="Nombre"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputName" className="col-sm-2 col-form-label">
            Apellido
          </label>
          <div className="col-sm-10">
            <input
              type="email"
              className="form-control"
              id="inputName"
              placeholder="Apellido"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputEmail" className="col-sm-2 col-form-label">
            Email
          </label>
          <div className="col-sm-10">
            <input
              type="email"
              className="form-control"
              id="inputEmail"
              placeholder="Email"
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="inputName" className="col-sm-2 col-form-label">
            Telefono celular
          </label>
          <div className="col-sm-10">
            <input
              type="phone"
              className="form-control"
              id="inputName"
              placeholder="123456789"
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="offset-sm-2 col-sm-10">
            <div className="icheck-primary">
              <input
                type="checkbox"
                id="agreeTerms"
                name="terms"
                defaultValue="agree"
              />
              <label htmlFor="agreeTerms">
                <span>I agree to the </span>
                <Link to="/">terms and condition</Link>
              </label>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="offset-sm-2 col-sm-10">
            <Button variant="danger">Submit</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;
