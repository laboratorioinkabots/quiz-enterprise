import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useSearchParams,
} from 'react-router-dom'

import * as XLSX from 'xlsx'

import { supabase } from '../../services/supabase'
export default function AdminQuestionImport() {
  const fileInputRef = useRef(null)

  const [searchParams] = useSearchParams()

  const courseFromUrl =
    searchParams.get('course')

  const [courses, setCourses] =
    useState([])

  const [courseId, setCourseId] =
    useState('')

  const [file, setFile] =
    useState(null)

  const [rows, setRows] =
    useState([])

  const [loadingCourses, setLoadingCourses] =
    useState(true)

  const [analyzing, setAnalyzing] =
    useState(false)

  const [importing, setImporting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      setLoadingCourses(true)
      setError('')

      const {
        data,
        error,
      } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          status
        `)
        .order('title')

      if (error) {
        throw error
      }

      setCourses(
        data ?? []
      )

      if (courseFromUrl) {
        const exists =
          (data ?? []).some(
            course =>
              course.id ===
              courseFromUrl
          )

        if (exists) {
          setCourseId(
            courseFromUrl
          )
        }
      }

    } catch (err) {
      console.error(
        'Error cargando cursos:',
        err
      )

      setError(
        err.message ||
        'No se pudieron cargar los cursos.'
      )
    } finally {
      setLoadingCourses(false)
    }
  }

  const validRows =
    useMemo(
      () =>
        rows.filter(
          row => row.valid
        ),
      [rows]
    )

  const invalidRows =
    useMemo(
      () =>
        rows.filter(
          row => !row.valid
        ),
      [rows]
    )

  function normalizeCorrect(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return []
    }

    return String(value)
      .split(',')
      .map(item =>
        Number(
          item.trim()
        )
      )
      .filter(
        item =>
          !Number.isNaN(item)
      )
  }

  function validateRow(
    row,
    index
  ) {
    const errors = []

    const question =
      String(
        row.question ?? ''
      ).trim()

    const options = [
      String(
        row.option_1 ?? ''
      ).trim(),

      String(
        row.option_2 ?? ''
      ).trim(),

      String(
        row.option_3 ?? ''
      ).trim(),

      String(
        row.option_4 ?? ''
      ).trim(),
    ]

    const correct =
      normalizeCorrect(
        row.correct
      )

    const status =
      String(
        row.status ?? 'DRAFT'
      )
        .trim()
        .toUpperCase()

    if (!question) {
      errors.push(
        'La pregunta es obligatoria.'
      )
    }

    options.forEach(
      (option, optionIndex) => {
        if (!option) {
          errors.push(
            `La alternativa ${
              optionIndex + 1
            } es obligatoria.`
          )
        }
      }
    )

    if (
      correct.length < 1 ||
      correct.length > 3
    ) {
      errors.push(
        'Debe existir entre 1 y 3 respuestas correctas.'
      )
    }

    if (
      correct.some(
        value =>
          value < 1 ||
          value > 4
      )
    ) {
      errors.push(
        'Las respuestas correctas deben estar entre 1 y 4.'
      )
    }

    if (
      new Set(correct).size !==
      correct.length
    ) {
      errors.push(
        'No se permiten respuestas correctas duplicadas.'
      )
    }

    if (
      ![
        'DRAFT',
        'ACTIVE',
        'INACTIVE',
      ].includes(status)
    ) {
      errors.push(
        'El estado debe ser DRAFT, ACTIVE o INACTIVE.'
      )
    }

    return {
      rowNumber:
        index + 2,

      question,

      options,

      correct,

      status,

      valid:
        errors.length === 0,

      errors,
    }
  }

  async function processFile(
    selectedFile
  ) {
    if (!selectedFile) {
      return
    }

    try {
      setAnalyzing(true)
      setError('')
      setSuccess('')
      setRows([])

      const extension =
        selectedFile.name
          .split('.')
          .pop()
          ?.toLowerCase()

      if (
        ![
          'xlsx',
          'xls',
          'csv',
        ].includes(extension)
      ) {
        throw new Error(
          'Formato no permitido. Usa XLSX, XLS o CSV.'
        )
      }

      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        throw new Error(
          'El archivo supera los 5 MB.'
        )
      }

      const buffer =
        await selectedFile
          .arrayBuffer()

      const workbook =
        XLSX.read(
          buffer,
          {
            type: 'array',
          }
        )

      const firstSheetName =
        workbook
          .SheetNames[0]

      const sheet =
        workbook
          .Sheets[
            firstSheetName
          ]

      const rawRows =
        XLSX.utils
          .sheet_to_json(
            sheet,
            {
              defval: '',
            }
          )

      if (
        rawRows.length === 0
      ) {
        throw new Error(
          'El archivo no contiene preguntas.'
        )
      }

      const validatedRows =
        rawRows.map(
          (row, index) =>
            validateRow(
              row,
              index
            )
        )

      setFile(
        selectedFile
      )

      setRows(
        validatedRows
      )

    } catch (err) {
      console.error(
        'Error procesando archivo:',
        err
      )

      setError(
        err.message ||
        'No se pudo procesar el archivo.'
      )

      setFile(null)
      setRows([])
    } finally {
      setAnalyzing(false)
    }
  }

  function handleFileChange(
    event
  ) {
    const selectedFile =
      event
        .target
        .files?.[0]

    processFile(
      selectedFile
    )
  }

  function handleDrop(
    event
  ) {
    event.preventDefault()

    const selectedFile =
      event
        .dataTransfer
        .files?.[0]

    processFile(
      selectedFile
    )
  }

  function handleDragOver(
    event
  ) {
    event.preventDefault()
  }

  function removeFile() {
    setFile(null)
    setRows([])
    setError('')
    setSuccess('')

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ''
    }
  }

  async function handleImport() {
    if (!courseId) {
      setError(
        'Selecciona el curso de destino.'
      )

      return
    }

    if (
      validRows.length === 0
    ) {
      setError(
        'No existen preguntas válidas para importar.'
      )

      return
    }

    if (
      invalidRows.length > 0
    ) {
      setError(
        'Corrige primero las filas con errores.'
      )

      return
    }

    try {
      setImporting(true)
      setError('')
      setSuccess('')

      const payload =
        validRows.map(
          row => ({
            question_text:
              row.question,

            required_selections:
              row.correct.length,

            status:
              row.status,

            options:
              row.options.map(
                (
                  text,
                  index
                ) => ({
                  text,

                  is_correct:
                    row.correct
                      .includes(
                        index + 1
                      ),
                })
              ),
          })
        )

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_import_questions',
        {
          p_course_id:
            courseId,

          p_questions:
            payload,
        }
      )

      if (error) {
        throw error
      }

      console.log(
        'Resultado importación:',
        data
      )

      setSuccess(
        `${validRows.length} pregunta(s) importada(s) correctamente.`
      )

      setRows([])
      setFile(null)

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }

    } catch (err) {
      console.error(
        'Error importando:',
        err
      )

      setError(
        err.message ||
        'No se pudo completar la importación.'
      )
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>

      {/* ================================
          HEADER
      ================================= */}

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Banco de preguntas
          </span>

          <h1>
            Importar preguntas
          </h1>

          <p>
            Carga preguntas de forma masiva
            mediante Excel o CSV y valida
            el contenido antes de guardarlo.
          </p>

        </div>
         <a
          href="/templates/question-template.xlsx"
          download="question-template.xlsx"
          className="admin-outline-button"
        >
          Descargar plantilla
        </a>

      </section>

      {/* ================================
          STATS
      ================================= */}

      <section className="admin-import-stats">

        <div className="admin-import-stat">

          <span>
            Filas detectadas
          </span>

          <strong>
            {rows.length}
          </strong>

        </div>

        <div className="admin-import-stat success">

          <span>
            Válidas
          </span>

          <strong>
            {validRows.length}
          </strong>

        </div>

        <div className="admin-import-stat danger">

          <span>
            Con errores
          </span>

          <strong>
            {invalidRows.length}
          </strong>

        </div>

      </section>

      {/* ================================
          CONFIGURACIÓN
      ================================= */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Configuración de importación
            </h2>

            <p>
              Selecciona el curso y carga
              el archivo con las preguntas.
            </p>

          </div>

        </div>

        <div className="admin-field">

          <label
            htmlFor="import-course"
          >
            Curso de destino
          </label>

          <select
            id="import-course"
            value={courseId}
            disabled={
              loadingCourses
            }
            onChange={event =>
              setCourseId(
                event.target.value
              )
            }
          >

            <option value="">
              Seleccionar curso
            </option>

            {courses.map(
              course => (

                <option
                  key={
                    course.id
                  }
                  value={
                    course.id
                  }
                >
                  {course.title}
                </option>

              )
            )}

          </select>

        </div>

        {!file ? (

          <div
            className="admin-import-dropzone"
            onDrop={
              handleDrop
            }
            onDragOver={
              handleDragOver
            }
          >

            <div className="admin-import-icon">
              ↑
            </div>

            <h3>
              Arrastra tu archivo aquí
            </h3>

            <p>
              También puedes seleccionarlo
              manualmente desde tu equipo.
            </p>

            <span>
              XLSX, XLS o CSV · máximo 5 MB
            </span>

            <button
              type="button"
              className="admin-primary-button"
              onClick={() =>
                fileInputRef
                  .current
                  ?.click()
              }
            >
              Seleccionar archivo
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={
                handleFileChange
              }
            />

          </div>

        ) : (

          <div className="admin-import-file">

            <div className="admin-import-file-icon">
              XLS
            </div>

            <div className="admin-import-file-info">

              <strong>
                {file.name}
              </strong>

              <span>
                {(
                  file.size /
                  1024
                ).toFixed(1)}
                {' KB'}
              </span>

            </div>

            <button
              type="button"
              className="admin-danger-text-button"
              onClick={
                removeFile
              }
            >
              Quitar
            </button>

          </div>

        )}

        {analyzing && (
          <div className="admin-info-message">
            Analizando archivo...
          </div>
        )}

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-success-message">
            {success}
          </div>
        )}

      </section>

      {/* ================================
          PREVIEW
      ================================= */}

      {rows.length > 0 && (

        <section className="admin-panel">

          <div className="admin-panel-heading">

            <div>

              <h2>
                Vista previa
              </h2>

              <p>
                Revisa las preguntas
                antes de importarlas.
              </p>

            </div>

            <span className="admin-import-count">
              {rows.length}
              {' filas'}
            </span>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>
                  <th>
                    Fila
                  </th>

                  <th>
                    Pregunta
                  </th>

                  <th>
                    Correctas
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Validación
                  </th>
                </tr>

              </thead>

              <tbody>

                {rows.map(
                  row => (

                    <tr
                      key={
                        row.rowNumber
                      }
                      className={
                        row.valid
                          ? ''
                          : 'admin-table-row-error'
                      }
                    >

                      <td>
                        {row.rowNumber}
                      </td>

                      <td>

                        <strong>
                          {
                            row.question ||
                            'Sin pregunta'
                          }
                        </strong>

                        {!row.valid && (

                          <div className="admin-row-errors">

                            {
                              row.errors
                                .map(
                                  (
                                    message,
                                    index
                                  ) => (

                                    <span
                                      key={
                                        index
                                      }
                                    >
                                      {message}
                                    </span>

                                  )
                                )
                            }

                          </div>

                        )}

                      </td>

                      <td>
                        {
                          row.correct
                            .join(', ')
                        }
                      </td>

                      <td>

                        <span className="admin-status-badge admin-status-draft">
                          {row.status}
                        </span>

                      </td>

                      <td>

                        {row.valid ? (

                          <span className="admin-validation-valid">
                            ✓ Válida
                          </span>

                        ) : (

                          <span className="admin-validation-error">
                            ✕ Revisar
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          <div className="admin-import-footer">

            <div>

              {invalidRows.length > 0 ? (

                <span className="admin-validation-error">
                  Corrige las filas con errores
                  antes de importar.
                </span>

              ) : (

                <span className="admin-validation-valid">
                  El archivo está listo para importar.
                </span>

              )}

            </div>

            <button
              className="admin-primary-button"
              disabled={
                importing ||
                !courseId ||
                invalidRows.length > 0 ||
                validRows.length === 0
              }
              onClick={
                handleImport
              }
            >
              {importing
                ? 'Importando...'
                : `Importar ${validRows.length} pregunta(s)`}
            </button>

          </div>

        </section>

      )}

    </div>
  )
}