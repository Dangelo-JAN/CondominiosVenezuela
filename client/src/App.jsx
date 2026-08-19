import { RouterProvider } from "react-router-dom"
import { router } from "./routes/AppRoutes.jsx"
import { PWAProvider } from "./contexts/PWAContext.jsx"

function App() {
  return (
    <PWAProvider>
      <RouterProvider router={router} future={{
        v7_startTransition: true,
      }} />
    </PWAProvider>
  )
}

export default App
