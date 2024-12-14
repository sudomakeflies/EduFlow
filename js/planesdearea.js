console.log('PlanesDeArea: Module loaded');

// Sample data structure for planes de area
let planesDeArea = [];

// Try to load saved data
try {
    const savedData = localStorage.getItem('planesDeArea');
    if (savedData) {
        planesDeArea = JSON.parse(savedData);
        console.log('PlanesDeArea: Initial data loaded:', planesDeArea);
    }
} catch (e) {
    console.error('PlanesDeArea: Error loading initial data:', e);
}

// Render main content
function renderPlanesDeArea() {
    console.log('PlanesDeArea: Rendering main content');
    return `
        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">Planes de Área</h2>
                <button id="btn-crear-plan" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Crear Plan
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-6 py-3 border-b text-left">Asignatura</th>
                            <th class="px-6 py-3 border-b text-left">Grado</th>
                            <th class="px-6 py-3 border-b text-left">Periodos</th>
                            <th class="px-6 py-3 border-b text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${planesDeArea.map(plan => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 border-b">${plan.asignatura}</td>
                                <td class="px-6 py-4 border-b">${plan.grado}</td>
                                <td class="px-6 py-4 border-b">${plan.periodos}</td>
                                <td class="px-6 py-4 border-b">
                                    <button class="text-blue-600 hover:text-blue-800 mr-2 edit-plan" data-id="${plan.id}">
                                        Editar
                                    </button>
                                    <button class="text-red-600 hover:text-red-800 delete-plan" data-id="${plan.id}">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Initialize event listeners
function initializeEventListeners() {
    console.log('PlanesDeArea: Initializing event listeners');
    const content = document.getElementById('content');

    // Create button
    content.querySelector('#btn-crear-plan')?.addEventListener('click', () => {
        content.innerHTML = renderPlanForm();
        initializeFormEventListeners();
    });

    // Edit buttons
    content.querySelectorAll('.edit-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            const planId = parseInt(btn.dataset.id);
            const plan = planesDeArea.find(p => p.id === planId);
            if (plan) {
                content.innerHTML = renderPlanForm(plan);
                initializeFormEventListeners(plan);
            }
        });
    });

    // Delete buttons
    content.querySelectorAll('.delete-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            const planId = parseInt(btn.dataset.id);
            if (confirm('¿Está seguro de que desea eliminar este plan de área?')) {
                planesDeArea = planesDeArea.filter(p => p.id !== planId);
                updatePlanesDeAreaContent();
            }
        });
    });
}

// Render form for create/edit
function renderPlanForm(plan = null) {
    console.log('PlanesDeArea: Rendering form', plan ? 'for edit' : 'for create');
    const isEdit = !!plan;
    const periodos = plan ? plan.periodos : 4;
    
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">
                    ${isEdit ? 'Editar' : 'Crear'} Plan de Área
                </h2>
                <button id="btn-volver" class="text-gray-600 hover:text-gray-800">
                    Volver
                </button>
            </div>

            <form id="plan-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Asignatura</label>
                        <input type="text" name="asignatura" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value="${plan?.asignatura || ''}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Grado</label>
                        <input type="text" name="grado" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value="${plan?.grado || ''}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Periodos</label>
                        <select name="periodos" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="3" ${periodos === 3 ? 'selected' : ''}>3 Periodos</option>
                            <option value="4" ${periodos === 4 ? 'selected' : ''}>4 Periodos</option>
                        </select>
                    </div>
                </div>

                <div class="border-t border-gray-200 pt-4">
                    <div class="mb-4">
                        <div class="sm:hidden">
                            <label for="periodo-tabs" class="sr-only">Seleccionar periodo</label>
                            <select id="periodo-tabs" name="periodo-tabs" class="block w-full rounded-md border-gray-300">
                                ${Array.from({length: periodos}, (_, i) => `
                                    <option>Periodo ${i + 1}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="hidden sm:block">
                            <nav class="flex space-x-4" aria-label="Tabs">
                                ${Array.from({length: periodos}, (_, i) => `
                                    <button type="button" class="periodo-tab ${i === 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'} px-3 py-2 font-medium text-sm rounded-md" data-periodo="${i + 1}">
                                        Periodo ${i + 1}
                                    </button>
                                `).join('')}
                            </nav>
                        </div>
                    </div>

                    ${Array.from({length: periodos}, (_, i) => `
                        <div class="periodo-content ${i === 0 ? '' : 'hidden'}" data-periodo="${i + 1}">
                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">SABER</label>
                                        <textarea name="saber-${i + 1}" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${plan?.contenido?.[`periodo${i + 1}`]?.competencias?.saber || ''}</textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">SABER HACER</label>
                                        <textarea name="saberHacer-${i + 1}" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${plan?.contenido?.[`periodo${i + 1}`]?.competencias?.saberHacer || ''}</textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">SABER SER</label>
                                        <textarea name="saberSer-${i + 1}" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${plan?.contenido?.[`periodo${i + 1}`]?.competencias?.saberSer || ''}</textarea>
                                    </div>
                                </div>

                                <div class="overflow-x-auto">
                                    <table class="min-w-full border border-gray-300">
                                        <thead>
                                            <tr class="bg-gray-50">
                                                <th class="px-4 py-2 border">COMPETENCIA DE CONTENIDO</th>
                                                <th class="px-4 py-2 border">ESTANDAR</th>
                                                <th class="px-4 py-2 border">COMPETENCIA DE PROCESO</th>
                                                <th class="px-4 py-2 border">DBA/APRENDIZAJES</th>
                                                <th class="px-4 py-2 border">ESTRATEGIAS DIDACTICO PEDAGOGICAS</th>
                                                <th class="px-4 py-2 border">CRITERIOS DE EVALUACION</th>
                                                <th class="px-4 py-2 border">EVIDENCIAS DE APRENDIZAJE</th>
                                                <th class="px-4 py-2 border">ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody class="matriz-body" data-periodo="${i + 1}">
                                            <tr>
                                                <td colspan="8" class="px-4 py-2 border text-center">
                                                    <button type="button" class="add-row-btn text-blue-600 hover:text-blue-800" data-periodo="${i + 1}">
                                                        + Agregar fila
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button type="button" id="btn-cancelar" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                        ${isEdit ? 'Actualizar' : 'Crear'} Plan
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Initialize form event listeners
function initializeFormEventListeners(plan = null) {
    console.log('PlanesDeArea: Initializing form event listeners');
    const content = document.getElementById('content');
    const form = content.querySelector('#plan-form');

    // Period tabs
    content.querySelectorAll('.periodo-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const periodo = tab.dataset.periodo;
            content.querySelectorAll('.periodo-tab').forEach(t => 
                t.classList.toggle('bg-blue-100 text-blue-700', t === tab));
            content.querySelectorAll('.periodo-content').forEach(content => 
                content.classList.toggle('hidden', content.dataset.periodo !== periodo));
        });
    });

    // Add row buttons
    content.querySelectorAll('.add-row-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const periodo = btn.dataset.periodo;
            const tbody = content.querySelector(`.matriz-body[data-periodo="${periodo}"]`);
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2"><input type="text" class="w-full border-gray-300 rounded-md"></td>
                <td class="border p-2">
                    <button type="button" class="text-red-600 hover:text-red-800 delete-row">Eliminar</button>
                </td>
            `;
            tbody.insertBefore(newRow, tbody.lastElementChild);

            // Add delete row handler
            newRow.querySelector('.delete-row').addEventListener('click', () => {
                newRow.remove();
            });
        });
    });

    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        const planData = {
            id: plan?.id || Date.now(),
            asignatura: formData.get('asignatura'),
            grado: formData.get('grado'),
            periodos: parseInt(formData.get('periodos')),
            contenido: {}
        };

        // Process each period
        for (let i = 1; i <= planData.periodos; i++) {
            planData.contenido[`periodo${i}`] = {
                competencias: {
                    saber: formData.get(`saber-${i}`),
                    saberHacer: formData.get(`saberHacer-${i}`),
                    saberSer: formData.get(`saberSer-${i}`)
                },
                matriz: []
            };

            // Process matriz rows
            const tbody = content.querySelector(`.matriz-body[data-periodo="${i}"]`);
            tbody.querySelectorAll('tr:not(:last-child)').forEach(row => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length === 7) {
                    planData.contenido[`periodo${i}`].matriz.push({
                        competenciaContenido: inputs[0].value,
                        estandar: inputs[1].value,
                        competenciaProceso: inputs[2].value,
                        dbaAprendizajes: inputs[3].value,
                        estrategias: inputs[4].value,
                        criteriosEvaluacion: inputs[5].value,
                        evidenciasAprendizaje: inputs[6].value
                    });
                }
            });
        }

        if (plan) {
            // Update existing plan
            planesDeArea = planesDeArea.map(p => p.id === plan.id ? planData : p);
        } else {
            // Add new plan
            planesDeArea.push(planData);
        }

        // Save to localStorage
        try {
            localStorage.setItem('planesDeArea', JSON.stringify(planesDeArea));
            console.log('PlanesDeArea: Data saved:', planesDeArea);
        } catch (e) {
            console.error('PlanesDeArea: Error saving data:', e);
        }

        updatePlanesDeAreaContent();
    });

    // Cancel and back buttons
    content.querySelector('#btn-cancelar')?.addEventListener('click', updatePlanesDeAreaContent);
    content.querySelector('#btn-volver')?.addEventListener('click', updatePlanesDeAreaContent);
}

// Update main content
function updatePlanesDeAreaContent() {
    console.log('PlanesDeArea: Updating content');
    const content = document.getElementById('content');
    if (!content) {
        console.error('PlanesDeArea: Content element not found');
        return;
    }
    content.innerHTML = renderPlanesDeArea();
    initializeEventListeners();
    console.log('PlanesDeArea: Content updated');
}

// Export the function
export { updatePlanesDeAreaContent };

// Export the default object
export default {
    updatePlanesDeAreaContent
};
