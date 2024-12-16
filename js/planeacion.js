import { elements } from './ui.js';
import db from './db.js';

class PlaneacionManager {
    constructor() {
        this.planeaciones = [];
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupFormEventListeners = this.setupFormEventListeners.bind(this);
        this.handlePlaneacionSubmit = this.handlePlaneacionSubmit.bind(this);
        this.deletePlaneacion = this.deletePlaneacion.bind(this);
        this.updatePlaneacionesContent = this.updatePlaneacionesContent.bind(this);
        this.createPlaneacionForm = this.createPlaneacionForm.bind(this);
        this.handleNewPlaneacion = this.handleNewPlaneacion.bind(this);
        this.handleEditPlaneacion = this.handleEditPlaneacion.bind(this);
        //this.loadInitialData();
        if (window.location.hash == "#planeaciones") {
            console.log('App: Loading initial data based on hash');
            this.loadInitialData();
        }
    }

    async loadInitialData() {
        try {
            this.planeaciones = await db.getAll('planeaciones');
            this.updatePlaneacionesContent();
        } catch (e) {
            console.error('Error loading initial data:', e);
        }
    }

    createEmptyPlaneacion() {
        return {
            id: Date.now(),
            fecha: '',
            tema: '',
            asignatura: '',
            periodosClase: 1,
            objetivo: '',
            encuadreId: '',
            momentos: {
                inicio: '',
                exploracion: '',
                transferencia: '',
                evaluacion: ''
            },
            observaciones: ''
        };
    }

    async handlePlaneacionSubmit(event, editingId = null) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const planeacion = editingId ? 
            await db.get('planeaciones', editingId) : 
            this.createEmptyPlaneacion();

        const updatedPlaneacion = {
            ...planeacion,
            fecha: formData.get('fecha'),
            tema: formData.get('tema'),
            asignatura: formData.get('asignatura'),
            periodosClase: parseInt(formData.get('periodosClase')),
            objetivo: formData.get('objetivo'),
            encuadreId: parseInt(formData.get('encuadreId')),
            momentos: {
                inicio: formData.get('inicio'),
                exploracion: formData.get('exploracion'),
                transferencia: formData.get('transferencia'),
                evaluacion: formData.get('evaluacion')
            },
            observaciones: formData.get('observaciones')
        };

        try {
            if (editingId) {
                await db.put('planeaciones', updatedPlaneacion);
                this.planeaciones = this.planeaciones.map(p => 
                    p.id === editingId ? updatedPlaneacion : p
                );
            } else {
                await db.add('planeaciones', updatedPlaneacion);
                this.planeaciones.push(updatedPlaneacion);
            }
            this.updatePlaneacionesContent();
        } catch (e) {
            console.error('Error saving planeacion:', e);
            alert('Error al guardar la planeación');
        }
    }

    async deletePlaneacion(id) {
        if (confirm('¿Está seguro de que desea eliminar esta planeación?')) {
            try {
                await db.delete('planeaciones', id);
                this.planeaciones = this.planeaciones.filter(planeacion => planeacion.id !== id);
                this.updatePlaneacionesContent();
            } catch (e) {
                console.error('Error deleting planeacion:', e);
                alert('Error al eliminar la planeación');
            }
        }
    }

    async createPlaneacionForm(planeacion = null) {
        const encuadres = await db.getAll('encuadres');
        const planesDeArea = await db.getAll('planesDeArea');

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">
                        ${planeacion ? 'Editar' : 'Crear'} Planeación
                    </h2>
                    <button id="btn-volver" class="text-gray-600 hover:text-gray-800">
                        Volver
                    </button>
                </div>

                <form id="planeacionForm" data-editing-id="${planeacion ? planeacion.id : ''}" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Fecha</label>
                            <input type="date" name="fecha" value="${planeacion ? planeacion.fecha : ''}" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tema</label>
                            <input type="text" name="tema" value="${planeacion ? planeacion.tema : ''}" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Asignatura</label>
                            <input type="text" name="asignatura" value="${planeacion ? planeacion.asignatura : ''}" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Periodos de clase</label>
                            <input type="number" name="periodosClase" min="1" value="${planeacion ? planeacion.periodosClase : '1'}" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Objetivo</label>
                        <textarea name="objetivo" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                  required>${planeacion ? planeacion.objetivo : ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Encuadre</label>
                        <select name="encuadreId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                            <option value="">Seleccione un encuadre</option>
                            ${encuadres.map(encuadre => {
                                const planArea = planesDeArea.find(p => p.id === encuadre.planDeAreaId);
                                return `
                                    <option value="${encuadre.id}" ${planeacion && planeacion.encuadreId === encuadre.id ? 'selected' : ''}>
                                        ${planArea ? `${planArea.asignatura} - Periodo ${encuadre.periodo}` : `Encuadre ${encuadre.id}`}
                                    </option>
                                `;
                            }).join('')}
                        </select>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-lg font-medium">Momentos de la Clase</h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Inicio</label>
                            <textarea name="inicio" rows="3" 
                                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                      required>${planeacion ? planeacion.momentos.inicio : ''}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Exploración</label>
                            <textarea name="exploracion" rows="3" 
                                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                      required>${planeacion ? planeacion.momentos.exploracion : ''}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Transferencia</label>
                            <textarea name="transferencia" rows="3" 
                                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                      required>${planeacion ? planeacion.momentos.transferencia : ''}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Evaluación</label>
                            <textarea name="evaluacion" rows="3" 
                                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                      required>${planeacion ? planeacion.momentos.evaluacion : ''}</textarea>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Observaciones</label>
                        <textarea name="observaciones" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${planeacion ? planeacion.observaciones : ''}</textarea>
                        <p class="mt-1 text-sm text-gray-500">Agregue observaciones al finalizar la clase</p>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button type="button" class="cancel-button px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            ${planeacion ? 'Actualizar' : 'Crear'} Planeación
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    async updatePlaneacionesContent() {
        const encuadres = await db.getAll('encuadres');
        const planesDeArea = await db.getAll('planesDeArea');

        elements.content.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-semibold text-gray-800">Planeaciones</h2>
                    <div class="space-x-2">
                        <button id="btn-exportar-planeacion" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            📤
                        </button>
                        <button id="btn-importar-planeacion" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                            📥
                        </button>
                        <button class="new-planeacion-button bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            ➕
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tema</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodos</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encuadre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.planeaciones.map(planeacion => {
                                const encuadre = encuadres.find(e => e.id === planeacion.encuadreId);
                                const planArea = encuadre ? planesDeArea.find(p => p.id === encuadre.planDeAreaId) : null;
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.fecha}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.asignatura}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.tema}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.periodosClase}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            ${planArea ? `${planArea.asignatura} - Periodo ${encuadre.periodo}` : 'N/A'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <button class="edit-button text-blue-600 hover:text-blue-900 mr-3" data-id="${planeacion.id}">
                                                Editar
                                            </button>
                                            <button class="delete-button text-red-600 hover:text-red-900" data-id="${planeacion.id}">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    async handleNewPlaneacion() {
        elements.content.innerHTML = await this.createPlaneacionForm();
        this.setupFormEventListeners();
    }

    async handleEditPlaneacion(id) {
        try {
            const planeacion = await db.get('planeaciones', id);
            if (planeacion) {
                elements.content.innerHTML = await this.createPlaneacionForm(planeacion);
                this.setupFormEventListeners();
            }
        } catch (e) {
            console.error('Error loading planeacion:', e);
            alert('Error al cargar la planeación');
        }
    }

    validatePlaneacion(planeacion) {
        const requiredFields = ['fecha', 'tema', 'asignatura', 'periodosClase', 'objetivo'];
        const requiredMomentos = ['inicio', 'exploracion', 'transferencia', 'evaluacion'];
        
        for (const field of requiredFields) {
            if (!planeacion[field]) return false;
        }
        
        if (!planeacion.momentos || typeof planeacion.momentos !== 'object') return false;
        for (const momento of requiredMomentos) {
            if (!planeacion.momentos[momento]) return false;
        }
        
        return true;
    }

    async promptEncuadreSelection() {
        const encuadres = await db.getAll('encuadres');
        const planesDeArea = await db.getAll('planesDeArea');

        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';
            dialog.innerHTML = `
                <div class="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                    <h3 class="text-lg font-medium mb-4">Seleccionar Encuadre</h3>
                    <p class="text-gray-600 mb-4">Seleccione el encuadre para asociar con esta planeación:</p>
                    <select id="encuadre-select" class="w-full p-2 border rounded mb-4">
                        <option value="">Seleccione un encuadre</option>
                        ${encuadres.map(encuadre => {
                            const planArea = planesDeArea.find(p => p.id === encuadre.planDeAreaId);
                            return `
                                <option value="${encuadre.id}">
                                    ${planArea ? `${planArea.asignatura} - Periodo ${encuadre.periodo}` : `Encuadre ${encuadre.id}`}
                                </option>
                            `;
                        }).join('')}
                    </select>
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-encuadre" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button id="confirm-encuadre" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Confirmar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            dialog.querySelector('#cancel-encuadre').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(null);
            });

            dialog.querySelector('#confirm-encuadre').addEventListener('click', () => {
                const encuadreId = parseInt(dialog.querySelector('#encuadre-select').value);
                document.body.removeChild(dialog);
                resolve(encuadreId);
            });
        });
    }

    setupEventListeners() {
        const content = elements.content;

        const newButton = content.querySelector('.new-planeacion-button');
        if (newButton) {
            newButton.addEventListener('click', () => this.handleNewPlaneacion());
        }

        content.querySelector('#btn-exportar-planeacion')?.addEventListener('click', async () => {
            try {
                const data = await db.getAll('planeaciones');
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'planeaciones.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error('Error exporting data:', e);
                alert('Error al exportar los datos');
            }
        });

        content.querySelector('#btn-importar-planeacion')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                try {
                    const file = e.target.files[0];
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    const planeaciones = Array.isArray(data) ? data : [data];

                    for (const planeacion of planeaciones) {
                        if (!this.validatePlaneacion(planeacion)) {
                            throw new Error('Formato de datos inválido');
                        }
                    }

                    for (const planeacion of planeaciones) {
                        const encuadreId = await this.promptEncuadreSelection();
                        if (encuadreId === null) {
                            throw new Error('Importación cancelada');
                        }
                        
                        await db.add('planeaciones', {
                            ...planeacion,
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            encuadreId
                        });
                    }
                    
                    this.planeaciones = await db.getAll('planeaciones');
                    this.updatePlaneacionesContent();
                    alert('Planeaciones importadas exitosamente');
                } catch (e) {
                    console.error('Error importing data:', e);
                    alert('Error al importar los datos: ' + e.message);
                }
            };
            input.click();
        });

        content.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.handleEditPlaneacion(id);
            });
        });

        content.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.deletePlaneacion(id);
            });
        });
    }

    setupFormEventListeners() {
        const form = elements.content.querySelector('#planeacionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                const editingId = form.dataset.editingId;
                this.handlePlaneacionSubmit(e, editingId ? parseInt(editingId) : null);
            });

            const cancelButton = form.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    this.updatePlaneacionesContent();
                });
            }

            const backButton = elements.content.querySelector('#btn-volver');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.updatePlaneacionesContent();
                });
            }
        }
    }
}

const planeacionManager = new PlaneacionManager();
export const { updatePlaneacionesContent } = planeacionManager;
export default planeacionManager;
