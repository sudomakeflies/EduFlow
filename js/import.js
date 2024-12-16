import db from './db.js';

let importedStudents = [];

// Evento personalizado para notificar cuando se importan estudiantes
export const STUDENTS_IMPORTED_EVENT = 'studentsImported';

// Objeto para manejar la gestión de estudiantes de manera centralizada
const StudentManager = {
    students: [],
    
    setStudents(newStudents) {
        this.students = newStudents;
        // Disparar evento cuando se actualizan los estudiantes
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                detail: { students: this.students }
            }));
        }
    },
    
    getStudents() {
        return this.students;
    }
};

// Cargar estudiantes guardados al inicio
async function loadSavedStudents() {
    try {
        const students = await db.getAll('estudiantes');
        if (students && students.length > 0) {
            const formattedStudents = students.map(student => ({
                'Nombre Completo': student.nombreCompleto,
                'Curso': student.curso
            }));
            
            StudentManager.setStudents(formattedStudents);
            console.log('Import: Loaded saved students:', formattedStudents);
        }
    } catch (e) {
        console.error('Import: Error loading saved students:', e);
    }
}

// Función para obtener los estudiantes importados
export function getImportedStudents() {
    console.log('Import: Getting imported students:', importedStudents);
    return StudentManager.getStudents();
}

export async function initializeImport() {
    console.log('Import: Initializing import functionality');
    await loadSavedStudents();

    const fileUpload = document.getElementById('file-upload');
    const studentTable = document.getElementById('student-table')?.getElementsByTagName('tbody')[0];   
    const importMessage = document.getElementById('import-message');

    // Mostrar estudiantes existentes si hay
    if (studentTable && StudentManager.students.length > 0) {
        console.log('Import: Displaying existing students in table');
        studentTable.innerHTML = '';
        StudentManager.forEach(student => {
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

                                // Usar el método centralizado para establecer estudiantes
                                StudentManager.setStudents(importedStudents);
                                
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
            </div>
        </section>
    `;
}
