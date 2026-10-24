import { Link} from 'react-router-dom';
import '../styles/Navbar.scss';
import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
import { FaUser, FaShoppingBag, FaShoppingCart } from "react-icons/fa";
import { MdOutlineCatchingPokemon } from "react-icons/md";
import { CgPokemon } from "react-icons/cg";
import { TbBrandMinecraft } from "react-icons/tb";


export default function Navbar() {
    // const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    // const [menuOpen, setMenuOpen] = useState(false);
    // const [submenuOpen, setSubmenuOpen] = useState({});
    // const { isAuthenticated, logout } = useAuth();
    // const [isLoading, setIsLoading] = useState(false);

    // const menuRef = useRef(null);
    // const toggleRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (menuOpen && 
    //             menuRef.current && 
    //             !menuRef.current.contains(event.target) &&
    //             toggleRef.current &&
    //             !toggleRef.current.contains(event.target)) {
    //             closeMenu();
    //         }
    //     };
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, [menuOpen]);

    // const handleLogout = () => {
    //     logout();
    // };

    // const toggleMenu = () => {
    //     setMenuOpen(!menuOpen);
    // };

    // const closeMenu = () => {
    //     setMenuOpen(false);
    //     setSubmenuOpen({});
    // };

    // const toggleSubmenu = (name) => {
    //     setSubmenuOpen(prev => ({
    //         ...prev,
    //         [name]: !prev[name]
    //     }));
    // };

    return (
        <nav className={`navbar container-fluid ${scrolled ? 'scrolled' : ''} d-flex flex-row justify-content-center`}>
            <div className="d-flex col-12 col-xxl-10 justify-content-between align-items-center">
                
                {/* Logo - izquierda */}
                <div className="d-flex flex-wrap align-items-center">
                    <Link to="/"><img className="logo p-1" src="/img/icono.png" alt="" title='Multiserver'/></Link>
                </div>

                {/* Menú Desktop */}
                <div className="desktop-menu d-lg-flex flex-wrap align-items-center justify-content-end"> 

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


                </div>
            </div>
        </nav>
    );
}