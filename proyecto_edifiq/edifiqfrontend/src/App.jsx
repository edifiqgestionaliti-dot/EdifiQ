import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./componentes/Sidebar";
import ProtectedRoute from "./componentes/ProtectedRoute";
import RoleRoute from "./componentes/RoleRoute";
import VigilanteVisitasPage from "./pages/Vigilante/VisitasPage";
import VigilantePaquetesPage from "./pages/Vigilante/PaquetesPage";
import VigilanteRecibosPage from "./pages/Vigilante/RecibosPage";
import LandingPage from "./pages/LadingPages";
import HomePage from "./pages/Admin/AdminHomePages";
import PersonasPage from "./pages/Admin/PersonaPages";
import RegistroResidente from "./pages/RegistroResidente";
import LoginPage from "./pages/LoginPage";

import ApartamentosPage from "./pages/Admin/ApartamentosPage_Admin";
import TorresPage from "./pages/Admin/TorresPage";
import PaquetesAdminPage from "./pages/Admin/PaquetesPage";
import RecibosAdminPage from "./pages/Admin/RecibosPage";
import ReservasAdminPage from "./pages/Admin/ReservasPage";
import VisitasAdminPage from "./pages/Admin/VisitasPage";
import ZonasPage from "./pages/Admin/ZonasPage";
import AsignacionesPage from "./pages/Admin/AsignacionesPage";
import UsuariosPage from "./pages/Admin/UsuariosPage";

import ResidenteHomePage from "./pages/Residente/ResidenteHomePage";
import ResidentePaquetes from "./pages/Residente/PaquetesPage";
import ResidenteRecibos from "./pages/Residente/RecibosPage";
import ResidenteReservas from "./pages/Residente/ReservasPage";
import ResidenteVisitas from "./pages/Residente/VisitasPage";
import ApartamentoPage from "./pages/Residente/ApartamentoPage";
import FamiliaresPage from "./pages/Residente/FamiliaresPage";
import SidebarResidente from "./pages/Residente/SidebarResidente";

import VigilanteSidebar from "./componentes/VigilanteSidebar";
import VigilanteHomePage from "./pages/Vigilante/VigilanteHomePage";

import PerfilPage from "./pages/PerfilPage";

import "./App.css";
import "./componentes/sidebar.css";
import "./pages/Residente/SidebarResidente.css";

/* =========================================
LAYOUT ADMINISTRADOR
========================================= */

function AdminLayout({ children }) {
return ( <div className="admin-layout"> <Sidebar />


  <main className="admin-content">
    {children}
  </main>
</div>


);
}

/* =========================================
LAYOUT VIGILANTE
========================================= */

function VigilanteLayout({ children }) {
return ( <div className="admin-layout"> <VigilanteSidebar />


  <main className="admin-content">
    {children}
  </main>
</div>


);
}

function ResidentLayout({ children }) {
return ( <div className="admin-layout"> <SidebarResidente />


  <main className="admin-content">
    {children}
  </main>
</div>


);
}

/* =========================================
RUTAS PROTEGIDAS
========================================= */

function AdminRoute({ children }) {
return ( <ProtectedRoute> <RoleRoute role="Administrador"> <AdminLayout>
{children} </AdminLayout> </RoleRoute> </ProtectedRoute>
);
}

function ResidentRoute({ children }) {
return ( <ProtectedRoute> <RoleRoute role="Residente"> <ResidentLayout>
{children} </ResidentLayout> </RoleRoute> </ProtectedRoute>
);
}

function VigilanteRoute({ children }) {
return ( <ProtectedRoute> <RoleRoute role="Vigilante"> <VigilanteLayout>
{children} </VigilanteLayout> </RoleRoute> </ProtectedRoute>
);
}

/* =========================================
APP
========================================= */

export default function App() {
return ( <BrowserRouter>


  <Routes>

    {/* RUTAS PÚBLICAS */}

    <Route path="/" element={<LandingPage />} />

    <Route
      path="/login"
      element={<LoginPage />}
    />

    <Route
      path="/registro"
      element={<RegistroResidente />}
    />



    {/* ===============================
        ADMINISTRADOR
    =============================== */}

    <Route
      path="/admin"
      element={
        <AdminRoute>
          <HomePage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/personas"
      element={
        <AdminRoute>
          <PersonasPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/torres"
      element={
        <AdminRoute>
          <TorresPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/apartamentos"
      element={
        <AdminRoute>
          <ApartamentosPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/asignaciones"
      element={
        <AdminRoute>
          <AsignacionesPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/paquetes"
      element={
        <AdminRoute>
          <PaquetesAdminPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/recibos"
      element={
        <AdminRoute>
          <RecibosAdminPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/reservas"
      element={
        <AdminRoute>
          <ReservasAdminPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/visitas"
      element={
        <AdminRoute>
          <VisitasAdminPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/zonas"
      element={
        <AdminRoute>
          <ZonasPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/registro"
      element={
        <AdminRoute>
          <UsuariosPage />
        </AdminRoute>
      }
    />

    <Route
      path="/admin/perfil"
      element={
        <AdminRoute>
          <PerfilPage />
        </AdminRoute>
      }
    />


    {/* ===============================
        RESIDENTE
    =============================== */}

    <Route
      path="/residente"
      element={
        <ResidentRoute>
          <ResidenteHomePage />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/paquetes"
      element={
        <ResidentRoute>
          <ResidentePaquetes />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/recibos"
      element={
        <ResidentRoute>
          <ResidenteRecibos />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/reservas"
      element={
        <ResidentRoute>
          <ResidenteReservas />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/visitas"
      element={
        <ResidentRoute>
          <ResidenteVisitas />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/apartamento"
      element={
        <ResidentRoute>
          <ApartamentoPage />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/familiares"
      element={
        <ResidentRoute>
          <FamiliaresPage />
        </ResidentRoute>
      }
    />

    <Route
      path="/residente/perfil"
      element={
        <ResidentRoute>
          <PerfilPage />
        </ResidentRoute>
      }
    />


    {/* ===============================
        VIGILANTE
    =============================== */}

    <Route
      path="/vigilante"
      element={
        <VigilanteRoute>
          <VigilanteHomePage />
        </VigilanteRoute>
      }
    />
    <Route path="/vigilante/visitas" element={<VigilanteRoute><VigilanteVisitasPage /></VigilanteRoute>} />
    <Route path="/vigilante/paquetes" element={<VigilanteRoute><VigilantePaquetesPage /></VigilanteRoute>} />
    <Route path="/vigilante/recibos" element={<VigilanteRoute><VigilanteRecibosPage /></VigilanteRoute>} />
    <Route path="/vigilante/perfil" element={<VigilanteRoute><PerfilPage /></VigilanteRoute>} />

    {/* REDIRECCIÓN */}

    <Route
      path="*"
      element={<Navigate to="/" replace />}
    />

  </Routes>

</BrowserRouter>


);
}