import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { setWindowClass } from '@app/utils/helpers';
import { Form, InputGroup } from 'react-bootstrap';

import { setCurrentUser } from '@app/store/reducers/auth';
import { Button } from '@app/styles/common';
import { registerWithEmail } from '@app/services/auth';
import { useAppDispatch } from '@app/store/store';

const Register = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [t] = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const register = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const result = await registerWithEmail(email, password);
      dispatch(setCurrentUser(result?.user as any));
      toast.success('¡Registro exitoso!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error en el registro');
      setAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: '',
      password: '',
      passwordRetype: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .min(5, 'Debe tener al menos 5 caracteres')
        .required('Requerido'),
      password: Yup.string()
        .min(5, 'Debe tener al menos 5 caracteres')
        .max(30, 'Debe tener máximo 30 caracteres')
        .required('Requerido'),
      passwordRetype: Yup.string()
        .min(5, 'Debe tener al menos 5 caracteres')
        .max(30, 'Debe tener máximo 30 caracteres')
        .required('Requerido')
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir'),
    }),
    onSubmit: (values) => {
      register(values.email, values.password);
    },
  });

  setWindowClass('hold-transition register-page');

  return (
    <div className="register-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>Admin</b>
            <span>LTE</span>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">{t('register.registerNew')}</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Nombre de usuario"
                  onChange={handleChange}
                  value={values.email}
                  isValid={touched.email && !errors.email}
                  isInvalid={touched.email && !!errors.email}
                />
                {touched.email && errors.email ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-envelope" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  onChange={handleChange}
                  value={values.password}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="passwordRetype"
                  name="passwordRetype"
                  type="password"
                  placeholder="Confirmar contraseña"
                  onChange={handleChange}
                  value={values.passwordRetype}
                  isValid={touched.passwordRetype && !errors.passwordRetype}
                  isInvalid={touched.passwordRetype && !!errors.passwordRetype}
                />
                {touched.passwordRetype && errors.passwordRetype ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.passwordRetype}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="row">
              <div className="col-7">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" id="agreeTerms" />
                  <label htmlFor="agreeTerms" style={{ margin: 0, padding: 0, paddingLeft: '4px' }}>
                    <span>Acepto los </span>
                    <Link to="/">términos</Link>
                  </label>
                </div>
              </div>
              <div className="col-5">
                <Button
                  block
                  loading={isAuthLoading}
                  disabled={isAuthLoading}
                  onClick={handleSubmit as any}
                >
                  {t('register.label')}
                </Button>
              </div>
            </div>
          </form>

          <Link to="/login" className="text-center">
            {t('register.alreadyHave')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
