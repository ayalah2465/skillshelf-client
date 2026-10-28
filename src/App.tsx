import { RegisterForm } from './pages/RegisterPage.tsx'
import { clearAccessToken } from './services/auth.ts'
import {Link, Route, Routes,useNavigate} from 'react-router-dom'
import { LoginForm } from './pages/LoginPage.tsx'
import {CatalogPage} from './pages/CatalogPage.tsx'
import './App.css'
import { ResourceDetailsPage } from './pages/ResourceDetailsPage.tsx'
import { FavoritesPage } from './pages/FavoritesPage.tsx'
import {useState,useEffect} from "react"
import { getAccessToken } from './services/auth.ts'
import {AdminPage} from "./pages/AdminPage.tsx"

type User={
  id:string,
  displayName:string,
  email:string,
  role:"USER"|"ADMIN",
}
function App() {
  const navigate=useNavigate()
  const [user, setUser]=useState<User|null>(null)
  const [authVersion, setAuthVersion]=useState(0)
  const [authLoading,setAuthLoading]=useState(true)
  const [authError,setAuthError]=useState("")
  const isLoggedIn=user!==null
  useEffect(()=>{
    const controller=new AbortController()
    const loadUser=async()=>{
      setAuthLoading(true)
      setAuthError("")
      setUser(null)
      try{
        const token=getAccessToken()
        if(!token) return
        const response=await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers:{
              Authorization:`Bearer ${token}`,
            },
            signal:controller.signal,
          }
        );
        if(response.status===401){
          clearAccessToken()
          return;
        }
        if(!response.ok){
          throw new Error("שגיאה בבדיקת ההתחברות")
        }
        const currentUser:User=await response.json()
        if(!controller.signal.aborted){
          setUser(currentUser)
        }
        
      }catch(error){
        if(!controller.signal.aborted){
          setAuthError(
            error instanceof Error?error.message:"שגיאה בבדיקת התחברות")
        }
      }
      finally{
        if(!controller.signal.aborted){
          setAuthLoading(false)
        }
      }
    };
    void loadUser()
    return ()=>controller.abort()
  },[authVersion])

  const handleLogout=()=>{
    clearAccessToken();
    setUser(null)
    setAuthVersion((current)=>current+1)
    navigate("/login",{replace:true});
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav
    aria-label="ניווט ראשי"
    className="flex items-center gap-6 border-b border-slate-200 bg-white px-8 py-4"
    >
    <span className="text-xl font-bold text-indigo-700">
        SkillShelf
    </span>
      <Link to="/"
      className="font-medium text-slate-600 hover:text-indigo-700"
      >קטלוג</Link>
      {authLoading?(
        <span>בודק התחברות...</span>
      ):isLoggedIn?(
        <>
          <Link to="/favorites"
          className="font-medium text-slate-600 hover:text-indigo-700"
          >מועדפים</Link>
          {user?.role==="ADMIN"&&(<Link to="/admin">ניהול</Link>)}
          <button type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100"
           onClick={handleLogout}>
            התנתקות
          </button>
        </>
      ):(
        <>
          <Link to="/register"
          className="font-medium text-slate-600 hover:text-indigo-700"
          >הרשמה</Link>
          <Link to="/login"
          className="font-medium text-slate-600 hover:text-indigo-700"
          >התחברות</Link>
        </>
      )}
      </nav>
      <main className="mx-auto max-w-6xl px-8 py-10">
      {authError&&<p>{authError}</p>}
      <Routes>
        <Route path="/register" element={<RegisterForm onAuthSuccess={() => {setAuthVersion((current)=>current+1)}} />} />
        <Route path="/login" element={<LoginForm onAuthSuccess={() => {setAuthVersion((current)=>current+1)}}  />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/" element={<CatalogPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      </main>
    </div>
  )
}

export default App
