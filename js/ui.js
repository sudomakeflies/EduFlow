import planeacionManager, { updatePlaneacionesContent } from './planeacion.js';
import { initializeImport, renderImportSection } from './import.js';
import { initializeAsistencia, renderAsistenciaSection } from './asistencia.js';
import { initializeValoracion, renderValoracionSection } from './valoracion.js';
import { updatePlanesDeAreaContent } from './planesdearea.js';
import { updateEncuadresContent } from './encuadres.js';

console.log('UI: Loaded modules:', {
    planeacionManager,
    updatePlanesDeAreaContent,
    updateEncuadresContent,
    importModule: { initializeImport, renderImportSection },
    asistenciaModule: { initializeAsistencia, renderAsistenciaSection },
    valoracionModule: { initializeValoracion, renderValoracionSection }
});

// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sectionTitle = document.getElementById('section-title');
const content = document.getElementById('content');

// Update content based on section
export function updateContent(section) {
    console.log('UI: Updating content for section:', section);
    
    // Remove hash if present and convert to lowercase
    // Also remove any query parameters
    section = section.replace('#', '').toLowerCase().split('?')[0];
    console.log('UI: Processed section name:', section);

    // Update section title
    if (sectionTitle) {
        let title = section.charAt(0).toUpperCase() + section.slice(1) || 'Bienvenido';
        // Make title more readable
        title = title === 'planes' ? 'Planes de Área' : 
               title === 'encuadres' ? 'Encuadres' : title;
        sectionTitle.textContent = title;
        console.log('UI: Updated section title to:', sectionTitle.textContent);
    }

    try {
        switch(section) {
            case 'planes':
                console.log('UI: Attempting to render planes de area section');
                updatePlanesDeAreaContent();
                break;
            case 'encuadres':
                console.log('UI: Attempting to render encuadres section');
                updateEncuadresContent();
                break;
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
    } catch (error) {
        console.error('UI: Error updating content:', error);
        content.innerHTML = `
            <div class="text-red-600">
                <h2 class="text-2xl font-semibold mb-4">Error</h2>
                <p>Ocurrió un error al cargar la sección: ${error.message}</p>
            </div>
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
