import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admins from "./pages/admins";
import Listado from "./pages/listado";
import "./styles/app.css";
import { motion } from "framer-motion";

function App() {
  return (
    <motion.div
      className="contenedor"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Admins />} />
          <Route path="/listado" element={<Listado />} />
        </Routes>
      </Router>
    </motion.div>
  );
}

export default App;
