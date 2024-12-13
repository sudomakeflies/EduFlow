import { getImportedStudents, STUDENTS_IMPORTED_EVENT } from './import.js';

// Estructura de datos para almacenar la asistencia
let asistenciaData = {};

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

// Función para obtener los ausentes de un curso y fecha específicos
function getAusentes(fecha, curso) {
    return asistenciaData[fecha]?.[curso]?.ausentes || [];
}

// Función para guardar la asistencia
function guardarAsistencia(fecha, curso, ausentes) {
    if (!asistenciaData[fecha]) {
        asistenciaData[fecha] = {};
    }
    if (!asistenciaData[fecha][curso]) {
        asistenciaData[fecha][curso] = {};
    }
    asistenciaData[fecha][curso].ausentes = ausentes;
    console.log('Asistencia guardada:', asistenciaData);
}

// Función para actualizar el selector de cursos
function actualizarSelectorCursos() {
    const cursoSelect = document.getElementById('curso-select');
    if (cursoSelect) {
        const cursos = getCursosUnicos();
        console.log('Cursos disponibles:', cursos); // Debug
        
        cursoSelect.innerHTML = `
            <option value="">Seleccione un curso</option>
            ${cursos.map(curso => `
                <option value="${curso}">${curso}</option>
            `).join('')}
        `;
    }
}

// Función para renderizar la planilla de asistencia
function renderizarPlanilla(curso, fecha) {
    const estudiantes = getEstudiantesPorCurso(curso);
    const ausentes = getAusentes(fecha, curso);
    
    if (estudiantes.length === 0) {
        return `
            <div class="text-red-500 mb-4">
                No hay estudiantes registrados para el curso ${curso}
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                            Nombre Completo
                        </th>
                        <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">
                            Ausente
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${estudiantes.map(estudiante => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 border-b border-gray-300">
                                ${estudiante}
                            </td>
                            <td class="px-6 py-4 border-b border-gray-300 text-center">
                                <input type="checkbox" 
                                       class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300"
                                       ${ausentes.includes(estudiante) ? 'checked' : ''}
                                       data-estudiante="${estudiante}">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Función para renderizar la sección completa de asistencia
export function renderAsistenciaSection() {
    const cursos = getCursosUnicos();
    console.log('Renderizando sección con cursos:', cursos); // Debug
    const today = new Date().toISOString().split('T')[0];

    return `
        <section id="asistencia-section" class="space-y-6">
            <h2 class="text-2xl font-semibold text-gray-800">Planillas de Asistencia</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Curso
                    </label>
                    <select id="curso-select" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Seleccione un curso</option>
                        ${cursos.map(curso => `
                            <option value="${curso}">${curso}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                    </label>
                    <input type="date" 
                           id="fecha-select" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                           value="${today}">
                </div>
            </div>

            <div id="planilla-container" class="mt-4">
                <div class="text-gray-500 text-center py-8">
                    Seleccione un curso y una fecha para ver la planilla
                </div>
            </div>

            <div class="flex justify-end space-x-4 mt-4">
                <button id="cancelar-asistencia" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancelar
                </button>
                <button id="guardar-asistencia" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Guardar
                </button>
            </div>
        </section>
    `;
}

// Función para inicializar los eventos de la sección de asistencia
export function initializeAsistencia() {
    console.log('Inicializando asistencia...'); // Debug
    const cursoSelect = document.getElementById('curso-select');
    const fechaSelect = document.getElementById('fecha-select');
    const planillaContainer = document.getElementById('planilla-container');
    const guardarBtn = document.getElementById('guardar-asistencia');
    const cancelarBtn = document.getElementById('cancelar-asistencia');

    function actualizarPlanilla() {
        const curso = cursoSelect.value;
        const fecha = fechaSelect.value;
        
        if (curso && fecha) {
            planillaContainer.innerHTML = renderizarPlanilla(curso, fecha);
        } else {
            planillaContainer.innerHTML = `
                <div class="text-gray-500 text-center py-8">
                    Seleccione un curso y una fecha para ver la planilla
                </div>
            `;
        }
    }

    // Event listeners
    cursoSelect?.addEventListener('change', actualizarPlanilla);
    fechaSelect?.addEventListener('change', actualizarPlanilla);

    guardarBtn?.addEventListener('click', () => {
        const curso = cursoSelect.value;
        const fecha = fechaSelect.value;

        if (!curso || !fecha) {
            alert('Por favor seleccione un curso y una fecha');
            return;
        }

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const ausentes = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.estudiante);

        guardarAsistencia(fecha, curso, ausentes);
        alert('Asistencia guardada correctamente');
    });

    cancelarBtn?.addEventListener('click', () => {
        cursoSelect.value = '';
        fechaSelect.value = new Date().toISOString().split('T')[0];
        actualizarPlanilla();
    });

    // Escuchar el evento de importación de estudiantes
    window.addEventListener(STUDENTS_IMPORTED_EVENT, (event) => {
        console.log('Evento de importación recibido:', event.detail?.students); // Debug
        actualizarSelectorCursos();
        actualizarPlanilla();
    });

    // Verificar si ya hay estudiantes importados al inicializar
    const estudiantes = getImportedStudents();
    if (estudiantes.length > 0) {
        console.log('Estudiantes existentes encontrados:', estudiantes); // Debug
        actualizarSelectorCursos();
    }
}

// Exportar la estructura de datos para pruebas o uso externo
export const getAsistenciaData = () => asistenciaData;
