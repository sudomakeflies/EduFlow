import { getImportedStudents, STUDENTS_IMPORTED_EVENT } from './import.js';
import db from './db.js';

// Lista de asignaturas disponibles
const ASIGNATURAS = [
    'Matemáticas',
    'Español',
    'Ciencias Naturales',
    'Ciencias Sociales',
    'Inglés',
    'Educación Física',
    'Artística',
    'Tecnología e Informática',
    'Ética y Valores',
    'Religión'
];

// Función para obtener los cursos únicos de los estudiantes importados
function getCursosUnicos() {
    const cursos = new Set();
    const estudiantes = getImportedStudents();
    estudiantes.forEach(student => {
        const curso = student['Curso'] || student['Grado'];
        if (curso) {
            cursos.add(curso);
        }
    });
    return Array.from(cursos).sort();
}

// Función para obtener estudiantes de un curso específico
function getEstudiantesPorCurso(curso) {
    const estudiantes = getImportedStudents();
    return estudiantes
        .filter(student => (student['Curso'] || student['Grado']) === curso)
        .map(student => student['Nombre Completo'])
        .sort();
}

// Función para validar una nota
function validarNota(nota) {
    const notaNum = parseFloat(nota);
    return !isNaN(notaNum) && notaNum >= 1 && notaNum <= 5;
}

// Función para calcular el promedio de notas
function calcularPromedio(notas) {
    const notasValidas = Object.values(notas).filter(nota => !isNaN(parseFloat(nota)));
    if (notasValidas.length === 0) return 0;
    const suma = notasValidas.reduce((acc, nota) => acc + parseFloat(nota), 0);
    return (suma / notasValidas.length).toFixed(2);
}

// Función para guardar una planilla
async function guardarPlanilla(curso, asignatura, criterios, estudiantes) {
    try {
        const planilla = {
            curso,
            asignatura,
            criterios,
            estudiantes: {}
        };

        // Actualizar estudiantes y calcular promedios
        Object.keys(estudiantes).forEach(estudiante => {
            planilla.estudiantes[estudiante] = {
                ...estudiantes[estudiante],
                promedio: calcularPromedio(estudiantes[estudiante])
            };
        });

        await db.put('planillasValoracion', planilla);
        console.log('Planilla guardada:', planilla);
        return true;
    } catch (e) {
        console.error('Error al guardar planilla:', e);
        return false;
    }
}

// Función para eliminar una planilla
async function eliminarPlanilla(curso, asignatura) {
    try {
        await db.delete('planillasValoracion', [curso, asignatura]);
        return true;
    } catch (e) {
        console.error('Error al eliminar planilla:', e);
        return false;
    }
}

// Función para obtener todas las planillas
async function getPlanillas() {
    try {
        const planillas = await db.getAll('planillasValoracion');
        console.log('Planillas obtenidas:', planillas);
        return planillas;
    } catch (e) {
        console.error('Error al obtener planillas:', e);
        return [];
    }
}

// Función para renderizar la lista de planillas
async function renderizarListaPlanillas() {
    console.log('Renderizando lista de planillas');
    const planillas = await getPlanillas();
    
    if (planillas.length === 0) {
        console.log('No hay planillas para mostrar');
        return `
            <div class="text-gray-500 text-center py-8">
                No hay planillas de valoración registradas
            </div>
        `;
    }

    console.log('Renderizando tabla de planillas');
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="px-4 py-2 border-b bg-gray-100">Curso</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Asignatura</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Criterios</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Estudiantes</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${planillas.map(p => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 border-b">${p.curso}</td>
                            <td class="px-4 py-2 border-b">${p.asignatura}</td>
                            <td class="px-4 py-2 border-b">${p.criterios.join(', ')}</td>
                            <td class="px-4 py-2 border-b">${Object.keys(p.estudiantes).length} estudiantes</td>
                            <td class="px-4 py-2 border-b">
                                <div class="flex space-x-2">
                                    <button class="text-blue-600 hover:text-blue-800"
                                            onclick="window.editarPlanillaValoracion('${p.curso}', '${p.asignatura}')">
                                        ✏️ Editar
                                    </button>
                                    <button class="text-red-600 hover:text-red-800"
                                            onclick="window.eliminarPlanillaValoracionConfirm('${p.curso}', '${p.asignatura}')">
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Función para renderizar la sección completa de valoración
export async function renderValoracionSection() {
    console.log('Renderizando sección de valoración');
    const cursos = getCursosUnicos();
    console.log('Cursos disponibles:', cursos);

    return `
        <section id="valoracion-section" class="space-y-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-800">Planillas de Valoración</h2>
                <button id="nueva-planilla-valoracion" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Nueva Planilla
                </button>
            </div>

            <div id="lista-planillas-valoracion" class="mb-6">
                ${await renderizarListaPlanillas()}
            </div>

            <div id="form-planilla-valoracion" class="hidden space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900">Nueva Planilla de Valoración</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Curso -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Curso
                        </label>
                        <select id="curso-select-valoracion" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Seleccione un curso</option>
                            ${cursos.map(curso => `
                                <option value="${curso}">${curso}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Asignatura -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Asignatura
                        </label>
                        <select id="asignatura-select-valoracion" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Seleccione una asignatura</option>
                            ${ASIGNATURAS.map(asignatura => `
                                <option value="${asignatura}">${asignatura}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <!-- Criterios -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Criterios de Valoración
                    </label>
                    <div id="criterios-container" class="space-y-2">
                        <div class="flex items-center space-x-2">
                            <input type="text" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Nombre del criterio">
                            <button class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onclick="window.agregarCriterio()">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div id="planilla-valoracion-container" class="mt-4">
                    <div class="text-gray-500 text-center py-8">
                        Seleccione un curso y una asignatura para ver la planilla
                    </div>
                </div>

                <div class="flex justify-end space-x-4 mt-4">
                    <button id="cancelar-valoracion" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button id="guardar-valoracion" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Guardar
                    </button>
                </div>
            </div>
        </section>
    `;
}

// Función para inicializar los eventos de la sección de valoración
export async function initializeValoracion() {
    console.log('Inicializando valoración...');
    
    // Actualizar la lista de planillas inmediatamente
    const listaPlanillas = document.getElementById('lista-planillas-valoracion');
    if (listaPlanillas) {
        console.log('Actualizando lista de planillas');
        listaPlanillas.innerHTML = await renderizarListaPlanillas();
    } else {
        console.error('No se encontró el elemento lista-planillas-valoracion');
    }
    
    // Exponer funciones necesarias para los eventos onclick en la tabla
    window.editarPlanillaValoracion = async (curso, asignatura) => {
        console.log('Editando planilla:', curso, asignatura);
        const formPlanilla = document.getElementById('form-planilla-valoracion');
        const listaPlanillas = document.getElementById('lista-planillas-valoracion');
        const cursoSelect = document.getElementById('curso-select-valoracion');
        const asignaturaSelect = document.getElementById('asignatura-select-valoracion');
        
        if (formPlanilla && listaPlanillas && cursoSelect && asignaturaSelect) {
            formPlanilla.classList.remove('hidden');
            listaPlanillas.classList.add('hidden');
            
            cursoSelect.value = curso;
            asignaturaSelect.value = asignatura;
            
            // Cargar criterios existentes
            const planilla = await db.get('planillasValoracion', [curso, asignatura]);
            const criterios = planilla.criterios;
            const criteriosContainer = document.getElementById('criterios-container');
            criteriosContainer.innerHTML = criterios.map(criterio => `
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                           value="${criterio}">
                    <button class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onclick="this.parentElement.remove()">
                        -
                    </button>
                </div>
            `).join('') + `
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Nombre del criterio">
                    <button class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onclick="window.agregarCriterio()">
                        +
                    </button>
                </div>
            `;
            
            actualizarTablaValoracion();
        } else {
            console.error('No se encontraron elementos necesarios para editar la planilla');
        }
    };

    window.eliminarPlanillaValoracionConfirm = async (curso, asignatura) => {
        console.log('Confirmando eliminación de planilla:', curso, asignatura);
        if (confirm('¿Está seguro de que desea eliminar esta planilla?')) {
            if (await eliminarPlanilla(curso, asignatura)) {
                const listaPlanillas = document.getElementById('lista-planillas-valoracion');
                if (listaPlanillas) {
                    listaPlanillas.innerHTML = await renderizarListaPlanillas();
                }
            }
        }
    };

    window.agregarCriterio = () => {
        console.log('Agregando nuevo criterio');
        const criteriosContainer = document.getElementById('criterios-container');
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';
        div.innerHTML = `
            <input type="text" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Nombre del criterio">
            <button class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onclick="this.parentElement.remove()">
                -
            </button>
        `;
        criteriosContainer.insertBefore(div, criteriosContainer.lastElementChild);
    };

    // Event Listeners
    document.addEventListener('click', (e) => {
        if (e.target.id === 'nueva-planilla-valoracion') {
            console.log('Iniciando nueva planilla');
            const formPlanilla = document.getElementById('form-planilla-valoracion');
            const listaPlanillas = document.getElementById('lista-planillas-valoracion');
            
            if (formPlanilla && listaPlanillas) {
                formPlanilla.classList.remove('hidden');
                listaPlanillas.classList.add('hidden');
                
                // Resetear el formulario
                const cursoSelect = document.getElementById('curso-select-valoracion');
                const asignaturaSelect = document.getElementById('asignatura-select-valoracion');
                const criteriosContainer = document.getElementById('criterios-container');
                
                if (cursoSelect && asignaturaSelect && criteriosContainer) {
                    cursoSelect.value = '';
                    asignaturaSelect.value = '';
                    criteriosContainer.innerHTML = `
                        <div class="flex items-center space-x-2">
                            <input type="text" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Nombre del criterio">
                            <button class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onclick="window.agregarCriterio()">
                                +
                            </button>
                        </div>
                    `;
                }
                
                const planillaContainer = document.getElementById('planilla-valoracion-container');
                if (planillaContainer) {
                    planillaContainer.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            Seleccione un curso y una asignatura para ver la planilla
                        </div>
                    `;
                }
            } else {
                console.error('No se encontraron elementos necesarios para nueva planilla');
            }
        }
        
        if (e.target.id === 'cancelar-valoracion') {
            console.log('Cancelando planilla');
            const formPlanilla = document.getElementById('form-planilla-valoracion');
            const listaPlanillas = document.getElementById('lista-planillas-valoracion');
            
            if (formPlanilla && listaPlanillas) {
                formPlanilla.classList.add('hidden');
                listaPlanillas.classList.remove('hidden');
            }
        }
        
        if (e.target.id === 'guardar-valoracion') {
            console.log('Guardando planilla');
            const curso = document.getElementById('curso-select-valoracion')?.value;
            const asignatura = document.getElementById('asignatura-select-valoracion')?.value;
            
            if (!curso || !asignatura) {
                alert('Por favor complete todos los campos');
                return;
            }

            // Obtener criterios
            const criteriosInputs = Array.from(document.querySelectorAll('#criterios-container input[type="text"]'))
                .map(input => input.value.trim())
                .filter(Boolean);

            if (criteriosInputs.length === 0) {
                alert('Debe agregar al menos un criterio');
                return;
            }

            // Obtener notas
            const estudiantes = {};
            const notasInputs = document.querySelectorAll('input[data-estudiante]');
            let notasValidas = true;

            notasInputs.forEach(input => {
                const estudiante = input.dataset.estudiante;
                const criterio = input.dataset.criterio;
                const nota = input.value.trim();

                if (nota && !validarNota(nota)) {
                    alert(`La nota debe ser un número entre 1 y 5 para ${estudiante} en ${criterio}`);
                    notasValidas = false;
                    return;
                }

                if (!estudiantes[estudiante]) {
                    estudiantes[estudiante] = {};
                }
                if (nota) {
                    estudiantes[estudiante][criterio] = parseFloat(nota);
                }
            });

            if (!notasValidas) return;

            guardarPlanilla(curso, asignatura, criteriosInputs, estudiantes).then(async success => {
                if (success) {
                    const formPlanilla = document.getElementById('form-planilla-valoracion');
                    const listaPlanillas = document.getElementById('lista-planillas-valoracion');
                    
                    if (formPlanilla && listaPlanillas) {
                        formPlanilla.classList.add('hidden');
                        listaPlanillas.classList.remove('hidden');
                        listaPlanillas.innerHTML = await renderizarListaPlanillas();
                    }
                } else {
                    alert('Error al guardar la planilla');
                }
            });
        }
    });

    async function actualizarTablaValoracion() {
        console.log('Actualizando tabla de valoración');
        const curso = document.getElementById('curso-select-valoracion')?.value;
        const asignatura = document.getElementById('asignatura-select-valoracion')?.value;
        
        if (curso && asignatura) {
            const planillaContainer = document.getElementById('planilla-valoracion-container');
            if (planillaContainer) {
                const estudiantes = getEstudiantesPorCurso(curso);
                const criteriosInputs = Array.from(document.querySelectorAll('#criterios-container input[type="text"]'))
                    .map(input => input.value.trim())
                    .filter(Boolean);
                
                let planillaExistente;
                try {
                    planillaExistente = await db.get('planillasValoracion', [curso, asignatura]);
                } catch (e) {
                    console.log('No existe planilla previa');
                }
                
                planillaContainer.innerHTML = `
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Nombre Completo
                                    </th>
                                    ${criteriosInputs.map(criterio => `
                                        <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">
                                            ${criterio}
                                        </th>
                                    `).join('')}
                                    <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">
                                        Promedio
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estudiantes.map(estudiante => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 border-b border-gray-300">
                                            ${estudiante}
                                        </td>
                                        ${criteriosInputs.map(criterio => `
                                            <td class="px-6 py-4 border-b border-gray-300 text-center">
                                                <input type="number" 
                                                       class="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
                                                       min="1"
                                                       max="5"
                                                       step="0.1"
                                                       data-estudiante="${estudiante}"
                                                       data-criterio="${criterio}"
                                                       value="${planillaExistente?.estudiantes[estudiante]?.[criterio] || ''}"
                                                       onchange="this.value = Math.min(5, Math.max(1, this.value))">
                                            </td>
                                        `).join('')}
                                        <td class="px-6 py-4 border-b border-gray-300 text-center font-semibold">
                                            ${planillaExistente?.estudiantes[estudiante]?.promedio || '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                console.error('No se encontró el contenedor de la planilla');
            }
        }
    }

    const cursoSelect = document.getElementById('curso-select-valoracion');
    const asignaturaSelect = document.getElementById('asignatura-select-valoracion');
    
    if (cursoSelect && asignaturaSelect) {
        cursoSelect.addEventListener('change', actualizarTablaValoracion);
        asignaturaSelect.addEventListener('change', actualizarTablaValoracion);
    } else {
        console.error('No se encontraron los selectores de curso y asignatura');
    }

    // Escuchar el evento de importación de estudiantes
    window.addEventListener(STUDENTS_IMPORTED_EVENT, () => {
        console.log('Evento de importación de estudiantes detectado');
        actualizarTablaValoracion();
    });
}

// Exportar la estructura de datos para pruebas o uso externo
export const getPlanillasValoracion = async () => await getPlanillas();
