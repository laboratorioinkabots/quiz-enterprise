import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] =
    useState(null)

  const [user, setUser] =
    useState(null)

  const [profile, setProfile] =
    useState(null)

  const [authLoading, setAuthLoading] =
    useState(true)

  const [profileLoading, setProfileLoading] =
    useState(false)

  const [authMessage, setAuthMessage] =
    useState('')
  const [profileResolved, setProfileResolved] =
  useState(false)
  /*
   * =========================================
   * 1. INICIALIZAR SUPABASE AUTH
   * =========================================
   */

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth
            .getSession()

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

       const currentSession =
  data.session ?? null

if (currentSession) {
  setProfile(null)
  setProfileResolved(false)

  setSession(currentSession)
  setUser(currentSession.user)
} else {
  setSession(null)
  setUser(null)
  setProfile(null)

  setProfileResolved(true)
}
      } catch (error) {
        console.error(
          'Error obteniendo sesión:',
          error
        )

        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    initialize()

    /*
     * IMPORTANTE:
     *
     * No hacemos consultas a Supabase
     * dentro de onAuthStateChange.
     *
     * Solamente actualizamos el estado.
     */

const {
  data: {
    subscription,
  },
} = supabase.auth.onAuthStateChange(
  (_event, newSession) => {
    if (!mounted) {
      return
    }

    if (newSession) {
      /*
       * IMPORTANTE:
       * existe una nueva sesión pero todavía
       * no hemos consultado profiles.
       */

      setProfile(null)
      setProfileResolved(false)

      setSession(newSession)
      setUser(newSession.user)
    } else {
      setSession(null)
      setUser(null)
      setProfile(null)

      setProfileResolved(true)
    }

    setAuthLoading(false)
  }
)
    return () => {
      mounted = false

      subscription.unsubscribe()
    }
  }, [])

  /*
   * =========================================
   * 2. CARGAR PROFILE
   *
   * Este efecto ocurre DESPUÉS de que
   * Supabase ya estableció la sesión.
   * =========================================
   */

  useEffect(() => {
  let cancelled = false

  async function fetchProfile() {
    if (!user?.id) {
      setProfile(null)
      setProfileResolved(true)
      setProfileLoading(false)

      return
    }

    try {
      setProfileResolved(false)
      setProfileLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          status,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      if (cancelled) {
        return
      }

      console.log(
        'PROFILE CARGADO:',
        data
      )

      if (
        data.status !== 'ACTIVE'
      ) {
        setProfile(null)

        setAuthMessage(
          'Tu cuenta se encuentra deshabilitada. Comunícate con un administrador.'
        )

        /*
         * Marcamos resuelto antes del logout.
         */

        setProfileResolved(true)

        await supabase.auth.signOut()

        return
      }

      setProfile(data)
      setProfileResolved(true)
      setAuthMessage('')

    } catch (error) {
      console.error(
        'Error cargando profile:',
        error
      )

      if (!cancelled) {
        setProfile(null)
        setProfileResolved(true)

        setAuthMessage(
          'No se pudo validar tu cuenta.'
        )
      }

    } finally {
      if (!cancelled) {
        setProfileLoading(false)
      }
    }
  }

  fetchProfile()

  return () => {
    cancelled = true
  }

}, [user?.id])
  /*
   * =========================================
   * LOGIN
   * =========================================
   */

  async function signIn(
    email,
    password
  ) {
    setAuthMessage('')

    return await supabase.auth
      .signInWithPassword({
        email:
          email
            .trim()
            .toLowerCase(),

        password,
      })
  }

  /*
   * =========================================
   * LOGOUT
   * =========================================
   */

  async function signOut() {
    setAuthMessage('')

    const result =
      await supabase.auth
        .signOut()

    setProfile(null)
    setUser(null)
    setSession(null)

    return result
  }

  /*
   * =========================================
   * REFRESH PROFILE
   * =========================================
   */

  async function refreshProfile() {
    if (!user?.id) {
      return null
    }

    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        status,
        created_at,
        updated_at
      `)
      .eq(
        'id',
        user.id
      )
      .single()

    if (error) {
      throw error
    }

    if (
      data.status !==
      'ACTIVE'
    ) {
      setAuthMessage(
        'Tu cuenta se encuentra deshabilitada. Comunícate con un administrador.'
      )

      await supabase.auth
        .signOut()

      setProfile(null)

      return null
    }

    setProfile(data)

    return data
  }

  /*
   * Loading global:
   *
   * - Supabase está recuperando sesión
   * - o hay un usuario autenticado
   *   cuyo profile todavía se está leyendo.
   */

const loading =
  authLoading ||
  (
    Boolean(user) &&
    (
      !profileResolved ||
      profile?.id !== user.id
    )
  )

  const value =
    useMemo(
      () => ({
        session,
        user,
        profile,

        loading,

        authMessage,
        setAuthMessage,

        signIn,
        signOut,
        refreshProfile,
      }),
      [
        session,
        user,
        profile,
        loading,
        authMessage,
      ]
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    )
  }

  return context
}