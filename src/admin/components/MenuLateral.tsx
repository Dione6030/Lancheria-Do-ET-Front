import { useAdminStore } from "../context/AdminContext";
import {
  IoExitOutline,
  IoFastFoodOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";

import { Link, useNavigate } from "react-router-dom";

export function MenuLateral() {
  const navigate = useNavigate();
  const { deslogaAdmin } = useAdminStore();

  function adminSair() {
    if (confirm("Confirma Saída?")) {
      deslogaAdmin();
      navigate("/", { replace: true });
    }
  }

  return (
    <aside
      id="default-sidebar"
      className="fixed mt-24 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-blue-300 dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link to="/admin" className="flex items-center p-2">
              <span className="h-5 text-gray-600 text-2xl dark:text-gray-400">
                <BiSolidDashboard />
              </span>
              <span className="ms-2 mt-1 dark:text-gray-400">Visão Geral</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/cadastro-lanches"
              className="flex items-center p-2"
            >
              <span className="h-5 text-gray-600 text-2xl dark:text-gray-400">
                <IoFastFoodOutline />
              </span>
              <span className="ms-2 mt-1 dark:text-gray-400">
                Cadastro de Lanches
              </span>
            </Link>
          </li>
          <li>
            <Link to="/admin/pedidos" className="flex items-center p-2">
              <span className="h-5 text-gray-600 text-2xl dark:text-gray-400">
                <IoReceiptOutline />
              </span>
              <span className="ms-2 mt-1 dark:text-gray-400">
                Controle de Pedidos
              </span>
            </Link>
          </li>
          <li>
            <span className="flex items-center p-2 cursor-pointer">
              <span className="h-5 text-gray-600 text-2xl dark:text-gray-400">
                <IoExitOutline />
              </span>
              <span
                className="ms-2 mt-1 dark:text-gray-400"
                onClick={adminSair}
              >
                Sair do Sistema
              </span>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
