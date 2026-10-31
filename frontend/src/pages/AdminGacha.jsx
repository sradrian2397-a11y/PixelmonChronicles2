import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENV } from '../utils/env.js';
import '../styles/AdminStreak.scss'; 

export default function AdminGacha() {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [deleteTarget, setDeleteTarget] = useState(null);
    
    // Formulario simplificado
    const [formData, setFormData] = useState({ 
        id: null, name: '', rareza: 'Comun', peso: 10, imagen: '', comando_mc: ''
    });

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${ENV.REACT_APP_BACKEND_URL}/api/gacha/manage`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, name: '', rareza: 'Comun', peso: 10, imagen: '', comando_mc: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${ENV.REACT_APP_BACKEND_URL}/api/gacha/manage`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar');
        }
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${ENV.REACT_APP_BACKEND_URL}/api/gacha/manage/${deleteTarget}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteTarget(null);
            fetchItems();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="home-ct d-flex flex-column align-items-center mt-4">
            <div className="home-menu p-4 col-10 admin-streak-ct">
                <h2 className="admin-title">CATÁLOGO DE GACHAPÓN</h2>
                <p style={{ color: '#a0aec0', textAlign: 'center', marginBottom: '20px' }}>
                    Los ítems se asignan automáticamente a las Keys según su rareza.
                </p>
                
                <button className="btn-add" onClick={openAddModal}>
                    + Añadir Nuevo Ítem
                </button>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Rareza</th>
                                <th>Peso (%)</th>
                                <th>Imagen</th>
                                <th>Comando</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.rareza}</td>
                                    <td>{item.peso}</td>
                                    <td>{item.imagen}</td>
                                    <td style={{ fontSize: '0.8rem', color: '#a78bfa' }}><code>{item.comando_mc}</code></td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-edit" onClick={() => openEditModal(item)}>Editar</button>
                                            <button className="btn-delete" onClick={() => setDeleteTarget(item.id)}>Eliminar</button>
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
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <h3>{modalMode === 'add' ? 'Añadir Ítem al Catálogo' : `Editar Ítem: ${formData.name}`}</h3>
                        <form onSubmit={handleSave} className="row">
                            
                            <div className="col-md-6 form-group">
                                <label>Nombre del Ítem</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Rareza</label>
                                <select className="form-select bg-dark text-white border-secondary" value={formData.rareza} onChange={(e) => setFormData({...formData, rareza: e.target.value})}>
                                    <option value="Comun">Común (Gris)</option>
                                    <option value="Poco Comun">Poco Común (Verde)</option>
                                    <option value="Rara">Rara (Azul)</option>
                                    <option value="Muy Rara">Muy Rara (Morada)</option>
                                    <option value="Mitica">Mítica (Naranja)</option>
                                </select>
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Peso Interno (Probabilidad dentro de su rareza)</label>
                                <input type="number" value={formData.peso} onChange={(e) => setFormData({...formData, peso: e.target.value})} required />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Nombre Imagen (ej: ball.png)</label>
                                <input type="text" value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})} required />
                            </div>

                            <div className="col-12 form-group">
                                <label>Comando de Minecraft (usa %player% para el nombre)</label>
                                <input type="text" value={formData.comando_mc} onChange={(e) => setFormData({...formData, comando_mc: e.target.value})} placeholder="Ej: /give %player% pixelmon:poke_ball 5" required />
                            </div>

                            <div className="col-12 modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirm">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE ELIMINAR */}
            {deleteTarget !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ color: '#f56565 !important' }}>¿Eliminar Ítem del Catálogo?</h3>
                        <p>¿Estás seguro de que quieres borrar este ítem? Dejará de salir en todas las Keys automáticamente.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                            <button className="btn-confirm-delete" onClick={confirmDelete}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}