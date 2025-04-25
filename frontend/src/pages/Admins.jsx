import RegistroForm from "../component/RegistroForm";
import ListaEntregas from "../component/ListadoEntregas";

export default function Admins() {
  return (
    <div>
      <h1>Panel de administración</h1>

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
