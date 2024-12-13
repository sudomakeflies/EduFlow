export const sampleData = {
    planes: [
        { 
            id: 1, 
            asignatura: 'Matemáticas',
            grado: '10',
            periodos: 4,
            contenido: {
                periodo1: {
                    competencias: {
                        saber: 'Comprende conceptos matemáticos avanzados',
                        saberHacer: 'Aplica conceptos en resolución de problemas',
                        saberSer: 'Demuestra responsabilidad y disciplina'
                    },
                    matriz: []
                },
                periodo2: {
                    competencias: {
                        saber: 'Analiza funciones y ecuaciones',
                        saberHacer: 'Resuelve problemas de aplicación',
                        saberSer: 'Participa activamente en clase'
                    },
                    matriz: []
                },
                periodo3: {
                    competencias: {
                        saber: 'Comprende geometría analítica',
                        saberHacer: 'Aplica conceptos geométricos',
                        saberSer: 'Trabaja en equipo efectivamente'
                    },
                    matriz: []
                },
                periodo4: {
                    competencias: {
                        saber: 'Domina conceptos de trigonometría',
                        saberHacer: 'Resuelve problemas trigonométricos',
                        saberSer: 'Mantiene orden y claridad'
                    },
                    matriz: []
                }
            }
        }
    ],
    encuadres: [
        {
            id: 1,
            periodo: 1,
            planAreaId: 1,
            competenciasSaber: 'Comprensión de conceptos matemáticos fundamentales',
            competenciasSaberHacer: 'Aplicación práctica de conceptos en problemas',
            competenciasSaberSer: 'Responsabilidad y participación activa',
            criteriosEvaluacion: 'Evaluaciones escritas, participación en clase',
            resultadosAprendizaje: 'Dominio de conceptos básicos del álgebra',
            evidenciasAprendizaje: 'Portafolio de ejercicios resueltos',
            posiblesFechas: '2024-02-01, 2024-02-15, 2024-02-28'
        }
    ],
    planeaciones: [
        {
            id: 1,
            fecha: '2024-07-26',
            tema: 'Funciones Cuadráticas',
            asignatura: 'Matemáticas',
            periodosClase: 2,
            objetivo: 'Desarrollar comprensión de funciones cuadráticas',
            encuadreId: 1,
            momentos: {
                inicio: 'Repaso de conceptos previos de funciones lineales',
                exploracion: 'Análisis de situaciones cotidianas que involucran funciones cuadráticas',
                transferencia: 'Resolución de problemas aplicados',
                evaluacion: 'Ejercicios prácticos y retroalimentación'
            },
            observaciones: 'Los estudiantes mostraron buen entendimiento de los conceptos'
        }
    ]
};
