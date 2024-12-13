import planeacionManager, { updatePlaneacionesContent } from './planeacion.js';
import { initializeImport, renderImportSection } from './import.js';

// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sectionTitle = document.getElementById('section-title');
const content = document.getElementById('content');
const menuItems = document.querySelectorAll('.menu-item');

// Update content based on section
export function updateContent(section) {
    switch(section) {
        case 'planeaciones':
            updatePlaneacionesContent();
            break;
        case 'importar':
            content.innerHTML = renderImportSection();
            initializeImport();
            break;
        default:
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
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
        });
    }

    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const section = item.getAttribute('href').replace('#', '');
            const sectionName = item.textContent.trim();
            if (sectionTitle) {
                sectionTitle.textContent = sectionName;
            }
            updateContent(section);
            if (window.innerWidth < 1024) {
                sidebar.classList.add('hidden');
            }
        });
    });

    // Handle responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('hidden');
        }
    });

    // Initialize default view
    updateContent('');
}

// Export DOM elements for use in other modules
export const elements = {
    content,
    sectionTitle
};
