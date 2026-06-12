import {Routes,Route} from 'react-router-dom'
import './App.css'
import Home from './Home/Home'
import Layout from './Layout/Layout'

function App() {

  return (
    <>
     <Routes>
      <Route element={<Layout/>}>
            <Route path='/' element={<Home/>}/>

      </Route>
     </Routes>
    </>
  )
}

export default App
