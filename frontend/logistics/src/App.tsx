import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import './App.css'

export default function App() {
  const router = getRouter()
  return (
    <>
      <RouterProvider router={router} />
      <TanStackRouterDevtools router={router} />
    </>
  )
}