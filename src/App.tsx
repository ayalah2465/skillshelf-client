// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import { useState } from 'react'
import { RegisterForm } from './pages/RegisterPage.tsx'
import { LoginForm } from './pages/LoginPage.tsx'
import {Route,Routes} from 'react-router-dom'
import {CatalogPage} from './pages/CatalogPage.tsx'
import './App.css'

function App() {

  return (
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<CatalogPage />} />
      </Routes>
  )
}

export default App
