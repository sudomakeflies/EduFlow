import planeacionManager, { updatePlaneacionesContent } from './planeacion.js';
import { initializeImport, renderImportSection } from './import.js';
import { initializeAsistencia, renderAsistenciaSection } from './asistencia.js';
import { initializeValoracion, renderValoracionSection } from './valoracion.js';

// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sectionTitle = document.getElementById('section-title');
const content = document.getElementById('content');

// Update content based on section
export function updateContent(section) {
    console.log('UI: Updating content for section:', section);
    
    // Remove hash if present and convert to lowercase
    section = section.replace('#', '').toLowerCase();
    console.log('UI: Processed section name:', section);

    // Update section title
    if (sectionTitle) {
        sectionTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1) || 'Bienvenido';
        console.log('UI: Updated section title to:', sectionTitle.textContent);
    }

    switch(section) {
        case 'planeaciones':
            console.log('UI: Rendering planeaciones section');
            updatePlaneacionesContent();
            break;
        case 'importar':
            console.log('UI: Rendering importar section');
            content.innerHTML = renderImportSection();
            initializeImport();
            break;
        case 'asistencia':
            console.log('UI: Rendering asistencia section');
            content.innerHTML = renderAsistenciaSection();
            requestAnimationFrame(() => {
                initializeAsistencia();
            });
            break;
        case 'valoracion':
            console.log('UI: Rendering valoracion section');
            content.innerHTML = renderValoracionSection();
            console.log('UI: Valoracion section HTML set');
            requestAnimationFrame(() => {
                console.log('UI: Initializing valoracion');
                initializeValoracion();
                console.log('UI: Valoracion initialized');
            });
            break;
        default:
            console.log('UI: Rendering default welcome section');
            content.innerHTML = `
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">¡Bienvenido a EduFlow!</h2>
                <p class="text-gray-600">
                    Selecciona una opción del menú para comenzar a gestionar tu institución educativa.
                </p>
            `;
    }
}

// Toggle sidebar on mobile
export function initializeSidebar() {
    console.log('UI: Initializing sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            console.log('UI: Toggling sidebar');
            sidebar.classList.toggle('hidden');
        });
    }

    // Handle responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            console.log('UI: Showing sidebar for desktop view');
            sidebar.classList.remove('hidden');
        }
    });
}

// Export DOM elements for use in other modules
export const elements = {
    content,
    sectionTitle
};
