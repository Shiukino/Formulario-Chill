import RegistroForm from "../component/RegistroForm";
import ListaEntregas from "../component/ListadoEntregas";
import "../styles/Admins.css";

export default function Admins() {
  return (
    <div className="contenedor-admin">
      <section>
        <h2>Registrar nuevo usuario</h2>
        <RegistroForm />
      </section>

      <hr />

      <section>
        <h2>Entregas</h2>
        <ListaEntregas />
      </section>
    </div>
  );
}
