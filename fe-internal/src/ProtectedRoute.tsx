import { Navigate } from 'react-router-dom'
import { useAppSelector } from './app/hook'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

  if(loading) {
    return <div className= "spinner">Loading</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace/>
  }

  return children
}