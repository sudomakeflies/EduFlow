import { initializeSidebar, updateContent } from './js/ui.js';
import { registerServiceWorker } from './js/sw-register.js';
import { updatePlanesDeAreaContent } from './js/planesdearea.js';

console.log('Main: Starting application initialization');
console.log('Main: Loaded modules:', { 
    updateContent,
    initializeSidebar,
    updatePlanesDeAreaContent
});

// Initialize UI components
initializeSidebar();
console.log('Main: Sidebar initialized');

// Register service worker
registerServiceWorker();
console.log('Main: Service worker registered');

// Create a global app object and expose updateContent and other functions
window.app = {
    updateContent: function(section) {
        console.log('Main: Received request to update content for section:', section);
        console.log('Main: Current hash:', window.location.hash);
        updateContent(section);
        console.log('Main: Content update completed for section:', section);
    }
};
console.log('Main: Global app object created with updateContent function');

// Handle initial route from URL hash
const initialHash = window.location.hash.slice(1);
if (initialHash) {
    console.log('Main: Found initial hash in URL:', initialHash);
    window.app.updateContent(initialHash);
} else {
    console.log('Main: No initial hash, loading default view');
    window.app.updateContent('');
}

// Listen for hash changes
window.addEventListener('hashchange', (event) => {
    console.log('Main: Hash change event:', event);
    console.log('Main: Old URL:', event.oldURL);
    console.log('Main: New URL:', event.newURL);
    const newHash = window.location.hash.slice(1);
    console.log('Main: Hash changed to:', newHash);
    window.app.updateContent(newHash);
});

console.log('Main: Application initialization completed');
