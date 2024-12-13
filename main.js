import { initializeSidebar, elements } from './js/ui.js';
import planeacionManager, { updatePlaneacionesContent } from './js/planeacion.js';
import { initializeImport, renderImportSection } from './js/import.js';
import { registerServiceWorker } from './js/sw-register.js';
import { initializeAsistencia, renderAsistenciaSection } from './js/asistencia.js';

// Initialize UI components
initializeSidebar();

// Register service worker
registerServiceWorker();

// Update content based on section
function updateContent(section) {
    // Update section title
    const sectionTitle = document.getElementById('section-title');
    if (sectionTitle) {
        sectionTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1) || 'Bienvenido';
    }

    switch(section) {
        case 'planeaciones':
            updatePlaneacionesContent();
            break;
        case 'importar':
            elements.content.innerHTML = renderImportSection();
            initializeImport();
            break;
        case 'asistencia':
            elements.content.innerHTML = renderAsistenciaSection();
            initializeAsistencia();
            break;
        default:
            elements.content.innerHTML = `
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">¡Bienvenido a EduFlow!</h2>
                <p class="text-gray-600">
                    Selecciona una opción del menú para comenzar a gestionar tu institución educativa.
                </p>
            `;
    }
}

// Make updateContent available globally for menu click handlers
window.updateContent = updateContent;

// Initialize default view
updateContent('');
