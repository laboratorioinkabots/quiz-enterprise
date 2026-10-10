import * as XLSX from 'xlsx'

import { jsPDF } from 'jspdf'

import autoTable from 'jspdf-autotable'


/*
============================================
HELPERS
============================================
*/

function normalizeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  return Number(value)
}


function formatScore(value) {
  const number =
    normalizeNumber(value)

  if (number === null) {
    return '-'
  }

  return `${number.toFixed(1)}%`
}


function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'es-PE',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  )
}


function safeFilename(value) {
  return String(
    value ?? 'reporte'
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9-_]/g,
      '_'
    )
    .replace(
      /_+/g,
      '_'
    )
}


function buildDateSuffix(
  dateFrom,
  dateTo
) {
  if (
    !dateFrom &&
    !dateTo
  ) {
    return ''
  }

  return `_${dateFrom || 'inicio'}_${dateTo || 'fin'}`
}


/*
============================================
EXCEL - REPORTE GLOBAL
============================================
*/

export function exportGlobalReportExcel({
  data,
  dateFrom,
  dateTo,
}) {
  if (!data) {
    return
  }

  const workbook =
    XLSX.utils.book_new()

  const summary =
    data.summary ?? {}

  const courses =
    data.courses ?? []

  const users =
    data.users ?? []

  const difficultQuestions =
    data.difficult_questions ?? []


  /*
  ------------------------------------------
  RESUMEN
  ------------------------------------------
  */

  const summaryRows = [
    {
      Indicador:
        'Intentos',

      Valor:
        Number(
          summary.attempts ?? 0
        ),
    },

    {
      Indicador:
        'Completados',

      Valor:
        Number(
          summary.completed ?? 0
        ),
    },

    {
      Indicador:
        'Promedio general',

      Valor:
        formatScore(
          summary.average_score
        ),
    },

    {
      Indicador:
        'Tasa de aprobación',

      Valor:
        formatScore(
          summary.approval_rate
        ),
    },

    {
      Indicador:
        'Fecha desde',

      Valor:
        dateFrom || 'Sin filtro',
    },

    {
      Indicador:
        'Fecha hasta',

      Valor:
        dateTo || 'Sin filtro',
    },
  ]

  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryRows
    )

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    'Resumen'
  )


  /*
  ------------------------------------------
  CURSOS
  ------------------------------------------
  */

  const courseRows =
    courses.map(
      course => ({
        Curso:
          course.course_title,

        Intentos:
          Number(
            course.attempts ?? 0
          ),

        Completados:
          Number(
            course.completed ?? 0
          ),

        Promedio:
          formatScore(
            course.average_score
          ),

        'Tasa de aprobación':
          formatScore(
            course.approval_rate
          ),
      })
    )

  const coursesSheet =
    XLSX.utils.json_to_sheet(
      courseRows
    )

  XLSX.utils.book_append_sheet(
    workbook,
    coursesSheet,
    'Cursos'
  )


  /*
  ------------------------------------------
  USUARIOS
  ------------------------------------------
  */

  const userRows =
    users.map(
      user => ({
        Nombre:
          user.full_name ||
          'Sin nombre',

        Email:
          user.email,

        Intentos:
          Number(
            user.attempts ?? 0
          ),

        Completados:
          Number(
            user.completed ?? 0
          ),

        'Mejor puntaje':
          formatScore(
            user.best_score
          ),
      })
    )

  const usersSheet =
    XLSX.utils.json_to_sheet(
      userRows
    )

  XLSX.utils.book_append_sheet(
    workbook,
    usersSheet,
    'Usuarios'
  )


  /*
  ------------------------------------------
  PREGUNTAS DIFÍCILES
  ------------------------------------------
  */

  const questionRows =
    difficultQuestions.map(
      question => ({
        Curso:
          question.course_title,

        Pregunta:
          question.question_text,

        Respuestas:
          Number(
            question.answers ?? 0
          ),

        Incorrectas:
          Number(
            question.incorrect ?? 0
          ),

        'Porcentaje de error':
          formatScore(
            question.error_rate
          ),
      })
    )

  const questionsSheet =
    XLSX.utils.json_to_sheet(
      questionRows
    )

  XLSX.utils.book_append_sheet(
    workbook,
    questionsSheet,
    'Preguntas con errores'
  )


  const filename =
    `reporte_general${buildDateSuffix(
      dateFrom,
      dateTo
    )}.xlsx`

  XLSX.writeFile(
    workbook,
    filename
  )
}


/*
============================================
PDF - REPORTE GLOBAL
============================================
*/

export function exportGlobalReportPdf({
  data,
  dateFrom,
  dateTo,
}) {
  if (!data) {
    return
  }

  const document =
    new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

  const summary =
    data.summary ?? {}

  const courses =
    data.courses ?? []

  const difficultQuestions =
    data.difficult_questions ?? []


  document.setFontSize(18)

  document.text(
    'Reporte general de evaluaciones',
    14,
    18
  )

  document.setFontSize(10)

  document.text(
    `Periodo: ${
      dateFrom || 'Inicio'
    } - ${
      dateTo || 'Actualidad'
    }`,
    14,
    26
  )


  /*
  RESUMEN
  */

  autoTable(
    document,
    {
      startY: 34,

      head: [
        [
          'Indicador',
          'Valor',
        ],
      ],

      body: [
        [
          'Intentos',
          String(
            summary.attempts ?? 0
          ),
        ],

        [
          'Completados',
          String(
            summary.completed ?? 0
          ),
        ],

        [
          'Promedio general',
          formatScore(
            summary.average_score
          ),
        ],

        [
          'Tasa de aprobación',
          formatScore(
            summary.approval_rate
          ),
        ],
      ],

      theme: 'grid',
    }
  )


  /*
  CURSOS
  */

  document.setFontSize(13)

  document.text(
    'Resultados por curso',
    14,
    document.lastAutoTable.finalY + 10
  )

  autoTable(
    document,
    {
      startY:
        document.lastAutoTable.finalY +
        14,

      head: [
        [
          'Curso',
          'Intentos',
          'Completados',
          'Promedio',
          'Aprobación',
        ],
      ],

      body:
        courses.map(
          course => [
            course.course_title,

            String(
              course.attempts ?? 0
            ),

            String(
              course.completed ?? 0
            ),

            formatScore(
              course.average_score
            ),

            formatScore(
              course.approval_rate
            ),
          ]
        ),

      theme: 'striped',

      styles: {
        fontSize: 8,
      },
    }
  )


  /*
  PREGUNTAS DIFÍCILES
  */

  if (
    difficultQuestions.length >
    0
  ) {
    document.setFontSize(13)

    document.text(
      'Preguntas con mayor porcentaje de error',
      14,
      document.lastAutoTable.finalY +
      10
    )

    autoTable(
      document,
      {
        startY:
          document.lastAutoTable.finalY +
          14,

        head: [
          [
            '#',
            'Curso',
            'Pregunta',
            'Error',
          ],
        ],

        body:
          difficultQuestions
            .slice(0, 15)
            .map(
              (
                question,
                index
              ) => [
                String(index + 1),

                question.course_title,

                question.question_text,

                formatScore(
                  question.error_rate
                ),
              ]
            ),

        theme: 'striped',

        styles: {
          fontSize: 7,
        },
      }
    )
  }


  const filename =
    `reporte_general${buildDateSuffix(
      dateFrom,
      dateTo
    )}.pdf`

  document.save(
    filename
  )
}


/*
============================================
EXCEL - REPORTE POR CURSO
============================================
*/

export function exportCourseReportExcel({
  data,
  dateFrom,
  dateTo,
}) {
  if (!data?.course) {
    return
  }

  const workbook =
    XLSX.utils.book_new()

  const course =
    data.course

  const summary =
    data.summary ?? {}

  const distribution =
    data.distribution ?? {}

  const timeline =
    data.timeline ?? []

  const questions =
    data.difficult_questions ?? []

  const users =
    data.users ?? []

  const attempts =
    data.recent_attempts ?? []


  /*
  RESUMEN
  */

  const summaryRows = [
    {
      Campo:
        'Curso',

      Valor:
        course.title,
    },

    {
      Campo:
        'Nota mínima',

      Valor:
        formatScore(
          course.passing_score
        ),
    },

    {
      Campo:
        'Intentos',

      Valor:
        summary.attempts ?? 0,
    },

    {
      Campo:
        'Completados',

      Valor:
        summary.completed ?? 0,
    },

    {
      Campo:
        'Usuarios',

      Valor:
        summary.users ?? 0,
    },

    {
      Campo:
        'Promedio',

      Valor:
        formatScore(
          summary.average_score
        ),
    },

    {
      Campo:
        'Tasa de aprobación',

      Valor:
        formatScore(
          summary.approval_rate
        ),
    },

    {
      Campo:
        'Mejor nota',

      Valor:
        formatScore(
          summary.best_score
        ),
    },

    {
      Campo:
        'Menor nota',

      Valor:
        formatScore(
          summary.worst_score
        ),
    },

    {
      Campo:
        'Desde',

      Valor:
        dateFrom ||
        'Sin filtro',
    },

    {
      Campo:
        'Hasta',

      Valor:
        dateTo ||
        'Sin filtro',
    },
  ]

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      summaryRows
    ),

    'Resumen'
  )


  /*
  DISTRIBUCIÓN
  */

  const distributionRows = [
    {
      Rango: '0 - 49%',
      Cantidad:
        distribution.range_0_49 ?? 0,
    },

    {
      Rango: '50 - 69%',
      Cantidad:
        distribution.range_50_69 ?? 0,
    },

    {
      Rango: '70 - 84%',
      Cantidad:
        distribution.range_70_84 ?? 0,
    },

    {
      Rango: '85 - 100%',
      Cantidad:
        distribution.range_85_100 ?? 0,
    },
  ]

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      distributionRows
    ),

    'Distribución'
  )


  /*
  EVOLUCIÓN
  */

  const timelineRows =
    timeline.map(
      item => ({
        Fecha:
          item.date,

        Intentos:
          item.attempts,

        'Promedio del día':
          formatScore(
            item.average_score
          ),
      })
    )

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      timelineRows
    ),

    'Evolución'
  )


  /*
  PREGUNTAS
  */

  const questionRows =
    questions.map(
      (
        question,
        index
      ) => ({
        Posición:
          index + 1,

        Pregunta:
          question.question_text,

        Respuestas:
          question.answers,

        Incorrectas:
          question.incorrect,

        'Porcentaje error':
          formatScore(
            question.error_rate
          ),
      })
    )

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      questionRows
    ),

    'Preguntas'
  )


  /*
  USUARIOS
  */

  const userRows =
    users.map(
      user => ({
        Nombre:
          user.full_name ||
          'Sin nombre',

        Email:
          user.email,

        Intentos:
          user.attempts,

        Completados:
          user.completed,

        Promedio:
          formatScore(
            user.average_score
          ),

        'Mejor nota':
          formatScore(
            user.best_score
          ),

        'Última nota':
          formatScore(
            user.last_score
          ),
      })
    )

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      userRows
    ),

    'Usuarios'
  )


  /*
  ACTIVIDAD
  */

  const attemptRows =
    attempts.map(
      attempt => ({
        Fecha:
          formatDate(
            attempt.started_at
          ),

        Usuario:
          attempt.full_name ||
          attempt.email,

        Email:
          attempt.email,

        Estado:
          attempt.status,

        Puntaje:
          formatScore(
            attempt.score
          ),
      })
    )

  XLSX.utils.book_append_sheet(
    workbook,

    XLSX.utils.json_to_sheet(
      attemptRows
    ),

    'Actividad'
  )


  const filename =
    `reporte_${safeFilename(
      course.title
    )}${buildDateSuffix(
      dateFrom,
      dateTo
    )}.xlsx`

  XLSX.writeFile(
    workbook,
    filename
  )
}


/*
============================================
PDF - REPORTE POR CURSO
============================================
*/

export function exportCourseReportPdf({
  data,
  dateFrom,
  dateTo,
}) {
  if (!data?.course) {
    return
  }

  const document =
    new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

  const course =
    data.course

  const summary =
    data.summary ?? {}

  const distribution =
    data.distribution ?? {}

  const questions =
    data.difficult_questions ?? []

  const users =
    data.users ?? []


  document.setFontSize(18)

  document.text(
    course.title,
    14,
    18
  )

  document.setFontSize(10)

  document.text(
    'Reporte de rendimiento del curso',
    14,
    25
  )

  document.text(
    `Periodo: ${
      dateFrom || 'Inicio'
    } - ${
      dateTo || 'Actualidad'
    }`,
    14,
    31
  )


  /*
  RESUMEN
  */

  autoTable(
    document,
    {
      startY: 38,

      head: [
        [
          'Indicador',
          'Valor',
        ],
      ],

      body: [
        [
          'Intentos',
          String(
            summary.attempts ?? 0
          ),
        ],

        [
          'Usuarios',
          String(
            summary.users ?? 0
          ),
        ],

        [
          'Promedio',
          formatScore(
            summary.average_score
          ),
        ],

        [
          'Aprobación',
          formatScore(
            summary.approval_rate
          ),
        ],

        [
          'Mejor nota',
          formatScore(
            summary.best_score
          ),
        ],

        [
          'Menor nota',
          formatScore(
            summary.worst_score
          ),
        ],

        [
          'Nota mínima',
          formatScore(
            course.passing_score
          ),
        ],
      ],

      theme: 'grid',
    }
  )


  /*
  DISTRIBUCIÓN
  */

  document.setFontSize(13)

  document.text(
    'Distribución de puntajes',
    14,
    document.lastAutoTable.finalY +
    10
  )

  autoTable(
    document,
    {
      startY:
        document.lastAutoTable.finalY +
        14,

      head: [
        [
          'Rango',
          'Cantidad',
        ],
      ],

      body: [
        [
          '0 - 49%',
          String(
            distribution.range_0_49 ??
            0
          ),
        ],

        [
          '50 - 69%',
          String(
            distribution.range_50_69 ??
            0
          ),
        ],

        [
          '70 - 84%',
          String(
            distribution.range_70_84 ??
            0
          ),
        ],

        [
          '85 - 100%',
          String(
            distribution.range_85_100 ??
            0
          ),
        ],
      ],

      theme: 'striped',
    }
  )


  /*
  PREGUNTAS DIFÍCILES
  */

  document.setFontSize(13)

  document.text(
    'Preguntas con mayor dificultad',
    14,
    document.lastAutoTable.finalY +
    10
  )

  autoTable(
    document,
    {
      startY:
        document.lastAutoTable.finalY +
        14,

      head: [
        [
          '#',
          'Pregunta',
          'Respuestas',
          'Incorrectas',
          'Error',
        ],
      ],

      body:
        questions
          .slice(0, 15)
          .map(
            (
              question,
              index
            ) => [
              String(
                index + 1
              ),

              question.question_text,

              String(
                question.answers ?? 0
              ),

              String(
                question.incorrect ?? 0
              ),

              formatScore(
                question.error_rate
              ),
            ]
          ),

      theme: 'striped',

      styles: {
        fontSize: 7,
      },
    }
  )


  /*
  USUARIOS
  */

  document.setFontSize(13)

  document.text(
    'Rendimiento de usuarios',
    14,
    document.lastAutoTable.finalY +
    10
  )

  autoTable(
    document,
    {
      startY:
        document.lastAutoTable.finalY +
        14,

      head: [
        [
          'Usuario',
          'Intentos',
          'Promedio',
          'Mejor',
          'Último',
        ],
      ],

      body:
        users
          .slice(0, 20)
          .map(
            user => [
              user.full_name ||
              user.email,

              String(
                user.attempts ?? 0
              ),

              formatScore(
                user.average_score
              ),

              formatScore(
                user.best_score
              ),

              formatScore(
                user.last_score
              ),
            ]
          ),

      theme: 'striped',

      styles: {
        fontSize: 7,
      },
    }
  )


  const filename =
    `reporte_${safeFilename(
      course.title
    )}${buildDateSuffix(
      dateFrom,
      dateTo
    )}.pdf`

  document.save(
    filename
  )
}