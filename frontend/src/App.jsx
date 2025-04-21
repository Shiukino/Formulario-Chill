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
      <Admins />
      <Listado />
    </motion.div>
  );
}

export default App;
