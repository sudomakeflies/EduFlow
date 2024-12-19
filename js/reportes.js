import db from './db.js';

const url = "https://api.vectorshift.ai/api/chatbots/run";
let headers = {
    "Content-Type": "application/json",
  };

async function getApiKey() {
    try {
        const response = await fetch('key.txt');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo');
        }
        const apiKey = await response.text();
        return apiKey.trim();
    } catch (error) {
        console.error('Error al leer la API key:', error);
        return null;
    }
}


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

export function renderReportesSection() {
    let subjectOptions = ASIGNATURAS.map(subject => `<option value="${subject}">${subject}</option>`).join('');

    return `
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Reportes</h2>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="grade">
                Grado:
            </label>
            <select id="grade" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
            </select>
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="subject">
                Asignatura:
            </label>
            <select id="subject" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                ${subjectOptions}
            </select>
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="period">
                Periodo:
            </label>
            <select id="period" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
        </div>
        <button id="generateReportBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Generar Reporte
        </button>
        <div id="loadingSpinner" class="hidden border-t-4 border-blue-500 border-solid rounded-full animate-spin h-6 w-6 mx-auto mt-4"></div>
        <div id="reportOutput" class="mt-4"></div>
    `;
}


async function generateReport(grade, subject, period) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const reportOutput = document.getElementById('reportOutput');
    loadingSpinner.classList.remove('hidden');
    reportOutput.innerHTML = '';

    const apiKey = await getApiKey();
    headers["Api-Key"] = apiKey;

    const attendanceData = await getAttendanceData(grade, subject, period);
    const assessmentData = await getAssessmentData(grade, subject, period);


    const body = {
        input: `
    Adjunto encontrarás los datos de asistencia, valoraciones, grado \`${grade}\`, asignatura \`${subject}\` y período \`${period}\`.
    
    Por favor, elabora un reporte detallado de los estudiantes con valoraciones por debajo de 3, indicando qué actividades tienen valoraciones bajas y contabilizando las fallas de asistencia. Si un estudiante tiene 3 o más fallas, incluye un comentario sobre el riesgo de perder la asignatura según el SIEE.
    
    # Planillas de asistencia
    
    - **Asistencia**: \`${JSON.stringify(attendanceData)}\`
    
    # Planillas de valoraciones
    - **Valoraciones**: \`${JSON.stringify(assessmentData)}\`
        `,
        chatbot_name: "Eduflow",
        username: "sudomakeflies",
        conversation_id: null
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${message}`);
        }
        const data = await response.json();
        const formattedOutput = formatReportOutput(data.output);
        localStorage.setItem('reportData', formattedOutput);
        reportOutput.innerHTML = formattedOutput;
        return data;
    } catch (error) {
        console.error("Error generating report:", error);
        reportOutput.innerHTML = `<p class="text-red-500">Error al generar el reporte: ${error.message}</p>`;
        throw error;
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function formatReportOutput(report) {
    // Split the report into sections based on "###"
    const sections = report.split("###").filter(section => section.trim() !== "");
    let html = "";

    sections.forEach(section => {
        const lines = section.trim().split("\n").filter(line => line.trim() !== "");
        if (lines.length > 0) {
            const title = lines[0].trim();
            html += `<h3 class="text-lg font-semibold mt-2">${title}</h3>`;
            if (lines.length > 1) {
                html += "<ul class='list-disc list-inside'>";
                for (let i = 1; i < lines.length; i++) {
                    html += `<li>${lines[i].trim()}</li>`;
                }
                html += "</ul>";
            }
        }
    });
    return `<div class="report-container">${html}</div>`;
}


async function getAttendanceData(grade, subject, period) {
    try {
        const attendanceRecords = await db.getByIndex('asistencia', 'grado', grade);
        const filteredRecords = attendanceRecords.filter(record => record.periodo === period);
        return filteredRecords;
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        return [];
    }
}

async function getAssessmentData(grade, subject, period) {
    try {
        const assessmentRecords = await db.getByIndex('planillasValoracion', 'curso', grade);
         const filteredRecords = assessmentRecords.filter(record => record.asignatura === subject && record.periodo === period);
        return filteredRecords;
    } catch (error) {
        console.error("Error fetching assessment data:", error);
        return [];
    }
}

export function initializeReportes() {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportOutput = document.getElementById('reportOutput');
    const storedReport = localStorage.getItem('reportData');
    if (storedReport) {
        reportOutput.innerHTML = storedReport;
    }
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            const grade = document.getElementById('grade').value;
            const subject = document.getElementById('subject').value;
            const period = document.getElementById('period').value;
            try {
                await generateReport(grade, subject, period);
            } catch (error) {
                console.error("Error initializing report:", error);
                reportOutput.innerHTML = `<p class="text-red-500">Error al generar el reporte: ${error.message}</p>`;
            }
        });
    }
}
