import {Routes,Route} from 'react-router-dom'
import './App.css'
import Home from './Home/Home'
import Layout from './Layout/Layout'
import Signup from './Login/Signup'
import Login from './Login/Login'
function App() {

  return (
    <>
     <Routes>
      <Route element={<Layout/>}>
            <Route path='/' element={<Home/>}/>
            <Route path='/:chatId' element={<Home/>}/>

      </Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/login' element={<Login/>} />
     </Routes>
    </>
  )
}

export default App
