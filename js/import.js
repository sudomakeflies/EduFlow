let importedStudents = [];

// Función para obtener los estudiantes importados
export function getImportedStudents() {
    return importedStudents;
}

// Evento personalizado para notificar cuando se importan estudiantes
export const STUDENTS_IMPORTED_EVENT = 'studentsImported';

export function initializeImport() {
    const fileUpload = document.getElementById('file-upload');
    const studentTable = document.getElementById('student-table')?.getElementsByTagName('tbody')[0];
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const importMessage = document.getElementById('import-message');

    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                Papa.parse(file, {
                    header: true,
                    complete: function(results) {
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
                                
                                // Disparar evento cuando se importan estudiantes
                                window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                                    detail: { students: importedStudents }
                                }));
                            }
                            importMessage.textContent = 'Archivo cargado correctamente.';
                            importMessage.className = 'mt-2 text-sm text-green-500';
                        } else {
                            importMessage.textContent = 'No se encontraron datos válidos en el archivo.';
                            importMessage.className = 'mt-2 text-sm text-red-500';
                        }
                    },
                    error: function(error) {
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
        saveButton.addEventListener('click', () => {
            if (importedStudents.length > 0) {
                console.log('Imported students:', importedStudents);
                importMessage.textContent = 'Datos guardados temporalmente. Puedes verlos en la consola del navegador.';
                importMessage.className = 'mt-2 text-sm text-green-500';
                
                // Disparar evento cuando se guardan los estudiantes
                window.dispatchEvent(new CustomEvent(STUDENTS_IMPORTED_EVENT, {
                    detail: { students: importedStudents }
                }));
            } else {
                importMessage.textContent = 'No hay datos para guardar.';
                importMessage.className = 'mt-2 text-sm text-red-500';
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
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
    return `
        <section id="import-students">
            <h2>Importar Estudiantes</h2>
            <input type="file" id="file-upload" accept=".csv">
            <div id="import-message" class="mt-2 text-sm"></div>
            <table id="student-table">
                <thead>
                    <tr>
                        <th>Nombre Completo</th>
                        <th>Curso</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <button id="save-button">Guardar</button>
            <button id="cancel-button">Cancelar</button>
        </section>
    `;
}
