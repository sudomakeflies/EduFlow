export class StorageMonitor {
    static async checkStorage() {
        if ('storage' in navigator) {
            try {
                const {usage, quota} = await navigator.storage.estimate();
                const usagePercent = (usage / quota) * 100;
                
                if (usagePercent > 80) {
                    // Alertar al usuario
                    console.warn(`Storage usage high (${usagePercent.toFixed(1)}%)`);
                    this.triggerCleanup();
                }
            } catch (error) {
                console.error('Storage check failed:', error);
            }
        }
    }

    static async triggerCleanup() {
        const db = (await import('./db.js')).default;
        
        try {
            // Obtener y limpiar datos antiguos de asistencia
            const asistencia = await db.getAll('asistencia');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const oldRecords = asistencia.filter(record => 
                new Date(record.fecha) < thirtyDaysAgo
            );

            for (const record of oldRecords) {
                await db.delete('asistencia', record.id);
            }

            console.log(`Cleaned up ${oldRecords.length} old attendance records`);
            
            // Forzar respaldo después de limpieza
            await db.backupData();
            
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}
