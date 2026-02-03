import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from "./pages/Register";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<div>这是首页（待开发）</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;