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

    createEmptyPlaneacion(id = null) {
        return {
            id: id !== null ? id : Date.now().toString(),
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
        const planeacionId = formData.get('id') || null;
        const planeacion = editingId ? 
            await db.get('planeaciones', editingId) : 
            this.createEmptyPlaneacion(planeacionId);

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
                    ${planeacion ? `<input type="hidden" name="id" value="${planeacion.id}">` : `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ID</label>
                        <input type="text" name="id" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    `}
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
                <div class="flex space-x-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Asignatura</label>
                        <div class="flex items-center">
                            <input type="text" id="asignatura-filter" placeholder="Filtrar por asignatura" class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <button id="asignatura-filter-button" class="ml-2 text-gray-500 hover:text-gray-700">
                                🔍
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Encuadre</label>
                        <div class="flex items-center">
                            <input type="text" id="encuadre-filter" placeholder="Filtrar por encuadre" class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <button id="encuadre-filter-button" class="ml-2 text-gray-500 hover:text-gray-700">
                                🔍
                            </button>
                        </div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left border-b">Fecha</th>
                                <th class="px-6 py-3 text-left border-b">Asignatura</th>
                                <th class="px-6 py-3 text-left border-b">Tema</th>
                                <th class="px-6 py-3 text-left border-b">Periodos</th>
                                <th class="px-6 py-3 text-left border-b">Encuadre</th>
                                <th class="px-6 py-3 text-left border-b">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.planeaciones
                                .map(planeacion => {
                                    const encuadre = encuadres.find(e => e.id === planeacion.encuadreId);
                                    const planArea = encuadre ? planesDeArea.find(p => p.id === encuadre.planDeAreaId) : null;
                                    const encuadreText = planArea ? `${planArea.asignatura} - Grado ${planArea.grado} - Periodo ${encuadre.periodo}` : 'N/A';
                                    return `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.fecha}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.asignatura}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.tema}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.periodosClase}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                ${encuadreText}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <button class="edit-button text-blue-600 hover:text-blue-900 mr-3" data-id="${planeacion.id}">
                                                    Editar
                                                </button>
                                                <button class="view-button text-green-600 hover:text-green-900 mr-3" data-id="${planeacion.id}">
                                                    Ver
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
        
        const asignaturaFilterButton = document.getElementById('asignatura-filter-button');
        const encuadreFilterButton = document.getElementById('encuadre-filter-button');

        asignaturaFilterButton.addEventListener('click', async () => {
            await this.filterPlaneaciones();
        });
        encuadreFilterButton.addEventListener('click', async () => {
            await this.filterPlaneaciones();
        });
    }

    async filterPlaneaciones() {
        const encuadres = await db.getAll('encuadres');
        const planesDeArea = await db.getAll('planesDeArea');
        const asignaturaFilter = document.getElementById('asignatura-filter')?.value?.toLowerCase() || '';
        const encuadreFilter = document.getElementById('encuadre-filter')?.value?.toLowerCase() || '';

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
                <div class="flex space-x-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Asignatura</label>
                        <div class="flex items-center">
                            <input type="text" id="asignatura-filter" placeholder="Filtrar por asignatura" class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value="${document.getElementById('asignatura-filter')?.value || ''}">
                            <button id="asignatura-filter-button" class="ml-2 text-gray-500 hover:text-gray-700">
                                🔍
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Encuadre</label>
                        <div class="flex items-center">
                            <input type="text" id="encuadre-filter" placeholder="Filtrar por encuadre" class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value="${document.getElementById('encuadre-filter')?.value || ''}">
                             <button id="encuadre-filter-button" class="ml-2 text-gray-500 hover:text-gray-700">
                                🔍
                            </button>
                        </div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left border-b">Fecha</th>
                                <th class="px-6 py-3 text-left border-b">Asignatura</th>
                                <th class="px-6 py-3 text-left border-b">Tema</th>
                                <th class="px-6 py-3 text-left border-b">Periodos</th>
                                <th class="px-6 py-3 text-left border-b">Encuadre</th>
                                <th class="px-6 py-3 text-left border-b">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.planeaciones
                                .filter(planeacion => {
                                    const encuadre = encuadres.find(e => e.id === planeacion.encuadreId);
                                    const planArea = encuadre ? planesDeArea.find(p => p.id === encuadre.planDeAreaId) : null;
                                    const encuadreText = planArea ? `${planArea.asignatura} - Grado ${planArea.grado} - Periodo ${encuadre.periodo}` : 'N/A';

                                    return (
                                        planeacion.asignatura.toLowerCase().includes(asignaturaFilter) &&
                                        encuadreText.toLowerCase().includes(encuadreFilter)
                                    );
                                })
                                .map(planeacion => {
                                    const encuadre = encuadres.find(e => e.id === planeacion.encuadreId);
                                    const planArea = encuadre ? planesDeArea.find(p => p.id === encuadre.planDeAreaId) : null;
                                    const encuadreText = planArea ? `${planArea.asignatura} - Grado ${planArea.grado} - Periodo ${encuadre.periodo}` : 'N/A';
                                    return `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.fecha}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.asignatura}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.tema}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">${planeacion.periodosClase}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                ${encuadreText}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <button class="edit-button text-blue-600 hover:text-blue-900 mr-3" data-id="${planeacion.id}">
                                                    Editar
                                                </button>
                                                <button class="view-button text-green-600 hover:text-green-900 mr-3" data-id="${planeacion.id}">
                                                    Ver
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
        const asignaturaFilterButton = document.getElementById('asignatura-filter-button');
        const encuadreFilterButton = document.getElementById('encuadre-filter-button');

        asignaturaFilterButton.addEventListener('click', async () => {
            await this.filterPlaneaciones();
        });
        encuadreFilterButton.addEventListener('click', async () => {
            await this.filterPlaneaciones();
        });
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

    // Render planeacion details
    renderPlaneacionDetails(planeacion) {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">
                        Detalles de la Planeación
                    </h2>
                    <button id="btn-volver" class="text-gray-600 hover:text-gray-800">
                        Volver
                    </button>
                </div>
                <div class="space-y-4">
                    <p><span class="font-semibold">Fecha:</span> ${planeacion.fecha}</p>
                    <p><span class="font-semibold">Tema:</span> ${planeacion.tema}</p>
                    <p><span class="font-semibold">Asignatura:</span> ${planeacion.asignatura}</p>
                    <p><span class="font-semibold">Periodos de clase:</span> ${planeacion.periodosClase}</p>
                    <p><span class="font-semibold">Objetivo:</span> ${planeacion.objetivo}</p>
                    <p><span class="font-semibold">Encuadre ID:</span> ${planeacion.encuadreId}</p>
                    <div class="space-y-2">
                        <h3 class="text-lg font-medium">Momentos de la Clase</h3>
                        <p><span class="font-semibold">Inicio:</span> ${planeacion.momentos.inicio}</p>
                        <p><span class="font-semibold">Exploración:</span> ${planeacion.momentos.exploracion}</p>
                        <p><span class="font-semibold">Transferencia:</span> ${planeacion.momentos.transferencia}</p>
                        <p><span class="font-semibold">Evaluación:</span> ${planeacion.momentos.evaluacion}</p>
                    </div>
                    <p><span class="font-semibold">Observaciones:</span> ${planeacion.observaciones}</p>
                </div>
            </div>
        `;
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

    parseEncuadreId(encuadreString) {
        if (!encuadreString) return null;
        const match = encuadreString.match(/([A-Za-z]+)-(\d+)-(\d+)/);
        if (!match) return null;
    
        const asignatura = match[1];
        const grado = parseInt(match[2]);
        const periodo = parseInt(match[3]);
    
        return { asignatura, grado, periodo };
    }

    async findEncuadreId(encuadreString) {
        
        const encuadres = await db.getAll('encuadres');
        
        for (const encuadre of encuadres) {
            if (encuadre.id === encuadreString) {
                return encuadre.id
            }
        }
        return null;
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
                        const encuadreId = await this.findEncuadreId(planeacion.encuadreId);
                        if (encuadreId === null) {
                            throw new Error(`No se encontró un encuadre válido para ${planeacion.encuadreId}`);
                        }
                        
                        await db.add('planeaciones', {
                            ...planeacion,
                            id: planeacion.id || Date.now() + Math.floor(Math.random() * 1000),
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
                const id = btn.dataset.id;
                this.handleEditPlaneacion(id);
            });
        });

        content.querySelectorAll('.view-button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                try {
                    const planeacion = await db.get('planeaciones', id);
                    if (planeacion) {
                        elements.content.innerHTML = this.renderPlaneacionDetails(planeacion);
                        elements.content.querySelector('#btn-volver')?.addEventListener('click', () => this.updatePlaneacionesContent());
                    }
                } catch (e) {
                    console.error('Error loading planeacion:', e);
                    alert('Error al cargar la planeación');
                }
            });
        });

        content.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.deletePlaneacion(id);
            });
        });
    }

    setupFormEventListeners() {
        const form = elements.content.querySelector('#planeacionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                const editingId = form.dataset.editingId;
                this.handlePlaneacionSubmit(e, editingId);
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
