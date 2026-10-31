import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENV } from '../utils/env.js';
import '../styles/GachaPanel.scss';
import { FaKey } from 'react-icons/fa';

export default function GachaPanel() {
    const [keys, setKeys] = useState({ Key1: 0, Key2: 0, Key3: 0, Key4: 0 });
    
    const [spinning, setSpinning] = useState(false);
    const [spinItems, setSpinItems] = useState([]);
    const [translateX, setTranslateX] = useState(0);
    const [wonItem, setWonItem] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [rollId, setRollId] = useState(0);
    const [lineOffset, setLineOffset] = useState(0); 

    const isRollingRef = useRef(false);

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${ENV.REACT_APP_BACKEND_URL}/api/gacha/keys`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setKeys(res.data);
            } catch (error) {
                console.error("Error cargando llaves:", error);
            }
        };
        fetchKeys();
    }, []);

    const handleRoll = async (keyType) => {
        if (isRollingRef.current) return; 
        
        if (keys[`Key${keyType}`] <= 0) {
            alert("No tienes llaves de esta rareza. ¡Ve a la tienda!");
            return;
        }

        isRollingRef.current = true;
        setSpinning(true);
        setShowResult(false);
        setWonItem(null);
        setTranslateX(0); 
        setRollId(prev => prev + 1);

        // 🔥 SOLUCIÓN 1: Definimos las rarezas permitidas según la llave directamente en el Frontend.
        // Así es imposible que salga una Mítica en la Key 1.
        const rarityMap = {
            1: ['Comun', 'Poco Comun'],
            2: ['Poco Comun', 'Rara'],
            3: ['Rara', 'Muy Rara', 'Mitica'],
            4: ['Muy Rara', 'Mitica']
        };
        const allowedRarities = rarityMap[keyType] || ['Comun'];

        try {
            const token = localStorage.getItem('token');
            
            const res = await axios.post(`${ENV.REACT_APP_BACKEND_URL}/api/gacha/roll`, 
                { keyType }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const realItem = res.data.item;

            // Generamos la tira de 50 ítems usando SOLO las rarezas permitidas
            const fakeItems = Array.from({ length: 50 }).map((_, i) => ({
                id: `fake-${i}`,
                name: '...',
                imagen: 'icono.png',
                rareza: allowedRarities[Math.floor(Math.random() * allowedRarities.length)]
            }));

            const winnerIndex = 45;
            const finalItems = [...fakeItems];
            finalItems[winnerIndex] = realItem;
            setSpinItems(finalItems);

            // 🔥 DETECCIÓN DEL TAMAÑO DE PANTALLA PARA LA ANIMACIÓN
            const isMobile = window.innerWidth <= 768;
            const itemWidth = isMobile ? 120 : 170; // 100px + 20 de margen vs 140 + 30 de margen
            const containerWidth = isMobile ? (window.innerWidth * 0.95) : 1100;
            const centerOffset = containerWidth / 2; 
            
            const randomOffset = (Math.random() * 120) - 60; 
            const targetPosition = (winnerIndex * itemWidth) - centerOffset + randomOffset;
            
            setTimeout(() => {
                setTranslateX(-targetPosition);
            }, 100);

            setTimeout(() => {
                setSpinning(false);
                setWonItem(realItem);
                setShowResult(true);
                setKeys(prev => ({ ...prev, [`Key${keyType}`]: prev[`Key${keyType}`] - 1 }));
                isRollingRef.current = false;
            }, 5500);

        } catch (error) {
            alert(error.response?.data?.message || "Error al tirar");
            setSpinning(false);
            isRollingRef.current = false;
        }
    };

    return (
        <div className="gacha-widget">
            <div className="gacha-header mb-4">
                <h3 className="gacha-title">🎰 GACHAPÓN</h3>
                <p className="gacha-subtitle">¡Prueba tu suerte!</p>
            </div>
            
            <div className="gacha-buttons">
                {[1, 2, 3, 4].map(keyNum => (
                    <button 
                        key={keyNum} 
                        className={`gacha-btn key-${keyNum}`}
                        onClick={() => handleRoll(keyNum)}
                        disabled={spinning}
                    >
                        <div className="btn-icon"><FaKey /></div>
                        <div className="btn-text">
                            <span>GACHA {keyNum}</span>
                            {keys[`Key${keyNum}`] > 0 ? (
                                <small>Tienes {keys[`Key${keyNum}`]} Llaves</small>
                            ) : (
                                <small style={{color: '#f56565'}}>Comprar Llave</small>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {(spinning || showResult) && (
                <div className="gacha-overlay">
                    
                    {spinning && (
                        <div className="roulette-container">
                            {/* La flecha se mueve con el lineOffset */}
                            <div className="roulette-center-line"></div>
                            
                            <div 
                                key={rollId} 
                                className="roulette-track" 
                                style={{ transform: `translateX(${translateX}px)` }}
                            >
                                {spinItems.map((item, index) => (
                                    <div key={index} className={`roulette-item rareza-${item.rareza.replace(' ', '')}`}>
                                        <img src={`/img/gacha/${item.imagen}`} alt={item.name} onError={(e) => e.target.src='/img/icono.png'} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showResult && wonItem && (
                        <div className="result-modal">
                            <h2>¡ENHORABUENA!</h2>
                            <p>Has ganado:</p>
                            <div className={`result-item-box rareza-${wonItem.rareza.replace(' ', '')}`}>
                                <img src={`/img/gacha/${wonItem.imagen}`} alt={wonItem.name} onError={(e) => e.target.src='/img/icono.png'} />
                                <h3>{wonItem.name}</h3>
                                <span>{wonItem.rareza}</span>
                            </div>
                            <p className="result-note">El objeto será enviado a tu inventario.</p>
                            <button className="btn-claim-close" onClick={() => setShowResult(false)}>
                                ¡Genial!
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}