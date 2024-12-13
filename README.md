# EduFlow 🚀

**EduFlow** es una plataforma innovadora y de código abierto diseñada para educadores, que permite optimizar la enseñanza, aumentar la participación de los estudiantes y fomentar el aprendizaje colaborativo. Este proyecto está bajo la licencia **GNU V3**.

---

## 🌟 Detalles Técnicos

EduFlow es una **Aplicación Web Progresiva (PWA)** que facilita la gestión de planes de área, encuadres pedagógicos, planeaciones de clase, asistencia y valoración de estudiantes. La aplicación está construida con tecnologías web estándar como **HTML**, **CSS** y **JavaScript**, y puede funcionar sin conexión gracias al uso de **Service Workers** e **IndexedDB**.

---

## 🏗️ Arquitectura

La aplicación sigue una arquitectura de **cliente web (frontend)** que interactúa con una base de datos local (**IndexedDB**) para el almacenamiento persistente. La interfaz de usuario está construida con **HTML**, **CSS** y **JavaScript**, y la lógica de la aplicación se maneja principalmente con **JavaScript**.

---

## 🛠️ Tecnologías Utilizadas

- **HTML**: Estructura y contenido de la aplicación.
- **CSS**: Estilos y diseño de la interfaz de usuario.
- **JavaScript**: Lógica de la aplicación, manipulación del DOM e interacción con el usuario.
- **Service Workers**: Permiten que la aplicación funcione sin conexión y gestione la caché de recursos.
- **IndexedDB**: Base de datos NoSQL en el navegador para el almacenamiento local de datos.
- **PWA (Progressive Web App)**: La aplicación está configurada como una PWA, lo que permite su instalación en dispositivos móviles y de escritorio.

---

## 📚 Librerías de Terceros

- **Tailwind CSS**: Framework CSS utilitario para construir rápidamente sitios modernos.
- **Papa Parse**: Para el procesamiento de archivos CSV (importación de estudiantes).
- **SheetJS**: Para el procesamiento de archivos Excel (importación de estudiantes).
- **Tesseract.js**: Para OCR (reconocimiento óptico de caracteres) en imágenes (funcionalidad opcional).
- **Chart.js** o **D3.js**: Para la generación de gráficos en los reportes.

---

## 🌈 Funcionalidades Principales

### **Gestión de Planes de Área**
- CRUD (Crear, Leer, Actualizar, Eliminar) de planes de área.
- Soporte para múltiples periodos (3 o 4).
- Estructura de matriz para la definición de competencias y criterios de evaluación.
- Importación desde archivos de estudiantes en CSV y de otros documentos en JSON.

### **Gestión de Encuadres Pedagógicos**
- CRUD de encuadres pedagógicos.
- Vinculación con planes de área.
- Campos para competencias, criterios de evaluación, resultados de aprendizaje, evidencias y fechas.
- Importación desde archivos JSON.

### **Gestión de Planeaciones de Clase**
- CRUD de planeaciones de clase.
- Vinculación con encuadres pedagógicos.
- Estructura para los cuatro momentos de la clase (inicio, exploración, transferencia, evaluación).
- Importación desde archivos JSON.

### **Gestión de Estudiantes**
- Importación de estudiantes desde archivos CSV o Excel.
- Almacenamiento de nombre completo y curso.

### **Planillas de Asistencia**
- Registro diario de asistencia.
- Interfaz con checkbox para marcar ausencias (los demás se consideran presentes).
- Almacenamiento de la asistencia por fecha y curso.

### **Planillas de Valoración**
- Registro de valoraciones por estudiante, criterio y fecha.
- Posibilidad de adjuntar evidencias (imágenes) con OCR opcional (Tesseract.js).
- Almacenamiento de valoraciones y texto extraído del OCR (si está habilitado).

### **Reportes**
- Generación de reportes de asistencia y valoración por curso y rango de fechas.
- Visualización de resúmenes (promedios).
- Posibilidad de exportar reportes a PDF o CSV.

---

## 🗂️ Estructura de Datos (IndexedDB)

La aplicación utiliza **IndexedDB** para el almacenamiento local de datos. La estructura de datos para las principales entidades se organiza de manera eficiente para garantizar un almacenamiento persistente y accesible.

---

## 🔧 Consideraciones Técnicas

- **Offline**: La aplicación está diseñada para funcionar completamente sin conexión gracias al uso de **Service Workers** e **IndexedDB**.
- **Responsividad**: La interfaz de usuario es responsiva y se adapta a diferentes tamaños de pantalla.
- **Seguridad**: Dado que la aplicación se ejecuta en el lado del cliente, no se almacenan datos sensibles del lado del servidor. Sin embargo, se deben tomar precauciones para proteger la información almacenada en **IndexedDB**, especialmente si se implementa la funcionalidad de OCR.
- **Compatibilidad**: La aplicación debe ser compatible con los navegadores web modernos, incluyendo las versiones móviles de **Chrome**, **Safari**, **Firefox** y **Edge**.

---

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/EduFlow.git

2. **Abrir el archivo `index.html` en un navegador web**.

3. **Para la funcionalidad offline**, se debe acceder a la aplicación a través de un servidor web local (ej. usando la extensión **Live Server** de VS Code o un servidor como **XAMPP**).

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Haz un **fork** del repositorio.
2. Realiza los cambios en una nueva rama.
3. Envía un **pull request** para su revisión.

---

## 📜 Licencia

Este proyecto está bajo la licencia **GNU V3**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

¡Gracias por tu interés en **EduFlow**! 🎉