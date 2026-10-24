// src/components/BotonPerso.jsx
import '../styles/BotonPerso.scss';

// src/components/BotonPerso.jsx
export const ButtonPerso = ({ 
  text, 
  loadingText, 
  type = "button", 
  onClick, 
  isLoading = false,
  fullWidth = false,
  className = ""   // ← se recibe correctamente
}) => {
  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick();
    }
  };

  return (
    <div className={`boton-wrapper ${fullWidth ? 'boton-wrapper-full' : ''} ${className}`}>
      <button 
        type={type}
        onClick={handleClick}
        className={`boton-gradiente ${fullWidth ? 'boton-gradiente-full' : ''}`}
        disabled={isLoading}
      >
        <div className="sombra-glow"></div>
        <span className="boton-texto">
          {isLoading ? (loadingText || text) : text}
        </span>
        {!isLoading && (
          <svg 
            className="boton-flecha" 
            viewBox="0 0 24 24" 
            width="20" 
            height="20" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M5 12h14" className="flecha-linea" />
            <path d="M12 5l7 7-7 7" className="flecha-punta" />
          </svg>
        )}
      </button>
    </div>
  );
};