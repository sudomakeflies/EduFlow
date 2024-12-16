import { getImportedStudents, STUDENTS_IMPORTED_EVENT } from './import.js';
import db from './db.js';

// Lista de asignaturas disponibles
const ASIGNATURAS = [
    'Matemáticas',
    'Física',
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

// Función para obtener la hora actual en formato HH:MM
function getHoraActual() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Función para obtener los ausentes de un curso, fecha y hora específicos
async function getAusentes(fecha, curso, hora) {
    try {
        const planilla = await db.get('asistencia', `${fecha}-${curso}-${hora}`);
        return planilla?.ausentes || [];
    } catch (e) {
        console.error('Error getting ausentes:', e);
        return [];
    }
}

// Función para obtener la asignatura de una planilla
async function getAsignatura(fecha, curso, hora) {
    try {
        const planilla = await db.get('asistencia', `${fecha}-${curso}-${hora}`);
        return planilla?.asignatura || '';
    } catch (e) {
        console.error('Error getting asignatura:', e);
        return '';
    }
}

// Función para guardar la asistencia
async function guardarAsistencia(fecha, curso, hora, asignatura, ausentes) {
    try {
        const id = `${fecha}-${curso}-${hora}`;
        await db.put('asistencia', {
            id,
            fecha,
            curso,
            hora,
            asignatura,
            ausentes
        });
        console.log('Asistencia guardada:', { fecha, curso, hora, asignatura, ausentes });
        return true;
    } catch (e) {
        console.error('Error saving attendance:', e);
        return false;
    }
}

// Función para eliminar una planilla
async function eliminarPlanilla(fecha, curso, hora) {
    try {
        const id = `${fecha}-${curso}-${hora}`;
        await db.delete('asistencia', id);
        return true;
    } catch (e) {
        console.error('Error deleting attendance:', e);
        return false;
    }
}

// Función para obtener todas las planillas
async function getPlanillas() {
    try {
        const planillas = await db.getAll('asistencia');
        return planillas.sort((a, b) => {
            // Ordenar por fecha descendente y hora
            return b.fecha.localeCompare(a.fecha) || a.hora.localeCompare(b.hora);
        });
    } catch (e) {
        console.error('Error getting planillas:', e);
        return [];
    }
}

// Función para renderizar la lista de planillas
async function renderizarListaPlanillas() {
    const planillas = await getPlanillas();
    console.log('Renderizando planillas:', planillas);
    
    if (planillas.length === 0) {
        return `
            <div class="text-gray-500 text-center py-8">
                No hay planillas de asistencia registradas
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="px-4 py-2 border-b bg-gray-100">Fecha</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Hora</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Curso</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Asignatura</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Ausentes</th>
                        <th class="px-4 py-2 border-b bg-gray-100">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${planillas.map(p => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 border-b">${p.fecha}</td>
                            <td class="px-4 py-2 border-b">${p.hora}</td>
                            <td class="px-4 py-2 border-b">${p.curso}</td>
                            <td class="px-4 py-2 border-b">${p.asignatura}</td>
                            <td class="px-4 py-2 border-b">${p.ausentes.length} estudiantes</td>
                            <td class="px-4 py-2 border-b">
                                <div class="flex space-x-2">
                                    <button class="text-blue-600 hover:text-blue-800"
                                            onclick="window.editarPlanilla('${p.fecha}', '${p.curso}', '${p.hora}')">
                                        ✏️ Editar
                                    </button>
                                    <button class="text-red-600 hover:text-red-800"
                                            onclick="window.eliminarPlanillaConfirm('${p.fecha}', '${p.curso}', '${p.hora}')">
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

// Función para renderizar la sección completa de asistencia
export function renderAsistenciaSection() {
    const cursos = getCursosUnicos();
    const today = new Date().toISOString().split('T')[0];

    return `
        <section id="asistencia-section" class="space-y-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-800">Planillas de Asistencia</h2>
                <div class="space-x-2">
                    <button id="btn-exportar" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Exportar
                    </button>
                    <button id="btn-importar" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Importar
                    </button>
                    <button id="nueva-planilla" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Nueva Planilla
                    </button>
                </div>
            </div>

            <div id="lista-planillas" class="mb-6">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p class="mt-2 text-gray-600">Cargando planillas...</p>
                </div>
            </div>

            <div id="form-planilla" class="hidden space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900">Nueva Planilla de Asistencia</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Curso -->
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
                    
                    <!-- Fecha -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Fecha
                        </label>
                        <input type="date" 
                               id="fecha-select" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                               value="${today}">
                    </div>

                    <!-- Asignatura -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Asignatura
                        </label>
                        <select id="asignatura-select" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Seleccione una asignatura</option>
                            ${ASIGNATURAS.map(asignatura => `
                                <option value="${asignatura}">${asignatura}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div id="planilla-container" class="mt-4">
                    <div class="text-gray-500 text-center py-8">
                        Seleccione un curso y una fecha para ver la planilla
                    </div>
                </div>

                <div class="flex justify-end space-x-4 mt-4">
                    <button id="cancelar-asistencia" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button id="guardar-asistencia" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Guardar
                    </button>
                </div>
            </div>
        </section>
    `;
}

// Función para inicializar los eventos de la sección de asistencia
export function initializeAsistencia() {
    console.log('Inicializando asistencia...');
    
    // Actualizar la lista de planillas inmediatamente
    const listaPlanillas = document.getElementById('lista-planillas');
    if (listaPlanillas) {
        renderizarListaPlanillas().then(html => {
            listaPlanillas.innerHTML = html;
        });
    }
    
    // Exponer funciones necesarias para los eventos onclick en la tabla
    window.editarPlanilla = async (fecha, curso, hora) => {
        const formPlanilla = document.getElementById('form-planilla');
        const listaPlanillas = document.getElementById('lista-planillas');
        const cursoSelect = document.getElementById('curso-select');
        const fechaSelect = document.getElementById('fecha-select');
        const asignaturaSelect = document.getElementById('asignatura-select');
        
        if (formPlanilla && listaPlanillas && cursoSelect && fechaSelect) {
            formPlanilla.classList.remove('hidden');
            listaPlanillas.classList.add('hidden');
            
            cursoSelect.value = curso;
            fechaSelect.value = fecha;
            
            // Establecer la asignatura
            if (asignaturaSelect) {
                const asignatura = await getAsignatura(fecha, curso, hora);
                asignaturaSelect.value = asignatura;
            }
            
            const planillaContainer = document.getElementById('planilla-container');
            if (planillaContainer) {
                const estudiantes = getEstudiantesPorCurso(curso);
                const ausentes = await getAusentes(fecha, curso, hora);
                
                planillaContainer.innerHTML = `
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
            
            // Guardar la hora actual para la edición
            formPlanilla.dataset.editandoHora = hora;
        }
    };

    window.eliminarPlanillaConfirm = async (fecha, curso, hora) => {
        if (confirm('¿Está seguro de que desea eliminar esta planilla?')) {
            if (await eliminarPlanilla(fecha, curso, hora)) {
                const listaPlanillas = document.getElementById('lista-planillas');
                if (listaPlanillas) {
                    listaPlanillas.innerHTML = await renderizarListaPlanillas();
                }
            }
        }
    };

    // Event Listeners
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'nueva-planilla') {
            const formPlanilla = document.getElementById('form-planilla');
            const listaPlanillas = document.getElementById('lista-planillas');
            
            if (formPlanilla && listaPlanillas) {
                formPlanilla.classList.remove('hidden');
                listaPlanillas.classList.add('hidden');
                formPlanilla.dataset.editandoHora = ''; // Nueva planilla
                
                // Resetear el formulario
                const cursoSelect = document.getElementById('curso-select');
                const fechaSelect = document.getElementById('fecha-select');
                const asignaturaSelect = document.getElementById('asignatura-select');
                
                if (cursoSelect && fechaSelect && asignaturaSelect) {
                    cursoSelect.value = '';
                    fechaSelect.value = new Date().toISOString().split('T')[0];
                    asignaturaSelect.value = '';
                }
                
                const planillaContainer = document.getElementById('planilla-container');
                if (planillaContainer) {
                    planillaContainer.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            Seleccione un curso y una fecha para ver la planilla
                        </div>
                    `;
                }
            }
        }

        if (e.target.id === 'btn-exportar') {
            try {
                const data = await db.getAll('asistencia');
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'asistencia.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error('Error exporting data:', e);
                alert('Error al exportar los datos');
            }
        }

        if (e.target.id === 'btn-importar') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                try {
                    const file = e.target.files[0];
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid data format');
                    }

                    await db.clear('asistencia');
                    for (const planilla of data) {
                        await db.add('asistencia', planilla);
                    }
                    
                    const listaPlanillas = document.getElementById('lista-planillas');
                    if (listaPlanillas) {
                        listaPlanillas.innerHTML = await renderizarListaPlanillas();
                    }
                } catch (e) {
                    console.error('Error importing data:', e);
                    alert('Error al importar los datos');
                }
            };
            input.click();
        }
        
        if (e.target.id === 'cancelar-asistencia') {
            const formPlanilla = document.getElementById('form-planilla');
            const listaPlanillas = document.getElementById('lista-planillas');
            
            if (formPlanilla && listaPlanillas) {
                formPlanilla.classList.add('hidden');
                listaPlanillas.classList.remove('hidden');
            }
        }
        
        if (e.target.id === 'guardar-asistencia') {
            const curso = document.getElementById('curso-select')?.value;
            const fecha = document.getElementById('fecha-select')?.value;
            const asignatura = document.getElementById('asignatura-select')?.value;
            const formPlanilla = document.getElementById('form-planilla');
            
            if (!curso || !fecha || !asignatura) {
                alert('Por favor complete todos los campos');
                return;
            }

            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const ausentes = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.dataset.estudiante);

            // Usar la hora existente si está editando, o crear una nueva
            const hora = formPlanilla?.dataset.editandoHora || getHoraActual();
            
            if (await guardarAsistencia(fecha, curso, hora, asignatura, ausentes)) {
                // Volver a la lista
                if (formPlanilla) {
                    formPlanilla.classList.add('hidden');
                    const listaPlanillas = document.getElementById('lista-planillas');
                    if (listaPlanillas) {
                        listaPlanillas.classList.remove('hidden');
                        listaPlanillas.innerHTML = await renderizarListaPlanillas();
                    }
                }
            }
        }
    });

    const cursoSelect = document.getElementById('curso-select');
    const fechaSelect = document.getElementById('fecha-select');
    
    function actualizarPlanilla() {
        const curso = cursoSelect?.value;
        const fecha = fechaSelect?.value;
        const formPlanilla = document.getElementById('form-planilla');
        const hora = formPlanilla?.dataset.editandoHora || getHoraActual();
        
        if (curso && fecha) {
            const planillaContainer = document.getElementById('planilla-container');
            if (planillaContainer) {
                const estudiantes = getEstudiantesPorCurso(curso);
                planillaContainer.innerHTML = `
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
                                                   data-estudiante="${estudiante}">
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    }

    if (cursoSelect && fechaSelect) {
        cursoSelect.addEventListener('change', actualizarPlanilla);
        fechaSelect.addEventListener('change', actualizarPlanilla);
    }

    // Escuchar el evento de importación de estudiantes
    window.addEventListener(STUDENTS_IMPORTED_EVENT, () => {
        actualizarPlanilla();
    });
}
