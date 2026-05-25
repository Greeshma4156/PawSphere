import React from 'react'
import { Navigate } from 'react-router-dom'

// For nested dashboard shells: push /dashboard/:role -> the role index component
export default function DashboardIndexRedirect() {
  return <Navigate to="." replace />
}

