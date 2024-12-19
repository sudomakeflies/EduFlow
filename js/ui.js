import planeacionManager, { updatePlaneacionesContent } from './planeacion.js';
import { initializeImport, renderImportSection } from './import.js';
import { initializeAsistencia, renderAsistenciaSection } from './asistencia.js';
import { initializeValoracion, renderValoracionSection } from './valoracion.js';
import { updatePlanesDeAreaContent } from './planesdearea.js';
import { updateEncuadresContent } from './encuadres.js';
import { renderReportesSection, initializeReportes } from './reportes.js';

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
export async function updateContent(section) {
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
               title === 'encuadres' ? 'Encuadres' : 
               title === 'valoracion' ? 'Planillas de Valoración' : title;
        sectionTitle.textContent = title;
        console.log('UI: Updated section title to:', sectionTitle.textContent);
    }

    try {

        // Aquí se maneja si section está vacío o no coincide con una sección válida
        if (!section) {
            console.log('UI: No valid section, rendering default welcome section');
            content.innerHTML = `
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">¡Bienvenido a EduFlow!</h2>
                <p class="text-gray-600">
                    Selecciona una opción del menú para comenzar a gestionar los flujos de gestión de la enseñanza-aprendizaje.
                </p>
            `;
            return; // Salimos temprano, ya que hemos manejado el caso predeterminado
        }

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
                // First render a loading state
                content.innerHTML = `
                    <div class="flex items-center justify-center p-8">
                        <div class="text-gray-500">Cargando planillas de valoración...</div>
                    </div>
                `;
                
                try {
                    // Wait for the content to be rendered
                    const valoracionHtml = await renderValoracionSection();
                    content.innerHTML = valoracionHtml;
                    console.log('UI: Valoracion section HTML set');
                    
                    // Initialize after content is rendered
                    await initializeValoracion();
                    console.log('UI: Valoracion initialized');
                } catch (error) {
                    console.error('UI: Error in valoracion section:', error);
                    content.innerHTML = `
                        <div class="text-red-600 p-4">
                            <h2 class="text-2xl font-semibold mb-4">Error</h2>
                            <p>Ocurrió un error al cargar las planillas de valoración: ${error.message}</p>
                        </div>
                    `;
                }
                break;
            case 'reportes':
                    console.log('UI: Rendering reportes section');
                    content.innerHTML = renderReportesSection();
                    initializeReportes();
                    break;
            case 'configuracion':
                console.log('UI: Rendering configuracion section');
                import('./configuracion.js').then(module => {
                    module.renderConfiguracionSection(content);
                });
                break;
            default:
                console.log('UI: Rendering default welcome section');
                content.innerHTML = `
                    <h2 class="text-2xl font-semibold text-gray-800 mb-4">¡Bienvenido a EduFlow! (Default)</h2>
                    <p class="text-gray-600">
                        Selecciona una opción del menú para comenzar a gestionar los flujos de gestión de la enseñanza-aprendizaje.
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
        sidebarToggle.addEventListener('touchstart', () => {
            console.log('UI: Toggling sidebar on touch');
            sidebar.classList.toggle('hidden');
        }, { passive: true });
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
