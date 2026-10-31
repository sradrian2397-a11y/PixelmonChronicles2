import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.scss';
import { ENV } from '../utils/env.js';
import { FaCheck, FaGift, FaLock } from 'react-icons/fa';
import GachaPanel from '../components/GachaPanel'; // <-- AÑADE ESTE IMPORT


function Home() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [rewardsConfig, setRewardsConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGAR DATOS (Con Token JWT)
  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Si no hay token, no hacemos nada (el ProtectedRoute debería echarlo)

        // Enviamos el token en el header Authorization
        const response = await axios.get(`${ENV.REACT_APP_BACKEND_URL}/api/streak`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentStreak(response.data.currentStreak);
        setClaimedRewards(response.data.claimedRewards);
        setRewardsConfig(response.data.rewardsConfig);
      } catch (error) {
        console.error("Error cargando racha:", error);
        if(error.response?.status === 401) {
            // Token caducado
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreakData();
  }, []);

  // Lógica de semanas
  const currentWeek = Math.ceil(Math.max(1, currentStreak) / 7);
  const startDayOfWeek = (currentWeek - 1) * 7 + 1;
  const visibleDays = Array.from({ length: 7 }, (_, i) => startDayOfWeek + i);

  // 2. FUNCIÓN PARA RECLAMAR (Con Token JWT)
  const handleClaim = async (dayToClaim) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${ENV.REACT_APP_BACKEND_URL}/api/streak/claim`, 
        { dayToClaim },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setClaimedRewards(response.data.claimedRewards);
    } catch (error) {
      alert(error.response?.data?.message || "Error al reclamar");
    }
  };

  if (isLoading) return <div className="text-white text-center mt-5">Cargando datos...</div>;

  return (
    <div className="home-ct d-flex flex-column align-content-center align-items-center mt-4" >
      <div className='home-menu p-4 col-10 '>
        
        {/* FILA 1 */}
        <div className="menu-row one p-4">
          <p className='m-0'>
            Hola entrenadores, soy <strong className='arceus'>Arceus</strong>, el creador de todo, algunos ya sabreis quien soy pero los nuevos quizas no, han pasado muchas cosas asi que os haré un brebe resumen.
            <br />
            <br />
            Todo empezó cuando creé el multiverso. En el centro de este, en la oscuridad profunda, la maldad de todos los universos engendró un huevo de tonos muy oscuros que no reflejaba ni una pizca de luz. Ciertos hijos míos se rebelaron y me vi obligado a invocar a 12 personas para que pudieran prevenir el nacimiento de ese ser. Pero uno de mis hijos que se rebelaron fue a esa dimensión a entorpecer la misión que les encomendé a los Entrenadores: <strong className='darkrai'>Darkrai</strong>, aquel al que le encargué la dimensión de las Pesadillas, ganó y con ello sumergió a los 12 Entrenadores en numerosas pesadillas. Con mi poder solo pude despertar a unos pocos e invocar a otros. Para ayudaros en esta misión, os pude enviar a mi hija <strong className='cresselia'>Cresselia</strong>.
            <br />
            <br />
            Por ahora, trabajad en equipo. Despertad y pelead entre vosotros para pulir vuestras estrategias y fortalecer los lazos con vuestros compañeros.
          </p>
        </div>

        {/* FILA 2 */}
        <div className='row'>
          
          <div className='col-12 col-md-10 mb-3 mb-md-0'>
            <div className='menu-row p-4 h-100 streak-container'>
              
              {/* CABECERA DE LA RACHA */}
              <div className="streak-header mb-4">
                <h3 className="m-0">🔥INICIO DE SESIÓN DIARIO</h3>
                <p className="m-0">¡Entra cada día para reclamar recompensas épicas!</p>
              </div>

              {/* BLOQUES DE DÍAS */}
              <div className="streak-list">
                {visibleDays.map((day) => {
                  const isClaimed = claimedRewards.includes(day);
                  const isUnlocked = day <= currentStreak;
                  let status = 'locked';
                  if (isClaimed) status = 'completed';
                  else if (isUnlocked) status = 'today';

                  const dayReward = rewardsConfig.find(r => r.day === day);

                  return (
                    <div key={day} className={`streak-row ${status}`}>
                      <div className="day-number">{day}</div>
                      <div className="day-info">
                        <h4>DÍA {day}</h4>
                        <p>
                          {isClaimed 
                            ? 'Recompensa ya reclamada'
                            : (isUnlocked
                              ? (dayReward ? dayReward.reward_text : 'Recompensas sorpresa')
                              : 'Recompensa Sorpresa 🔒')}
                        </p>
                      </div>

                      <div className="day-action">
                        {isClaimed && <span className="btn-claimed"><FaCheck /> CANJEADO</span>}
                        {!isClaimed && isUnlocked && (
                          <button className="btn-claim" onClick={() => handleClaim(day)}>
                            <FaGift /> CANJEAR
                          </button>
                        )}
                        {!isUnlocked && <span className="btn-locked"><FaLock /> BLOQUEADO</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className='col-12 col-md-2'>
            <div className='menu-row right p-4 h-100'>
              <GachaPanel />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;