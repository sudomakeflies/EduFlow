console.log('Encuadres: Module loaded');

// Data structure for encuadres
let encuadres = [];

// Try to load saved data
try {
    const savedData = localStorage.getItem('encuadres');
    if (savedData) {
        encuadres = JSON.parse(savedData);
        console.log('Encuadres: Initial data loaded:', encuadres);
    }
} catch (e) {
    console.error('Encuadres: Error loading initial data:', e);
}

// Load planes de area from localStorage
function loadPlanesDeArea() {
    try {
        const savedData = localStorage.getItem('planesDeArea');
        return savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Encuadres: Error loading planes de area:', e);
        return [];
    }
}

// Render main content
function renderEncuadres() {
    console.log('Encuadres: Rendering main content');
    return `
        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">Encuadres</h2>
                <button id="btn-crear-encuadre" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Crear Encuadre
                </button>
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
                            const planDeArea = loadPlanesDeArea().find(p => p.id === encuadre.planDeAreaId);
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
    `;
}

// Render form for create/edit
function renderEncuadreForm(encuadre = null) {
    console.log('Encuadres: Rendering form', encuadre ? 'for edit' : 'for create');
    const isEdit = !!encuadre;
    const planesDeArea = loadPlanesDeArea();
    
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

// Initialize event listeners
function initializeEventListeners() {
    console.log('Encuadres: Initializing event listeners');
    const content = document.getElementById('content');

    // Create button
    content.querySelector('#btn-crear-encuadre')?.addEventListener('click', () => {
        content.innerHTML = renderEncuadreForm();
        initializeFormEventListeners();
    });

    // Edit buttons
    content.querySelectorAll('.edit-encuadre').forEach(btn => {
        btn.addEventListener('click', () => {
            const encuadreId = parseInt(btn.dataset.id);
            const encuadre = encuadres.find(e => e.id === encuadreId);
            if (encuadre) {
                content.innerHTML = renderEncuadreForm(encuadre);
                initializeFormEventListeners(encuadre);
            }
        });
    });

    // Delete buttons
    content.querySelectorAll('.delete-encuadre').forEach(btn => {
        btn.addEventListener('click', () => {
            const encuadreId = parseInt(btn.dataset.id);
            if (confirm('¿Está seguro de que desea eliminar este encuadre?')) {
                encuadres = encuadres.filter(e => e.id !== encuadreId);
                saveEncuadres();
                updateEncuadresContent();
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
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        const encuadreData = {
            id: encuadre?.id || Date.now(),
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

        if (encuadre) {
            // Update existing encuadre
            encuadres = encuadres.map(e => e.id === encuadre.id ? encuadreData : e);
        } else {
            // Add new encuadre
            encuadres.push(encuadreData);
        }

        saveEncuadres();
        updateEncuadresContent();
    });

    // Cancel and back buttons
    content.querySelector('#btn-cancelar')?.addEventListener('click', updateEncuadresContent);
    content.querySelector('#btn-volver')?.addEventListener('click', updateEncuadresContent);
}

// Save encuadres to localStorage
function saveEncuadres() {
    try {
        localStorage.setItem('encuadres', JSON.stringify(encuadres));
        console.log('Encuadres: Data saved:', encuadres);
    } catch (e) {
        console.error('Encuadres: Error saving data:', e);
    }
}

// Update main content
function updateEncuadresContent() {
    console.log('Encuadres: Updating content');
    const content = document.getElementById('content');
    if (!content) {
        console.error('Encuadres: Content element not found');
        return;
    }
    content.innerHTML = renderEncuadres();
    initializeEventListeners();
    console.log('Encuadres: Content updated');
}

// Export the function
export { updateEncuadresContent };

// Export the default object
export default {
    updateEncuadresContent
};
