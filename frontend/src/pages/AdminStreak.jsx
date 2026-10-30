import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENV } from '../utils/env.js';
import '../styles/AdminStreak.scss';

export default function AdminStreak() {
    const [rewards, setRewards] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [formData, setFormData] = useState({ day: '', reward_text: '', reward_data: '' });

    const fetchRewards = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${ENV.REACT_APP_BACKEND_URL}/api/streak`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRewards(res.data.rewardsConfig);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        const nextDay = rewards.length > 0 ? Math.max(...rewards.map(r => r.day)) + 1 : 1;
        setFormData({ day: nextDay, reward_text: '', reward_data: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (reward) => {
        setModalMode('edit');
        
        // Al editar, intentamos convertir el JSON de la BD a un formato amigable de texto
        let friendlyData = reward.reward_data;
        try {
            const parsed = JSON.parse(reward.reward_data);
            friendlyData = Object.entries(parsed).map(([key, val]) => `${key}: ${val}`).join(', ');
        } catch (e) {

        }

        setFormData({
            day: reward.day,
            reward_text: reward.reward_text,
            reward_data: friendlyData
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        let finalJson = formData.reward_data.trim();
        
        if (!finalJson.startsWith('{')) {
            try {
                const obj = {};
                // Separamos por comas
                finalJson.split(',').forEach(item => {
                    const parts = item.split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const rawValue = parts.slice(1).join(':').trim(); 
                        
                        obj[key] = isNaN(rawValue) ? rawValue : Number(rawValue);
                    }
                });
                finalJson = JSON.stringify(obj);
            } catch (error) {
                alert("Error al formatear los datos. Usa el formato 'item: cantidad'.");
                return;
            }
        } else {
            try {
                JSON.parse(finalJson);
            } catch (err) {
                alert("El JSON no es válido. Revisa las comillas o llaves.");
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${ENV.REACT_APP_BACKEND_URL}/api/streak/manage`, {
                ...formData,
                reward_data: finalJson
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchRewards();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar');
        }
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${ENV.REACT_APP_BACKEND_URL}/api/streak/manage/${deleteTarget}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteTarget(null);
            fetchRewards();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="home-ct d-flex flex-column align-items-center mt-4">
            <div className="home-menu p-4 col-10 admin-streak-ct">
                <h2 className="admin-title">ADMINISTRACIÓN DE LOGIN DIARIO</h2>
                
                <button className="btn-add" onClick={openAddModal}>
                    + Añadir Nuevo Día
                </button>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Texto Visible</th>
                                <th>Datos del Bot (JSON)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewards.map((r) => (
                                <tr key={r.day}>
                                    <td>{r.day}</td>
                                    <td>{r.reward_text}</td>
                                    <td><code style={{ color: '#a78bfa' }}>{r.reward_data}</code></td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-edit" onClick={() => openEditModal(r)}>
                                                Editar
                                            </button>
                                            <button className="btn-delete" onClick={() => setDeleteTarget(r.day)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE AÑADIR / EDITAR */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{modalMode === 'add' ? 'Añadir Recompensa' : `Editar Día ${formData.day}`}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Día (Número)</label>
                                <input 
                                    type="number" 
                                    value={formData.day}
                                    readOnly
                                    style={{ opacity: 0.7 }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Texto Visible (Lo que ve el usuario)</label>
                                <input 
                                    type="text" 
                                    value={formData.reward_text}
                                    onChange={(e) => setFormData({...formData, reward_text: e.target.value})}
                                    required
                                    placeholder="Ej: 100 Pokécoins y 5 Ultraballs"
                                />
                            </div>
                            <div className="form-group">
                                <label>JSON</label>
                                <input 
                                    type="text" 
                                    value={formData.reward_data}
                                    onChange={(e) => setFormData({...formData, reward_data: e.target.value})}
                                    placeholder="Ej: coins: 100, ultraballs: 5"
                                    required
                                />
                                <small style={{ color: '#718096', display: 'block', marginTop: '5px', fontSize: '0.8rem' }}>
                                    Escribe "objeto: cantidad" separado por comas. El sistema lo convertirá a JSON automáticamente.
                                </small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-confirm">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN DE ELIMINAR */}
            {deleteTarget !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ color: '#f56565 !important' }}>¿Eliminar Día {deleteTarget}?</h3>
                        <p>
                            ¿Estás seguro de que quieres borrar esta recompensa? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                                Cancelar
                            </button>
                            <button className="btn-confirm-delete" onClick={confirmDelete}>
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}