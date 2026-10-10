# Curso Evaluaciones

Frontend base en React + Vite + Supabase para una plataforma de cursos y evaluaciones.

## Requisitos
- Node.js 20+
- Proyecto Supabase configurado con las tablas y funciones indicadas en la conversación

## Configuración
1. Copia `.env.example` como `.env`.
2. Completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Ejecuta:

```bash
npm install
npm run dev
```

## Flujo incluido
- `/login`: autenticación con Supabase Auth
- `/courses`: listado de cursos activos
- rutas protegidas
- cierre de sesión

El botón `Iniciar curso` queda preparado para el siguiente paso: conectar `start_attempt(course_id)` y crear `/exam/:attemptId`.
