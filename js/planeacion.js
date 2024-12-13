import { sampleData } from './dummy_data.js';
import { elements } from './ui.js';

class PlaneacionManager {
    constructor() {
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupFormEventListeners = this.setupFormEventListeners.bind(this);
        this.handlePlaneacionSubmit = this.handlePlaneacionSubmit.bind(this);
        this.deletePlaneacion = this.deletePlaneacion.bind(this);
        this.updatePlaneacionesContent = this.updatePlaneacionesContent.bind(this);
        this.createPlaneacionForm = this.createPlaneacionForm.bind(this);
        this.handleNewPlaneacion = this.handleNewPlaneacion.bind(this);
        this.handleEditPlaneacion = this.handleEditPlaneacion.bind(this);
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

    handlePlaneacionSubmit(event, editingId = null) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const planeacion = editingId ? 
            sampleData.planeaciones.find(p => p.id === editingId) : 
            this.createEmptyPlaneacion();

        planeacion.fecha = formData.get('fecha');
        planeacion.tema = formData.get('tema');
        planeacion.asignatura = formData.get('asignatura');
        planeacion.periodosClase = parseInt(formData.get('periodosClase'));
        planeacion.objetivo = formData.get('objetivo');
        planeacion.encuadreId = parseInt(formData.get('encuadreId'));
        planeacion.momentos = {
            inicio: formData.get('inicio'),
            exploracion: formData.get('exploracion'),
            transferencia: formData.get('transferencia'),
            evaluacion: formData.get('evaluacion')
        };
        planeacion.observaciones = formData.get('observaciones');

        if (!editingId) {
            sampleData.planeaciones.push(planeacion);
        }

        this.updatePlaneacionesContent();
    }

    deletePlaneacion(id) {
        if (confirm('¿Está seguro de que desea eliminar esta planeación?')) {
            sampleData.planeaciones = sampleData.planeaciones.filter(planeacion => planeacion.id !== id);
            this.updatePlaneacionesContent();
        }
    }

    createPlaneacionForm(planeacion = null) {
        return `
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
                        ${sampleData.encuadres.map(encuadre => {
                            const planArea = sampleData.planes.find(p => p.id === encuadre.planAreaId);
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
        `;
    }

    updatePlaneacionesContent() {
        elements.content.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-semibold text-gray-800">Planeaciones</h2>
                    <button onclick="planeacionManager.handleNewPlaneacion()" class="new-planeacion-button bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        Crear Nueva Planeación
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignatura</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodos</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encuadre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sampleData.planeaciones.map(planeacion => {
                                const encuadre = sampleData.encuadres.find(e => e.id === planeacion.encuadreId);
                                const planArea = encuadre ? sampleData.planes.find(p => p.id === encuadre.planAreaId) : null;
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.asignatura}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${planeacion.periodosClase}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            ${planArea ? `${planArea.asignatura} - Periodo ${encuadre.periodo}` : 'N/A'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <button onclick="planeacionManager.handleEditPlaneacion(${planeacion.id})" class="edit-button text-blue-600 hover:text-blue-900 mr-3">
                                                Editar
                                            </button>
                                            <button onclick="planeacionManager.deletePlaneacion(${planeacion.id})" class="delete-button text-red-600 hover:text-red-900">
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

    handleNewPlaneacion() {
        elements.content.innerHTML = this.createPlaneacionForm();
        this.setupFormEventListeners();
    }

    handleEditPlaneacion(id) {
        const planeacion = sampleData.planeaciones.find(p => p.id === id);
        if (planeacion) {
            elements.content.innerHTML = this.createPlaneacionForm(planeacion);
            this.setupFormEventListeners();
        }
    }

    setupEventListeners() {
        const newButton = elements.content.querySelector('.new-planeacion-button');
        if (newButton) {
            newButton.removeEventListener('click', this.handleNewPlaneacion);
            newButton.addEventListener('click', () => this.handleNewPlaneacion());
        }
    }

    setupFormEventListeners() {
        const form = elements.content.querySelector('#planeacionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const editingId = form.dataset.editingId;
                this.handlePlaneacionSubmit(e, editingId ? parseInt(editingId) : null);
            });

            const cancelButton = form.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    this.updatePlaneacionesContent();
                });
            }
        }
    }
}

// Create instance
const planeacionManager = new PlaneacionManager();

// Make planeacionManager available globally for inline event handlers
window.planeacionManager = planeacionManager;

// Export the instance and necessary functions
export const { updatePlaneacionesContent } = planeacionManager;
export default planeacionManager;
