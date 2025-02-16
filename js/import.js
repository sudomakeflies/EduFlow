import db from './db.js';

// Evento personalizado para notificar cuando se importan estudiantes
export const STUDENTS_IMPORTED_EVENT = 'studentsImported';

// Objeto para manejar la gestión de estudiantes de manera centralizada
const StudentManager = {
    students: [],
    importHistory: [],
    
    setStudents(newStudents, source = 'manual') {
        const timestamp = new Date().toISOString();
        const changes = {
            added: [],
            updated: [],
            unchanged: []
        };

        // Crear un mapa de estudiantes existentes para búsqueda rápida
        const existingStudentsMap = new Map(
            this.students.map(student => [
                this.getStudentKey(student),
                student
            ])
        );

        const updatedStudents = [];
        
        for (const newStudent of newStudents) {
            const studentKey = this.getStudentKey(newStudent);
            const existingStudent = existingStudentsMap.get(studentKey);

            if (!existingStudent) {
                // Nuevo estudiante
                const studentWithMeta = {
                    ...newStudent,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                    lastImport: timestamp
                };
                updatedStudents.push(studentWithMeta);
                changes.added.push(studentWithMeta);
            } else {
                // Estudiante existente - verificar si hay cambios
                const hasChanges = this.hasStudentChanges(existingStudent, newStudent);
                if (hasChanges) {
                    const updatedStudent = {
                        ...existingStudent,
                        ...newStudent,
                        updatedAt: timestamp,
                        lastImport: timestamp
                    };
                    updatedStudents.push(updatedStudent);
                    changes.updated.push(updatedStudent);
                } else {
                    updatedStudents.push({
                        ...existingStudent,
                        lastImport: timestamp
                    });
                    changes.unchanged.push(existingStudent);
                }
            }
        }

        this.students = updatedStudents;
        
        // Guardar en el historial
        this.importHistory.push({
            timestamp,
            source,
            changes: {
                added: changes.added.length,
                updated: changes.updated.length,
                unchanged: changes.unchanged.length
            }
        });

        // Mantener solo los últimos 10 registros del historial
        if (this.importHistory.length > 10) {
            this.importHistory = this.importHistory.slice(-10);
        }

        // Disparar evento con detalles de los cambios
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                detail: { 
                    students: this.students,
                    changes
                }
            }));
        }

        return changes;
    },
    
    getStudents() {
        return this.students;
    },

    getImportHistory() {
        return this.importHistory;
    },

    // Función auxiliar para generar clave única de estudiante
    getStudentKey(student) {
        return `${student['Nombre Completo']}-${student['Curso'] || student['Grado']}`.toLowerCase();
    },

    // Función para verificar cambios en datos del estudiante
    hasStudentChanges(existing, newData) {
        const fieldsToCompare = ['Nombre Completo', 'Curso', 'Grado'];
        return fieldsToCompare.some(field => {
            const existingValue = (existing[field] || '').toLowerCase();
            const newValue = (newData[field] || '').toLowerCase();
            return existingValue !== newValue;
        });
    },

    validateStudentData(student) {
        const errors = [];
        
        if (!student['Nombre Completo']) {
            errors.push('El nombre del estudiante es requerido');
        } else if (student['Nombre Completo'].length < 3) {
            errors.push('El nombre del estudiante debe tener al menos 3 caracteres');
        }

        if (!student['Curso'] && !student['Grado']) {
            errors.push('El curso o grado es requerido');
        }

        return errors;
    }
};

// Cargar estudiantes guardados al inicio
async function loadSavedStudents() {
    try {
        const students = await db.getAll('estudiantes');
        if (students && students.length > 0) {
            const formattedStudents = students.map(student => ({
                'Nombre Completo': student.nombreCompleto,
                'Curso': student.curso,
                'createdAt': student.createdAt || new Date().toISOString(),
                'updatedAt': student.updatedAt || new Date().toISOString(),
                'lastImport': student.lastImport || new Date().toISOString()
            }));
            
            StudentManager.setStudents(formattedStudents, 'initial-load');
            console.log('Import: Loaded saved students:', formattedStudents);
        }
    } catch (e) {
        console.error('Import: Error loading saved students:', e);
    }
}

// Función para obtener los estudiantes importados
export function getImportedStudents() {
    console.log('Import: Getting imported students');
    return StudentManager.getStudents();
}

function renderImportHistory() {
    const historyContent = document.getElementById('history-content');
    if (!historyContent) return;

    const history = StudentManager.getImportHistory();
    if (history.length === 0) {
        historyContent.innerHTML = '<p class="text-gray-500">No hay historial de importaciones</p>';
        return;
    }

    historyContent.innerHTML = history.reverse().map(entry => `
        <div class="p-3 bg-white rounded border">
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-sm font-medium text-gray-600">
                        ${new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span class="ml-2 text-sm text-gray-500">
                        (${entry.source})
                    </span>
                </div>
                <div class="text-sm">
                    <span class="text-green-600">+${entry.changes.added}</span> /
                    <span class="text-blue-600">⟳${entry.changes.updated}</span> /
                    <span class="text-gray-600">${entry.changes.unchanged}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderStudentTable(studentTable) {
    if (!studentTable) return;
    studentTable.innerHTML = '';
    
    // Agregar barra de búsqueda
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mb-4';
    searchContainer.innerHTML = `
        <input type="text" 
               id="student-search" 
               placeholder="Buscar estudiantes..."
               class="w-full p-2 border rounded-md">
    `;
    studentTable.parentNode.insertBefore(searchContainer, studentTable);

    const renderRows = (students) => {
        studentTable.innerHTML = '';
        students.forEach(student => {
            const row = studentTable.insertRow();
            const nameCell = row.insertCell();
            const courseCell = row.insertCell();
            const dateCell = row.insertCell();
            const actionsCell = row.insertCell();
            
            nameCell.textContent = student['Nombre Completo'];
            courseCell.textContent = student['Curso'] || student['Grado'];
            
            // Mostrar fecha de última actualización
            const date = new Date(student.updatedAt || student.createdAt);
            dateCell.textContent = date.toLocaleDateString();
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm';
            deleteButton.style.display = 'inline-block';
            deleteButton.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
                    await deleteStudent(student);
                    renderStudentTable(studentTable);
                }
            });
            actionsCell.appendChild(deleteButton);
        });
    };

    // Implementar búsqueda
    const searchInput = document.getElementById('student-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredStudents = StudentManager.getStudents().filter(student => 
                student['Nombre Completo'].toLowerCase().includes(searchTerm) ||
                (student['Curso'] || student['Grado']).toLowerCase().includes(searchTerm)
            );
            renderRows(filteredStudents);
        });
    }

    // Renderizar todos los estudiantes inicialmente
    renderRows(StudentManager.getStudents());
}

export async function initializeImport() {
    console.log('Import: Initializing import functionality');
    await loadSavedStudents();

    const fileUpload = document.getElementById('file-upload');
    const studentTable = document.getElementById('student-table')?.getElementsByTagName('tbody')[0];
    const importMessage = document.getElementById('import-message');
    const addStudentButton = document.getElementById('add-student-button');
    const newStudentNameInput = document.getElementById('new-student-name');
    const newStudentCourseInput = document.getElementById('new-student-course');

    // Mostrar estudiantes existentes si hay
    if (studentTable && StudentManager.students.length > 0) {
        console.log('Import: Displaying existing students in table');
        renderStudentTable(studentTable);
    }

    if (addStudentButton) {
        addStudentButton.addEventListener('click', async () => {
            const name = newStudentNameInput.value;
            const course = newStudentCourseInput.value;

            if (name && course) {
                const newStudent = { 
                    'Nombre Completo': name, 
                    'Curso': course,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastImport: new Date().toISOString()
                };
                StudentManager.students = [...StudentManager.students, newStudent];
                StudentManager.setStudents(StudentManager.students, 'manual-add');

                // Save to IndexedDB
                try {
                    await db.clear('estudiantes');
                    for (const student of StudentManager.getStudents()) {
                        const { id, ...studentData } = student; // Remove id if it exists
                        await db.add('estudiantes', {
                            nombreCompleto: studentData['Nombre Completo'],
                            curso: studentData['Curso'] || studentData['Grado'],
                            createdAt: studentData.createdAt,
                            updatedAt: studentData.updatedAt,
                            lastImport: studentData.lastImport
                        });
                    }
                    console.log('Import: Students saved to IndexedDB');
                } catch (e) {
                    console.error('Import: Error saving students to IndexedDB:', e);
                }

                // Clear input fields
                newStudentNameInput.value = '';
                newStudentCourseInput.value = '';
            }
        });
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', async (e) => {
            console.log('Import: File selected');
            const file = e.target.files[0];
            const previewContainer = document.getElementById('preview-container');
            const previewContent = document.getElementById('preview-content');
            const previewSummary = document.getElementById('preview-summary');
            const confirmImportBtn = document.getElementById('confirm-import');
            const cancelImportBtn = document.getElementById('cancel-import');

            if (file) {
                Papa.parse(file, {
                    header: true,
                    preview: 5, // Solo mostrar primeras 5 filas en preview
                    complete: async function(results) {
                        if (results.data && results.data.length > 0) {
                            // Validar estructura del CSV
                            const requiredColumns = ['Nombre Completo', 'Curso'];
                            const missingColumns = requiredColumns.filter(col => 
                                !results.meta.fields.includes(col) && !results.meta.fields.includes('Grado')
                            );

                            if (missingColumns.length > 0) {
                                importMessage.textContent = `El archivo CSV debe contener las columnas: ${missingColumns.join(', ')}`;
                                importMessage.className = 'mt-2 text-sm text-red-500';
                                return;
                            }

                            // Filtrar y validar estudiantes
                            const newStudents = results.data.filter(student => 
                                student['Nombre Completo'] && (student['Curso'] || student['Grado'])
                            );

                            const invalidStudents = results.data.filter(student => {
                                const errors = StudentManager.validateStudentData(student);
                                return errors.length > 0;
                            });

                            // Mostrar vista previa
                            previewContent.innerHTML = `
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                ${results.meta.fields.map(field => 
                                                    `<th class="px-4 py-2 bg-gray-50">${field}</th>`
                                                ).join('')}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${newStudents.slice(0, 5).map(student => `
                                                <tr>
                                                    ${results.meta.fields.map(field => 
                                                        `<td class="px-4 py-2">${student[field] || ''}</td>`
                                                    ).join('')}
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;

                            // Mostrar resumen
                            const existingStudents = StudentManager.getStudents();
                            const potentialDuplicates = newStudents.filter(newStudent => 
                                existingStudents.some(existing => 
                                    StudentManager.getStudentKey(existing) === StudentManager.getStudentKey(newStudent)
                                )
                            );

                            previewSummary.innerHTML = `
                                <p>Total de registros: ${results.data.length}</p>
                                <p>Estudiantes válidos: ${newStudents.length}</p>
                                <p>Registros inválidos: ${invalidStudents.length}</p>
                                <p>Posibles actualizaciones: ${potentialDuplicates.length}</p>
                                ${invalidStudents.length > 0 ? `
                                    <div class="mt-2 text-red-500">
                                        <p>Registros con errores:</p>
                                        <ul class="list-disc pl-5">
                                            ${invalidStudents.slice(0, 3).map(student => 
                                                `<li>${student['Nombre Completo'] || 'Sin nombre'} - ${StudentManager.validateStudentData(student).join(', ')}</li>`
                                            ).join('')}
                                            ${invalidStudents.length > 3 ? `<li>... y ${invalidStudents.length - 3} más</li>` : ''}
                                        </ul>
                                    </div>
                                ` : ''}
                            `;

                            // Mostrar controles de importación
                            previewContainer.classList.remove('hidden');

                            // Manejar confirmación de importación
                            confirmImportBtn.onclick = async () => {
                                try {
                                    // Update StudentManager with all students
                                    const allStudents = [...existingStudents, ...newStudents];
                                    const changes = StudentManager.setStudents(allStudents, 'csv-import');

                                    // Save to IndexedDB
                                    await db.clear('estudiantes');
                                    for (const student of StudentManager.getStudents()) {
                                        const { id, ...studentData } = student;
                                        await db.add('estudiantes', {
                                            nombreCompleto: studentData['Nombre Completo'],
                                            curso: studentData['Curso'] || studentData['Grado'],
                                            createdAt: studentData.createdAt,
                                            updatedAt: studentData.updatedAt,
                                            lastImport: studentData.lastImport
                                        });
                                    }

                                    // Actualizar UI
                                    renderStudentTable(studentTable);
                                    previewContainer.classList.add('hidden');
                                    fileUpload.value = ''; // Limpiar input

                                    // Mostrar mensaje de éxito con resumen
                                    importMessage.innerHTML = `
                                        Importación exitosa:<br>
                                        - ${changes.added.length} estudiantes nuevos<br>
                                        - ${changes.updated.length} actualizados<br>
                                        - ${changes.unchanged.length} sin cambios
                                    `;
                                    importMessage.className = 'mt-2 text-sm text-green-500';
                                } catch (e) {
                                    console.error('Import: Error durante la importación:', e);
                                    importMessage.textContent = 'Error al importar estudiantes: ' + e.message;
                                    importMessage.className = 'mt-2 text-sm text-red-500';
                                }
                            };

                            // Manejar cancelación
                            cancelImportBtn.onclick = () => {
                                previewContainer.classList.add('hidden');
                                fileUpload.value = '';
                                importMessage.textContent = 'Importación cancelada';
                                importMessage.className = 'mt-2 text-sm text-gray-500';
                            };
                        } else {
                            importMessage.textContent = 'No se encontraron datos válidos en el archivo.';
                            importMessage.className = 'mt-2 text-sm text-red-500';
                        }
                    },
                    error: function(error) {
                        console.error('Import: Error parsing file:', error);
                        importMessage.textContent = 'Error al cargar el archivo: ' + error.message;
                        importMessage.className = 'mt-2 text-sm text-red-500';
                    }
                });
            } else {
                importMessage.textContent = 'No se ha seleccionado ningún archivo.';
                importMessage.className = 'mt-2 text-sm text-red-500';
            }
        });
    }
    
    // Listen for student import events
    window.addEventListener(STUDENTS_IMPORTED_EVENT, () => {
        if (studentTable) {
            renderStudentTable(studentTable);
        }
        renderImportHistory();
    });

    // Render initial states
    renderImportHistory();
}

export function renderImportSection() {
    console.log('Import: Rendering import section');
    
    const section = `
        <section id="import-students" class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold text-gray-800">Importar Estudiantes</h2>
            </div>
            
            <div class="space-y-4">
                <div id="import-controls" class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Importar desde CSV</h3>
                    <div class="flex items-center space-x-4">
                        <input type="file" 
                               id="file-upload" 
                               accept=".csv"
                               class="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100">
                    </div>
                    <div id="preview-container" class="mt-4 hidden">
                        <h4 class="font-medium text-gray-700 mb-2">Vista Previa:</h4>
                        <div id="preview-content" class="max-h-60 overflow-y-auto bg-white p-4 rounded border"></div>
                        <div id="preview-summary" class="mt-2 text-sm text-gray-600"></div>
                        <div class="mt-4 flex space-x-2">
                            <button id="confirm-import" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Confirmar Importación
                            </button>
                            <button id="cancel-import" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                <div id="add-student-form" class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Agregar Estudiante</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="new-student-name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" id="new-student-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                        <div>
                            <label for="new-student-course" class="block text-sm font-medium text-gray-700">Curso</label>
                            <input type="text" id="new-student-course" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        </div>
                    </div>
                    <div class="mt-4">
                        <button id="add-student-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Agregar
                        </button>
                    </div>
                </div>
                
                <div id="import-message" class="mt-2 text-sm"></div>
                
                <div class="overflow-x-auto">
                    <table id="student-table" class="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left">Nombre</th>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left">Curso</th>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left">Última Actualización</th>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>

                <div id="import-history" class="mt-6 border rounded-lg p-4 bg-gray-50">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Historial de Importaciones</h3>
                    <div id="history-content" class="space-y-2"></div>
                </div>
            </div>
        </section>
    `;
    
    // Use a timeout to ensure the table is rendered after the HTML is added to the DOM
    setTimeout(() => {
        const studentTable = document.getElementById('student-table')?.getElementsByTagName('tbody')[0];
        renderStudentTable(studentTable);
    }, 0);

    return section;
}

async function deleteStudent(student) {
    StudentManager.students = StudentManager.students.filter(s => s['Nombre Completo'] !== student['Nombre Completo'] || s['Curso'] !== student['Curso']);
    StudentManager.setStudents(StudentManager.students);

    // Save to IndexedDB
    try {
        await db.clear('estudiantes');
        for (const student of StudentManager.getStudents()) {
            const { id, ...studentData } = student; // Remove id if it exists
            await db.add('estudiantes', {
                nombreCompleto: studentData['Nombre Completo'],
                curso: studentData['Curso'] || studentData['Grado'],
                createdAt: studentData.createdAt,
                updatedAt: studentData.updatedAt,
                lastImport: studentData.lastImport
            });
        }
        console.log('Import: Students saved to IndexedDB');
    } catch (e) {
        console.error('Import: Error saving students to IndexedDB:', e);
    }
}
