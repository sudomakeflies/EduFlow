import db from './db.js';

async function backupDatabase() {
    await db.init();
    const backupData = await db.exportData();

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eduflowDB_backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function restoreDatabase() {
    const confirmRestore = confirm("¡Advertencia! Restaurar la base de datos reemplazará todos los datos actuales. ¿Estás seguro de que quieres continuar?");
    if (!confirmRestore) {
        return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                await db.init();
                
                for (const storeName in jsonData) {
                    if (db.db.objectStoreNames.contains(storeName)) {
                        const tx = db.db.transaction(storeName, 'readwrite');
                        const store = tx.objectStore(storeName);
                        await store.clear();
                        for (const record of jsonData[storeName]) {
                            await store.add(record);
                        }
                        await tx.done;
                    }
                }
                alert('Base de datos restaurada exitosamente.');
            } catch (error) {
                console.error('Error al restaurar la base de datos:', error);
                alert('Error al restaurar la base de datos.');
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

export function renderConfiguracionSection(contentElement) {
    contentElement.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
            <button id="backup-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                Hacer Backup de la Base de Datos
            </button>
            <button id="restore-button" class="bg-yellow-600 text-white font-bold px-4 py-2 rounded hover:bg-yellow-700">
                Sincronizar Base de Datos
            </button>
        </div>
    `;

    document.getElementById('backup-button').addEventListener('click', backupDatabase);
    document.getElementById('restore-button').addEventListener('click', restoreDatabase);
}
