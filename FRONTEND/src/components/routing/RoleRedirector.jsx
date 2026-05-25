import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

export default function RoleRedirector({ targetRole, children }) {
  const { user } = useUIStore()

  if (!user) return <Navigate to="/login" replace />

  if (targetRole && user.role !== targetRole) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  return children
}

