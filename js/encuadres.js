import db from './db.js';

console.log('Encuadres: Module loaded');

let encuadres = [];

// Generate unique ID - usando la misma implementación que en planeacion.js
function generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Load initial data from IndexedDB
async function loadInitialData() {
    try {
        encuadres = await db.getAll('encuadres');
        console.log('Encuadres: Initial data loaded:', encuadres);
        updateEncuadresContent();
    } catch (e) {
        console.error('Encuadres: Error loading initial data:', e);
    }
}

// Load data when module is imported
//loadInitialData();
if (window.location.hash == "#encuadres") {
    console.log('App: Loading initial data based on hash');
    this.loadInitialData();
}

// Load planes de area from IndexedDB
async function loadPlanesDeArea() {
    try {
        return await db.getAll('planesDeArea');
    } catch (e) {
        console.error('Encuadres: Error loading planes de area:', e);
        return [];
    }
}

// Render form for create/edit
async function renderEncuadreForm(encuadre = null) {
    console.log('Encuadres: Rendering form', encuadre ? 'for edit' : 'for create');
    const isEdit = !!encuadre;
    const planesDeArea = await loadPlanesDeArea();
    
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">
                    ${isEdit ? 'Editar' : 'Crear'} Encuadre
                </h2>
                <button id="btn-volver" class="text-gray-600 hover:text-gray-800">
                    Volver
                </button>
            </div>

            <form id="encuadre-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Plan de Área</label>
                        <select name="planDeAreaId" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Seleccione un plan</option>
                            ${planesDeArea.map(plan => `
                                <option value="${plan.id}" ${encuadre?.planDeAreaId === plan.id ? 'selected' : ''}>
                                    ${plan.asignatura} - ${plan.grado}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Periodo</label>
                        <select name="periodo" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="1" ${encuadre?.periodo === 1 ? 'selected' : ''}>Periodo 1</option>
                            <option value="2" ${encuadre?.periodo === 2 ? 'selected' : ''}>Periodo 2</option>
                            <option value="3" ${encuadre?.periodo === 3 ? 'selected' : ''}>Periodo 3</option>
                            <option value="4" ${encuadre?.periodo === 4 ? 'selected' : ''}>Periodo 4</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Competencias del SABER</label>
                        <textarea name="competenciasSaber" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.competenciasSaber || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Competencias del SABER HACER</label>
                        <textarea name="competenciasSaberHacer" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.competenciasSaberHacer || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Competencias del SABER SER</label>
                        <textarea name="competenciasSaberSer" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.competenciasSaberSer || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">CRITERIOS DE EVALUACIÓN</label>
                        <textarea name="criteriosEvaluacion" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.criteriosEvaluacion || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">RESULTADOS DE APRENDIZAJE</label>
                        <textarea name="resultadosAprendizaje" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.resultadosAprendizaje || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">EVIDENCIAS DE APRENDIZAJE</label>
                        <textarea name="evidenciasAprendizaje" rows="3" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >${encuadre?.evidenciasAprendizaje || ''}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">POSIBLES FECHAS</label>
                        <input type="text" name="fechas" required
                            placeholder="Ej: 2024-01-15, 2024-01-30"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value="${encuadre?.fechas || ''}">
                        <p class="mt-1 text-sm text-gray-500">Ingrese las fechas separadas por comas</p>
                    </div>
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button type="button" id="btn-cancelar" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                        ${isEdit ? 'Actualizar' : 'Crear'} Encuadre
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Render main content
async function renderEncuadres() {
    console.log('Encuadres: Rendering main content');
    const planesDeArea = await loadPlanesDeArea();
    
    return `
        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">Encuadres</h2>
                <div class="space-x-2">
                    <button id="btn-exportar" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        📤
                    </button>
                    <button id="btn-importar" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        📥
                    </button>
                    <button id="btn-crear-encuadre" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        ➕
                    </button>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-6 py-3 border-b text-left">Plan de Área</th>
                            <th class="px-6 py-3 border-b text-left">Periodo</th>
                            <th class="px-6 py-3 border-b text-left">Fechas</th>
                            <th class="px-6 py-3 border-b text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${encuadres.map(encuadre => {
                            const planDeArea = planesDeArea.find(p => p.id === encuadre.planDeAreaId);
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 border-b">${planDeArea ? `${planDeArea.asignatura} - ${planDeArea.grado}` : 'Plan no encontrado'}</td>
                                    <td class="px-6 py-4 border-b">${encuadre.periodo}</td>
                                    <td class="px-6 py-4 border-b">${encuadre.fechas}</td>
                                    <td class="px-6 py-4 border-b">
                                        <button class="text-blue-600 hover:text-blue-800 mr-2 edit-encuadre" data-id="${encuadre.id}">
                                            Editar
                                        </button>
                                        <button class="text-red-600 hover:text-red-800 delete-encuadre" data-id="${encuadre.id}">
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

        <!-- Modal para selección de plan de área -->
        <div id="modal-seleccion-plan" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h3 class="text-lg font-bold mb-4">Seleccionar Plan de Área</h3>
                <div class="space-y-4">
                    <select id="select-plan-area" class="w-full p-2 border rounded">
                        <option value="">Seleccione un plan</option>
                    </select>
                    <div class="flex justify-end space-x-2">
                        <button id="btn-cancelar-seleccion" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                            Cancelar
                        </button>
                        <button id="btn-confirmar-seleccion" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize event listeners
function initializeEventListeners() {
    console.log('Encuadres: Initializing event listeners');
    const content = document.getElementById('content');

    // Create button
    content.querySelector('#btn-crear-encuadre')?.addEventListener('click', async () => {
        content.innerHTML = await renderEncuadreForm();
        initializeFormEventListeners();
    });

    // Export button
    content.querySelector('#btn-exportar')?.addEventListener('click', async () => {
        try {
            const data = await db.getAll('encuadres');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'encuadres.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error exporting data:', e);
            alert('Error al exportar los datos');
        }
    });

    // Import button with plan selection
    content.querySelector('#btn-importar')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const importedData = JSON.parse(text);
                
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid data format');
                }

                // Validar estructura de los encuadres importados
                const validEncuadres = importedData.filter(encuadre => {
                    return typeof encuadre === 'object' && encuadre !== null &&
                           typeof encuadre.competenciasSaber === 'string' &&
                           typeof encuadre.competenciasSaberHacer === 'string' &&
                           typeof encuadre.competenciasSaberSer === 'string' &&
                           typeof encuadre.criteriosEvaluacion === 'string' &&
                           typeof encuadre.resultadosAprendizaje === 'string' &&
                           typeof encuadre.evidenciasAprendizaje === 'string' &&
                           typeof encuadre.fechas === 'string';
                });

                if (validEncuadres.length === 0) {
                    throw new Error('No valid encuadres found in import file');
                }

                // Cargar planes de área para el modal
                const planesDeArea = await loadPlanesDeArea();
                const selectPlan = content.querySelector('#select-plan-area');
                selectPlan.innerHTML = `
                    <option value="">Seleccione un plan</option>
                    ${planesDeArea.map(plan => `
                        <option value="${plan.id}">${plan.asignatura} - ${plan.grado}</option>
                    `).join('')}
                `;

                // Mostrar modal
                const modal = content.querySelector('#modal-seleccion-plan');
                modal.classList.remove('hidden');

                // Manejar selección
                const btnConfirmar = content.querySelector('#btn-confirmar-seleccion');
                const btnCancelar = content.querySelector('#btn-cancelar-seleccion');

                btnConfirmar.onclick = async () => {
                    const planDeAreaId = parseInt(selectPlan.value);
                    if (!planDeAreaId) {
                        alert('Por favor seleccione un plan de área');
                        return;
                    }

                    try {
                        // Procesar y guardar los encuadres importados
                        for (const encuadre of validEncuadres) {
                            const newEncuadre = {
                                id: Date.now() + Math.floor(Math.random() * 1000), // Usando la misma implementación que planeacion.js
                                planDeAreaId: planDeAreaId,
                                periodo: typeof encuadre.periodo === 'number' ? encuadre.periodo : 1,
                                competenciasSaber: encuadre.competenciasSaber,
                                competenciasSaberHacer: encuadre.competenciasSaberHacer,
                                competenciasSaberSer: encuadre.competenciasSaberSer,
                                criteriosEvaluacion: encuadre.criteriosEvaluacion,
                                resultadosAprendizaje: encuadre.resultadosAprendizaje,
                                evidenciasAprendizaje: encuadre.evidenciasAprendizaje,
                                fechas: encuadre.fechas
                            };

                            console.log('Importing encuadre:', newEncuadre); // Debug log
                            
                            // Agregar el nuevo encuadre
                            await db.add('encuadres', newEncuadre);
                            encuadres.push(newEncuadre);
                        }
                        
                        // Cerrar modal y actualizar vista
                        modal.classList.add('hidden');
                        updateEncuadresContent();
                        
                        alert(`Se importaron ${validEncuadres.length} encuadres exitosamente`);
                    } catch (error) {
                        console.error('Error saving encuadres:', error);
                        alert('Error al guardar los encuadres importados: ' + error.message);
                    }
                };

                btnCancelar.onclick = () => {
                    modal.classList.add('hidden');
                };

            } catch (e) {
                console.error('Error importing data:', e);
                alert('Error al importar los datos: ' + e.message);
            }
        };
        input.click();
    });

    // Edit buttons
    content.querySelectorAll('.edit-encuadre').forEach(btn => {
        btn.addEventListener('click', async () => {
            const encuadreId = parseInt(btn.dataset.id);
            try {
                const encuadre = await db.get('encuadres', encuadreId);
                if (encuadre) {
                    content.innerHTML = await renderEncuadreForm(encuadre);
                    initializeFormEventListeners(encuadre);
                }
            } catch (e) {
                console.error('Error loading encuadre:', e);
                alert('Error al cargar el encuadre');
            }
        });
    });

    // Delete buttons
    content.querySelectorAll('.delete-encuadre').forEach(btn => {
        btn.addEventListener('click', async () => {
            const encuadreId = parseInt(btn.dataset.id);
            if (confirm('¿Está seguro de que desea eliminar este encuadre?')) {
                try {
                    await db.delete('encuadres', encuadreId);
                    encuadres = encuadres.filter(e => e.id !== encuadreId);
                    updateEncuadresContent();
                } catch (e) {
                    console.error('Error deleting encuadre:', e);
                    alert('Error al eliminar el encuadre');
                }
            }
        });
    });
}

// Initialize form event listeners
function initializeFormEventListeners(encuadre = null) {
    console.log('Encuadres: Initializing form event listeners');
    const content = document.getElementById('content');
    const form = content.querySelector('#encuadre-form');

    // Form submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        const encuadreData = {
            id: encuadre?.id || (Date.now() + Math.floor(Math.random() * 1000)), // Usando la misma implementación que planeacion.js
            planDeAreaId: parseInt(formData.get('planDeAreaId')),
            periodo: parseInt(formData.get('periodo')),
            competenciasSaber: formData.get('competenciasSaber'),
            competenciasSaberHacer: formData.get('competenciasSaberHacer'),
            competenciasSaberSer: formData.get('competenciasSaberSer'),
            criteriosEvaluacion: formData.get('criteriosEvaluacion'),
            resultadosAprendizaje: formData.get('resultadosAprendizaje'),
            evidenciasAprendizaje: formData.get('evidenciasAprendizaje'),
            fechas: formData.get('fechas')
        };

        try {
            if (encuadre) {
                // Update existing encuadre
                await db.put('encuadres', encuadreData);
                encuadres = encuadres.map(e => e.id === encuadre.id ? encuadreData : e);
            } else {
                // Add new encuadre
                await db.add('encuadres', encuadreData);
                encuadres.push(encuadreData);
            }
            updateEncuadresContent();
        } catch (e) {
            console.error('Error saving encuadre:', e);
            alert('Error al guardar el encuadre');
        }
    });

    // Cancel and back buttons
    content.querySelector('#btn-cancelar')?.addEventListener('click', updateEncuadresContent);
    content.querySelector('#btn-volver')?.addEventListener('click', updateEncuadresContent);
}

// Update main content
async function updateEncuadresContent() {
    console.log('Encuadres: Updating content');
    const content = document.getElementById('content');
    if (!content) {
        console.error('Encuadres: Content element not found');
        return;
    }
    content.innerHTML = await renderEncuadres();
    initializeEventListeners();
    console.log('Encuadres: Content updated');
}

// Export the function
export { updateEncuadresContent };

// Export the default object
export default {
    updateEncuadresContent
};
