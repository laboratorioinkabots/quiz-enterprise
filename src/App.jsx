import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import AdminLayout from './components/admin/AdminLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import Exam from './pages/Exam'
import Results from './pages/Results'
import AttemptHistory from './pages/AttemptHistory'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCourseForm from './pages/admin/AdminCourseForm'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminCourseQuestions from './pages/admin/AdminCourseQuestions'
import AdminQuestionForm from './pages/admin/AdminQuestionForm'
import AdminQuestionImport from './pages/admin/AdminQuestionImport'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAttemptDetail from './pages/admin/AdminAttemptDetail'
import AdminReports from './pages/admin/AdminReports'
import AdminCourseReport from './pages/admin/AdminCourseReport'
import HomeRedirect from './components/HomeRedirect'
import Home from './pages/Home'
export default function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC
      ========================== */}

      <Route
        path="/"
        element={
          <Home />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          USER
      ========================== */}

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId/history"
        element={
          <ProtectedRoute>
            <AttemptHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exam/:attemptId"
        element={
          <ProtectedRoute>
            <Exam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/results/:attemptId"
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        }
      />


      {/* =========================
          ADMIN
      ========================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <AdminDashboard />
          }
        />

        <Route
          path="courses"
          element={
            <AdminCourses />
          }
        />

        <Route
          path="courses/new"
          element={
            <AdminCourseForm />
          }
        />

        <Route
          path="courses/:courseId/edit"
          element={
            <AdminCourseForm />
          }
        />

        <Route
          path="courses/:courseId/questions"
          element={
            <AdminCourseQuestions />
          }
        />

        <Route
          path="courses/:courseId/questions/new"
          element={
            <AdminQuestionForm />
          }
        />

        <Route
          path="courses/:courseId/questions/:questionId/edit"
          element={
            <AdminQuestionForm />
          }
        />

        <Route
          path="questions"
          element={
            <AdminQuestions />
          }
        />

        <Route
          path="import"
          element={
            <AdminQuestionImport />
          }
        />

        <Route
          path="users"
          element={
            <AdminUsers />
          }
        />
        <Route
          path="users/:userId"
          element={
            <AdminUserDetail />
          }
        />
        <Route
          path="attempts/:attemptId"
          element={
            <AdminAttemptDetail />
          }
        />
        <Route
        path="reports"
        element={
          <AdminReports />
        }
      />
      <Route
        path="reports/courses/:courseId"
        element={
          <AdminCourseReport />
        }
      />
      </Route>


      {/* =========================
          FALLBACK
      ========================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/courses"
            replace
          />
        }
      />

    </Routes>
  )
}