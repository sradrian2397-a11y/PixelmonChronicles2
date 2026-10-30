import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.scss';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaShoppingBag, FaShoppingCart, FaImage, FaGift } from "react-icons/fa";
import { MdOutlineCatchingPokemon } from "react-icons/md";
import { CgPokemon } from "react-icons/cg";
import { TbBrandMinecraft } from "react-icons/tb";
import { RiAdminFill } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";

export default function Navbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    
    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    const userString = localStorage.getItem('user');
    let user = null;
    try {
        if (userString) user = JSON.parse(userString);
    } catch (e) {
        console.error("Error al leer el usuario", e);
    }

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && 
                menuRef.current && !menuRef.current.contains(event.target) &&
                toggleRef.current && !toggleRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className={`navbar container-fluid px-3 px-md-4 ${scrolled ? 'scrolled' : ''} d-flex flex-row justify-content-center`}>
            <div className="d-flex col-12 col-xxl-10 justify-content-between align-items-center">
                
                {/* Logo - izquierda */}
                <div className="d-flex flex-wrap align-items-center">
                    <Link to="/"><img className="logo p-1" src="/img/icono.png" alt="" title='Multiserver'/></Link>
                </div>

                {/* Hamburguesa - Solo móvil/tablet */}
                <div className="mobile-menu-toggle d-flex d-lg-none align-items-center" ref={toggleRef}>
                    <input 
                        id="checkbox" 
                        type="checkbox" 
                        checked={menuOpen}
                        onChange={toggleMenu}
                    />
                    <label className="toggle" htmlFor="checkbox">
                        <div id="bar1" className="bars"></div>
                        <div id="bar2" className="bars"></div>
                        <div id="bar3" className="bars"></div>
                    </label>
                </div>

                {/* Menú Desktop - Oculto en móvil (d-none d-lg-flex) */}
                <div className="desktop-menu d-none d-lg-flex flex-wrap align-items-center justify-content-end"> 

                    <Link to="/Account" className="menubtn d-flex px-3 p-2 align-items-center ">
                        <FaUser />
                        <h5 className="m-0 ms-2">CUENTA</h5>
                    </Link>

                    <Link to="/Pokedex" className="menubtn d-flex px-3 p-2 align-items-center ">
                        <MdOutlineCatchingPokemon />
                        <h5 className="m-0 ms-2">POKÉDEX</h5>
                    </Link>

                    <div className="dropdown p-2">
                        <button className="dropbtn d-flex flex-row px-3 align-items-center">
                            <FaShoppingBag/>
                            <h5 className="m-0 ms-2"> TIENDAS ▼</h5>
                        </button>
                        <div className="dropdown-content">
                            <Link to="/pixelmonstore" className="d-flex px-3 align-items-center ">
                                <CgPokemon />
                                <h5 className="m-0 ms-2">PIXELMON</h5>
                            </Link>
                            <Link to="/minecraftstore" className="d-flex px-3 align-items-center ">
                                <TbBrandMinecraft />
                                <h5 className="m-0 ms-2">MINECRAFT</h5>
                            </Link>
                            <Link to="/carrito" className="d-flex px-3 align-items-center ">
                                <FaShoppingCart />
                                <h5 className="m-0 ms-2">CARRITO</h5>
                            </Link>
                        </div>
                    </div>

                    <div className="dropdown p-2">
                        {user?.rol === 'administrador' && (
                            <>
                                <button className="dropbtn d-flex flex-row px-3 align-items-center">
                                    <RiAdminFill />
                                    <h5 className="m-0 ms-2"> ADMIN ▼</h5>
                                </button>
                                <div className="dropdown-content">
                                    <Link to="/pixelmonstore" className="d-flex px-3 align-items-center ">
                                        <FaImage />
                                        <h5 className="m-0 ms-2">IMAGENES</h5>
                                    </Link>
                                    <Link to="/minecraftstore" className="d-flex px-3 align-items-center ">
                                        <FaUser />
                                        <h5 className="m-0 ms-2">USUARIOS</h5>
                                    </Link>
                                    <Link to="/admin/streak" className="d-flex px-3 align-items-center">
                                        <FaGift /> 
                                        <h5 className="m-0 ms-2">LOGIN DIARIO</h5>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    <button onClick={handleLogout} className='menubtn d-flex px-3 p-3 align-items-center' title='Cerrar Sesión'>
                        <FiLogOut/>
                    </button>
                </div>

                {/* Menú Móvil */}
                <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                    {/* NUEVO ENVOLTORIO AQUÍ */}
                    <div className="mobile-menu-content d-flex flex-column">
                        <Link to="/Account" className="mobile-item" onClick={closeMenu}>
                            <FaUser /> <span>CUENTA</span>
                        </Link>
                        <Link to="/Pokedex" className="mobile-item" onClick={closeMenu}>
                            <MdOutlineCatchingPokemon /> <span>POKÉDEX</span>
                        </Link>
                        
                        <div className="mobile-item-header">
                            <FaShoppingBag /> <span>TIENDAS</span>
                        </div>
                        <div className="mobile-submenu">
                            <Link to="/pixelmonstore" onClick={closeMenu}>Pixelmon</Link>
                            <Link to="/minecraftstore" onClick={closeMenu}>Minecraft</Link>
                            <Link to="/carrito" onClick={closeMenu}>Carrito</Link>
                        </div>

                        {user?.rol === 'administrador' && (
                            <>
                                <div className="mobile-item-header">
                                    <RiAdminFill /> <span>ADMIN</span>
                                </div>
                                <div className="mobile-submenu">
                                    <Link to="/pixelmonstore" onClick={closeMenu}>Imágenes</Link>
                                    <Link to="/minecraftstore" onClick={closeMenu}>Usuarios</Link>
                                    <Link to="/admin/streak" onClick={closeMenu}>Login Diario</Link>
                                </div>
                            </>
                        )}

                        <button onClick={handleLogout} className='mobile-item btn-logout'>
                            <FiLogOut /> <span>CERRAR SESIÓN</span>
                        </button>
                    </div>
                    {/* FIN DEL ENVOLTORIO */}
                </div>

                {/* Overlay oscuro de fondo en móvil */}
                {menuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
            </div>
        </nav>
    );
}