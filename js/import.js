import db from './db.js';

let importedStudents = [];

// Evento personalizado para notificar cuando se importan estudiantes
export const STUDENTS_IMPORTED_EVENT = 'studentsImported';

// Cargar estudiantes guardados al inicio
async function loadSavedStudents() {
    try {
        const students = await db.getAll('estudiantes');
        if (students && students.length > 0) {
            importedStudents = students.map(student => ({
                'Nombre Completo': student.nombreCompleto,
                'Curso': student.curso
            }));
            console.log('Import: Loaded saved students:', importedStudents);
            
            // Disparar evento para notificar que hay estudiantes cargados
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                    detail: { students: importedStudents }
                }));
            }
        }
    } catch (e) {
        console.error('Import: Error loading saved students:', e);
    }
}

// Función para obtener los estudiantes importados
export function getImportedStudents() {
    console.log('Import: Getting imported students:', importedStudents);
    return importedStudents;
}

export async function initializeImport() {
    console.log('Import: Initializing import functionality');
    await loadSavedStudents();

    const fileUpload = document.getElementById('file-upload');
    const studentTable = document.getElementById('student-table')?.getElementsByTagName('tbody')[0];
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const importMessage = document.getElementById('import-message');

    // Mostrar estudiantes existentes si hay
    if (studentTable && importedStudents.length > 0) {
        console.log('Import: Displaying existing students in table');
        studentTable.innerHTML = '';
        importedStudents.forEach(student => {
            const row = studentTable.insertRow();
            const nameCell = row.insertCell();
            const courseCell = row.insertCell();
            nameCell.textContent = student['Nombre Completo'];
            courseCell.textContent = student['Curso'] || student['Grado'];
        });
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            console.log('Import: File selected');
            const file = e.target.files[0];
            if (file) {
                Papa.parse(file, {
                    header: true,
                    complete: async function(results) {
                        if (results.data && results.data.length > 0) {
                            if (studentTable) {
                                studentTable.innerHTML = '';
                                importedStudents = results.data.filter(student => 
                                    student['Nombre Completo'] && (student['Curso'] || student['Grado'])
                                );
                                
                                importedStudents.forEach(student => {
                                    const row = studentTable.insertRow();
                                    const nameCell = row.insertCell();
                                    const courseCell = row.insertCell();
                                    nameCell.textContent = student['Nombre Completo'];
                                    courseCell.textContent = student['Curso'] || student['Grado'];
                                });
                                
                                // Guardar en IndexedDB
                                try {
                                    await db.clear('estudiantes');
                                    for (const student of importedStudents) {
                                        await db.add('estudiantes', {
                                            nombreCompleto: student['Nombre Completo'],
                                            curso: student['Curso'] || student['Grado']
                                        });
                                    }
                                    console.log('Import: Students saved to IndexedDB');
                                } catch (e) {
                                    console.error('Import: Error saving students to IndexedDB:', e);
                                }
                                
                                // Disparar evento cuando se importan estudiantes
                                window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                                    detail: { students: importedStudents }
                                }));
                                console.log('Import: Students imported event dispatched');
                            }
                            importMessage.textContent = 'Archivo cargado correctamente.';
                            importMessage.className = 'mt-2 text-sm text-green-500';
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

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            if (importedStudents.length > 0) {
                console.log('Import: Saving imported students');
                
                // Guardar en IndexedDB
                try {
                    await db.clear('estudiantes');
                    for (const student of importedStudents) {
                        await db.add('estudiantes', {
                            nombreCompleto: student['Nombre Completo'],
                            curso: student['Curso'] || student['Grado']
                        });
                    }
                    console.log('Import: Students saved to IndexedDB');
                    importMessage.textContent = 'Datos guardados correctamente.';
                    importMessage.className = 'mt-2 text-sm text-green-500';
                    
                    // Disparar evento cuando se guardan los estudiantes
                    window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                        detail: { students: importedStudents }
                    }));
                    console.log('Import: Students saved event dispatched');
                } catch (e) {
                    console.error('Import: Error saving students to IndexedDB:', e);
                    importMessage.textContent = 'Error al guardar los datos.';
                    importMessage.className = 'mt-2 text-sm text-red-500';
                }
            } else {
                importMessage.textContent = 'No hay datos para guardar.';
                importMessage.className = 'mt-2 text-sm text-red-500';
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            console.log('Import: Cancel button clicked');
            const content = document.getElementById('content');
            if (content) {
                content.innerHTML = `
                    <h2 class="text-2xl font-semibold text-gray-800 mb-4">¡Bienvenido a EduFlow!</h2>
                    <p class="text-gray-600">
                        Selecciona una opción del menú para comenzar a gestionar tu institución educativa.
                    </p>
                `;
            }
        });
    }
}

export function renderImportSection() {
    console.log('Import: Rendering import section');
    return `
        <section id="import-students" class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold text-gray-800">Importar Estudiantes</h2>
            </div>
            
            <div class="space-y-4">
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
                
                <div id="import-message" class="mt-2 text-sm"></div>
                
                <div class="overflow-x-auto">
                    <table id="student-table" class="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Nombre Completo
                                </th>
                                <th class="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Curso
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button id="cancel-button"
                            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button id="save-button"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Guardar
                    </button>
                </div>
            </div>
        </section>
    `;
}
