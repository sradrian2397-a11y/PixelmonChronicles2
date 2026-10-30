import '../styles/FormLogin.scss';
import { useState } from 'react';
import { ENV } from '../utils/env.js';
import axios from 'axios';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import { ButtonPerso } from './BotonPerso';


export default function FormLogin() {

    const [isLoading, setIsLoading] = useState(false);
    const [errorLoginMessage, setErrorLoginMessage] = useState('');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fetchLoginUsuario = async (credenciales) => {
        setIsLoading(true);
        setErrorLoginMessage('');

        try {
            const response = await axios.post(`${ENV.REACT_APP_BACKEND_URL}/api/auth/login`, 
                credenciales,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,

                }
            );

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
            return response.data;

        } catch (error) {
            console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);

            if (error.response){

                if (error.response.status === 400) {
                    setErrorLoginMessage(`❌ Campos incompletos.`);
                } else if (error.response.status === 401) {
                    setErrorLoginMessage(`❌ Usuario o contraseña incorrectos.`);
                } else {
                    setErrorLoginMessage(`❌ Error al iniciar sesión.`);
                }
            } else if (error.code === 'ERR_NETWORK') {
                setErrorLoginMessage(`❌ Error de red. Por favor, verifica tu conexión.`);
            } else {
                setErrorLoginMessage(`❌ Error de conexión.`);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const validateLogin = async (e) => {
        e.preventDefault();

        const username = loginUsername;
        const password = loginPassword;
        
        if (!username || !password) {
            setErrorLoginMessage(`❌ Por favor, completa todos los campos.`);
            return;
        }

        const credenciales = {
            usuario: username,
            password: password
        };
        
        try {
            await fetchLoginUsuario(credenciales);
        } catch (error) {}
    };


    return (
        <div className="login-ct container-fluid d-flex align-items-center justify-content-center">
            <div className="row justify-content-center w-100">
                <div className='col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4 col-xxl-4'>

                    {/* --- ENCABEZADO (FUERA DE LA COLUMNA) --- */}
                    <div className="header-container">
                        <div className="logo-title-wrapper">
                            <img className="logo-icon" src="/img/icono.png" alt="Icono Pixelmon" />
                            <h1 className="main-title">PIXELMON CHRONICLES 2</h1>
                        </div>
                    </div>
                    
                    <div className="separator"></div>
                    {/* --------------------------------------- */}

                    <div className='form-ct'>
                        <form onSubmit={validateLogin}>
                            <h2 className="mb-4">Iniciar Sesión</h2>

                            {errorLoginMessage && (
                                <div className="error-message mb-3">
                                    {errorLoginMessage}
                                </div>
                            )}

                            <div className="d-flex flex-column gap-2">
                                <div className="floating-input-container">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder=" "
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        disabled={isLoading}
                                        className="floating-input"
                                    />
                                    <label className="floating-label">Usuario</label>
                                </div>

                                <div className='floating-input-container password-container'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder=" "
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="floating-input"
                                    />
                                    <label className="floating-label">
                                        Contraseña
                                    </label>
                                    <button
                                        type="button"
                                        className='password-toggle'
                                        onClick={() => setShowPassword (!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye /> }
                                    </button>
                                </div>
                            </div>

                            <div className='d-flex justify-content-center mt-xxl-3 mt-xl-2 mb-0 gap-2'>
                                <ButtonPerso
                                    text="INICIAR SESION"
                                    loadingText="INICIANDO..."
                                    type="submit"
                                    isLoading={isLoading}
                                    fullWidth={true}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
