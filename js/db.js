const DB_NAME = 'eduflowDB';
const DB_VERSION = 1; // Incrementing version for schema update

class Database {
    constructor() {
        this.db = null;
        this.initPromise = null;
        this.setupStorageMonitoring();
    }

    setupStorageMonitoring() {
        // Verificar almacenamiento cada hora
        setInterval(async () => {
            const { StorageMonitor } = await import('./storage-monitor.js');
            StorageMonitor.checkStorage();
        }, 3600000); // 1 hora
    }

    async init() {
        if (this.initPromise) return this.initPromise;

        // Solicitar persistencia explícita
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted = await navigator.storage.persist();
            console.log(`Persisted storage granted: ${isPersisted}`);
        }

        // Verificar almacenamiento disponible
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const {usage, quota} = await navigator.storage.estimate();
            if (usage > quota * 0.8) {
                console.warn('Storage usage is high. Consider cleanup.');
            }
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores with indexes
                if (!db.objectStoreNames.contains('planesDeArea')) {
                    const planesStore = db.createObjectStore('planesDeArea', { keyPath: 'id' });
                    planesStore.createIndex('asignatura', 'asignatura', { unique: false });
                    planesStore.createIndex('grado', 'grado', { unique: false });
                }

                if (!db.objectStoreNames.contains('encuadres')) {
                    const encuadresStore = db.createObjectStore('encuadres', { keyPath: 'id' });
                    encuadresStore.createIndex('asignatura', 'asignatura', { unique: false });
                }

                if (!db.objectStoreNames.contains('planeaciones')) {
                    const planeacionesStore = db.createObjectStore('planeaciones', { keyPath: 'id' });
                    planeacionesStore.createIndex('asignatura', 'asignatura', { unique: false });
                }

                // Updated schema for estudiantes
                if (!db.objectStoreNames.contains('estudiantes')) {
                    const estudiantesStore = db.createObjectStore('estudiantes', { keyPath: 'id', autoIncrement: true });
                    estudiantesStore.createIndex('nombreCompleto', 'nombreCompleto', { unique: false });
                    estudiantesStore.createIndex('curso', 'curso', { unique: false });
                }

                if (!db.objectStoreNames.contains('asistencia')) {
                    const asistenciaStore = db.createObjectStore('asistencia', { keyPath: 'id' });
                    asistenciaStore.createIndex('fecha', 'fecha', { unique: false });
                    asistenciaStore.createIndex('curso', 'curso', { unique: false });
                    asistenciaStore.createIndex('hora', 'hora', { unique: false });
                    asistenciaStore.createIndex('asignatura', 'asignatura', { unique: false });
                    asistenciaStore.createIndex('periodo', 'periodo', { unique: false });
                }

                // Updated schema for planillas de valoración
                if (!db.objectStoreNames.contains('planillasValoracion')) {
                    const planillasStore = db.createObjectStore('planillasValoracion', { 
                        keyPath: ['curso', 'asignatura', 'periodo']
                    });
                    planillasStore.createIndex('curso', 'curso', { unique: false });
                    planillasStore.createIndex('asignatura', 'asignatura', { unique: false });
                    planillasStore.createIndex('periodo', 'periodo', { unique: false });
                }

                // Delete old valoracion store if exists
                if (db.objectStoreNames.contains('valoracion')) {
                    db.deleteObjectStore('valoracion');
                }
            };
        });

        return this.initPromise;
    }

    async getAll(storeName) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, data) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get by index
    async getByIndex(storeName, indexName, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Export data from all stores
    async exportData() {
        await this.init();
        const data = {};
        
        for (const storeName of this.db.objectStoreNames) {
            data[storeName] = await this.getAll(storeName);
        }
        
        return data;
    }

    async backupData() {
        const data = await this.exportData();
        const backup = {
            timestamp: new Date().toISOString(),
            data: data
        };
        try {
            localStorage.setItem('eduflow_backup', JSON.stringify(backup));
            console.log('Backup created successfully');
        } catch (error) {
            console.error('Failed to create backup:', error);
            // Si localStorage está lleno, intentar limpiar backups antiguos
            if (error.name === 'QuotaExceededError') {
                localStorage.clear();
                localStorage.setItem('eduflow_backup', JSON.stringify(backup));
            }
        }
    }

    async recoverFromBackup() {
        const backup = localStorage.getItem('eduflow_backup');
        if (backup) {
            try {
                const {data} = JSON.parse(backup);
                await this.importData(data);
                console.log('Recovery from backup successful');
                return true;
            } catch (error) {
                console.error('Failed to recover from backup:', error);
                return false;
            }
        }
        return false;
    }

    // Import data to all stores
    async importData(data) {
        await this.init();
        
        for (const [storeName, items] of Object.entries(data)) {
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.warn(`Store ${storeName} does not exist in the database`);
                continue;
            }

            await this.clear(storeName);
            for (const item of items) {
                try {
                    await this.add(storeName, item);
                } catch (error) {
                    if (error.name === 'QuotaExceededError') {
                        console.warn('Storage quota exceeded during import');
                        const { StorageMonitor } = await import('./storage-monitor.js');
                        await StorageMonitor.triggerCleanup();
                        // Reintentar después de la limpieza
                        await this.add(storeName, item);
                    } else {
                        throw error;
                    }
                }
            }
        }
    }

    // Método para verificar el estado de la base de datos
    async checkHealth() {
        try {
            await this.init();
            const stores = Array.from(this.db.objectStoreNames);
            const status = {};

            for (const store of stores) {
                try {
                    const count = await this.getCount(store);
                    status[store] = { status: 'ok', count };
                } catch (error) {
                    status[store] = { status: 'error', error: error.message };
                }
            }

            return {
                isHealthy: true,
                stores: status
            };
        } catch (error) {
            return {
                isHealthy: false,
                error: error.message
            };
        }
    }

    // Método auxiliar para contar registros
    async getCount(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Create and export a single instance
const db = new Database();
export default db;
