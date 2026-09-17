import {useEffect,useState} from "react";
import {getApartamentoDePersona,paquetesApi,reservasApi,visitasApi,cancelarReserva,zonasApi,getTiposVisita,getTiposDocumento} from "../../api";
import "../../styles/modules.css";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {onlyLetters,onlyNumbers,isValidDocumentNumber,isValidName,normalizeText} from "../../utils/validation";

const crearPayloadReserva = (form, apartamentoId) => {
 const fechaReserva = normalizeText(form.fechaReserva);
 const zonaId = Number(form.zonaId);
 const cantidadInvitados = Number(form.cantidadInvitados);
 if(!fechaReserva || !zonaId) throw new Error("Debes seleccionar la zona y la fecha de la reserva.");
 if(!form.horaInicio || !form.horaFin) throw new Error("Debes indicar la hora de inicio y finalización.");
 if(form.horaFin<=form.horaInicio) throw new Error("La hora final debe ser posterior a la inicial");
 if(!Number.isInteger(cantidadInvitados) || cantidadInvitados < 1) throw new Error("La cantidad de invitados debe ser al menos 1.");
 return {fechaReserva,horaInicio:form.horaInicio,horaFin:form.horaFin,cantidadInvitados,estadoReserva:{id:1},zona:{id:zonaId},apartamento:{id:apartamentoId}};
};

const crearPayloadVisita = (form, apartamentoId) => {
 const tipoVisitaId = Number(form.tipoVisitaId);
 const tipoDocumentoId = Number(form.tipoDocumentoId);
 const nombreVisitante = normalizeText(form.nombreVisitante);
 const documentoVisitante = normalizeText(form.documentoVisitante);
 const motivoVisita = normalizeText(form.motivoVisita);
 const fechaIngreso = normalizeText(form.fechaIngreso);
 if(!tipoVisitaId || !tipoDocumentoId) throw new Error("Debes seleccionar el tipo de visita y el tipo de documento.");
 if(!isValidName(nombreVisitante, 2)) throw new Error("El nombre del visitante es obligatorio y solo puede contener letras.");
 if(!isValidDocumentNumber(documentoVisitante)) throw new Error("El documento del visitante debe tener entre 6 y 20 dígitos.");
 if(motivoVisita && motivoVisita.length > 150) throw new Error("El motivo de la visita no puede superar 150 caracteres.");
 if(!fechaIngreso) throw new Error("Debes indicar la fecha y hora de ingreso.");
 return {tipoVisita:{id:tipoVisitaId},tipoDocumento:{id:tipoDocumentoId},nombreVisitante,documentoVisitante,motivoVisita:motivoVisita||null,fechaIngreso,fechaSalida:null,estadoVisita:{id:1},apartamento:{id:apartamentoId}};
};

const filtrarItems = (items, type, search, filters) => items.filter((item) => {
 const texto = type === "paquetes"
  ? `${item.descripcion} ${item.remitente}`
  : type === "reservas"
   ? `${item.zona?.nombre} ${item.fechaReserva}`
   : `${item.nombreVisitante} ${item.documentoVisitante} ${item.motivoVisita || ""}`;
 const fecha = type === "paquetes" ? item.fechaRecepcion?.slice(0, 10) : type === "reservas" ? item.fechaReserva : item.fechaIngreso?.slice(0, 10);
 const estado = type === "paquetes" ? item.estadoPaquete?.nombre : type === "reservas" ? item.estadoReserva?.nombre : item.estadoVisita?.nombre;
 return texto.toLowerCase().includes(search.toLowerCase())
  && (!filters.estado || estado === filters.estado)
  && (!filters.tipo || (type === "visitas" ? item.tipoVisita?.id : item.zona?.id) === Number(filters.tipo))
  && (!filters.desde || fecha >= filters.desde)
  && (!filters.hasta || fecha <= filters.hasta);
});

export default function ResidenteModulePage({type}){
 const [apt,setApt]=useState(null),[items,setItems]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(true),[open,setOpen]=useState(false);
 const [options,setOptions]=useState({zonas:[],tiposVisita:[],documentos:[]});
 const [search,setSearch]=useState("");
 const [filters,setFilters]=useState({estado:"",tipo:"",desde:"",hasta:""});
 const [form,setForm]=useState({fechaReserva:"",horaInicio:"",horaFin:"",cantidadInvitados:0,zonaId:"",tipoVisitaId:"",tipoDocumentoId:"",nombreVisitante:"",documentoVisitante:"",motivoVisita:"",fechaIngreso:""});
 const user=JSON.parse(localStorage.getItem("authUser")||"null");
 const idPersona=user?.persona?.id;
 useEffect(()=>{
   const cargarDatos=async()=>{
     try{
       const [zonas,tiposVisita,documentos]=await Promise.all([zonasApi.list(),getTiposVisita(),getTiposDocumento()]);
       setOptions({zonas,tiposVisita,documentos});
       if(!idPersona){
         setError("No se encontró la persona asociada a la sesión.");
         return;
       }
       const apartamentoPersona=await getApartamentoDePersona(idPersona);
       setApt(apartamentoPersona);
       if(!apartamentoPersona){
         setItems([]);
         return;
       }
       const fn={paquetes:paquetesApi.list,reservas:reservasApi.list,visitas:visitasApi.list}[type];
       const data=await fn();
       setItems(data.filter(x=>x.apartamento?.id===apartamentoPersona.apartamento?.id));
     }catch(e){
       setError(e.message);
     }finally{
       setLoading(false);
     }
   };
   cargarDatos();
 },[type,idPersona]);
 
 const create=async e=>{
  e.preventDefault();
  setError("");
  try{
   const apartamentoId = apt.apartamento.id;
   const payload = type === "reservas"
    ? crearPayloadReserva(form, apartamentoId)
    : crearPayloadVisita(form, apartamentoId);
   const api = type === "reservas" ? reservasApi : visitasApi;
   await api.create(payload);
   setOpen(false);
   location.reload();
  }catch(e){setError(e.message)}
 };

 if(loading)return <div className="module-page"><div className="card-panel">Cargando información...</div></div>;
 if(!apt)return <div className="module-page"><div className="card-panel"><h2>Mi apartamento</h2><p>{error||"Tu usuario aún no tiene un apartamento asignado."}</p></div></div>;
 const a=apt.apartamento;
 const filteredItems=filtrarItems(items,type,search,filters);
 const estados=[...new Set(items.map(x=>type==="paquetes"?x.estadoPaquete?.nombre:type==="reservas"?x.estadoReserva?.nombre:x.estadoVisita?.nombre).filter(Boolean))];
 const filterOptions=type==="visitas"
  ? options.tiposVisita.map(x=>({value:x.id,label:x.nombre}))
  : type==="reservas"
   ? options.zonas.map(x=>({value:x.id,label:x.nombre}))
   : [];
 const filterLabel=type==="visitas"?"Tipo visita":type==="reservas"?"Zona":"Tipo";
 const titles={paquetes:["Mis paquetes","Consulta los paquetes recibidos en tu apartamento."],reservas:["Mis reservas","Consulta y administra tus reservas."],visitas:["Mis visitas","Consulta las visitas asociadas a tu apartamento."]};
 const [title,subtitle]=titles[type];
 const cancel=async id=>{if(confirm("¿Cancelar esta reserva?")){try{await cancelarReserva(id);location.reload()}catch(e){setError(e.message)}}};
 return <div className="module-page"><div className="module-header"><div><h1 className="module-title">{title}</h1><p className="module-subtitle">{subtitle}</p></div><div className="module-actions">{(type==="reservas"||type==="visitas")&&<button className="primary-btn" onClick={()=>{setError("");setOpen(true);setForm(f=>({...f,fechaIngreso:new Date().toISOString().slice(0,16)}))}}>+ {type==="reservas"?"Nueva reserva":"Registrar visita"}</button>}<span className="badge badge-info">{a.torre?.nombreTorre} · {a.numeroApartamento}</span></div></div><div className="card-panel">{error&&<div className="form-error">{error}</div>}<div className="toolbar"><strong>{filteredItems.length} de {items.length} registros</strong></div><MultiCriteriaBar search={search} onSearch={setSearch} searchPlaceholder="Buscar en mis registros..." filters={[{name:"estado",label:"Estado",type:"select",value:filters.estado,onChange:value=>setFilters({...filters,estado:value}),options:estados.map(x=>({value:x,label:x}))},{name:"tipo",label:filterLabel,type:"select",value:filters.tipo,onChange:value=>setFilters({...filters,tipo:value}),options:filterOptions},{name:"desde",label:"Desde",type:"date",value:filters.desde,onChange:value=>setFilters({...filters,desde:value})},{name:"hasta",label:"Hasta",type:"date",value:filters.hasta,onChange:value=>setFilters({...filters,hasta:value})}]} onClear={()=>{setSearch("");setFilters({estado:"",tipo:"",desde:"",hasta:""});}} />{type==="paquetes"&&<table className="module-table"><thead><tr><th>Descripción</th><th>Remitente</th><th>Recepción</th><th>Entrega</th><th>Estado</th></tr></thead><tbody>{filteredItems.length?filteredItems.map(x=><tr key={x.id}><td>{x.descripcion}</td><td>{x.remitente}</td><td>{x.fechaRecepcion?.replace("T"," ").slice(0,16)}</td><td>{x.fechaEntrega?.replace("T"," ").slice(0,16)||"Pendiente"}</td><td><span className={`badge ${x.estadoPaquete?.nombre==="Entregado"?"badge-success":"badge-warning"}`}>{x.estadoPaquete?.nombre}</span></td></tr>):<tr><td colSpan="5" className="empty-row">No tienes paquetes registrados.</td></tr>}</tbody></table>}
 {type==="reservas"&&<table className="module-table"><thead><tr><th>Zona</th><th>Fecha</th><th>Horario</th><th>Invitados</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{filteredItems.length?filteredItems.map(x=><tr key={x.id}><td>{x.zona?.nombre}</td><td>{x.fechaReserva}</td><td>{x.horaInicio?.slice(0,5)} - {x.horaFin?.slice(0,5)}</td><td>{x.cantidadInvitados}</td><td><span className={`badge ${x.estadoReserva?.nombre==="Cancelada"?"badge-danger":"badge-info"}`}>{x.estadoReserva?.nombre}</span></td><td>{x.estadoReserva?.nombre!=="Cancelada"&&<button className="small-btn" onClick={()=>cancel(x.id)}>Cancelar</button>}</td></tr>):<tr><td colSpan="6" className="empty-row">No tienes reservas.</td></tr>}</tbody></table>}
 {type==="visitas"&&<table className="module-table"><thead><tr><th>Visitante</th><th>Tipo</th><th>Motivo</th><th>Ingreso</th><th>Salida</th><th>Estado</th></tr></thead><tbody>{filteredItems.length?filteredItems.map(x=><tr key={x.id}><td>{x.nombreVisitante}</td><td>{x.tipoVisita?.nombre}</td><td>{x.motivoVisita||"—"}</td><td>{x.fechaIngreso?.replace("T"," ").slice(0,16)}</td><td>{x.fechaSalida?.replace("T"," ").slice(0,16)||"—"}</td><td><span className="badge badge-info">{x.estadoVisita?.nombre}</span></td></tr>):<tr><td colSpan="6" className="empty-row">No tienes visitas.</td></tr>}</tbody></table>}
 </div>
 {open&&<Modal title={type==="reservas"?"Nueva reserva":"Registrar visita"} onClose={()=>setOpen(false)}><form onSubmit={create}><div className="form-grid">{type==="reservas"?<>
 <div className="form-group"><span className="form-label">Zona común</span><select required value={form.zonaId} onChange={e=>setForm({...form,zonaId:e.target.value})}><option value="">Seleccione...</option>{options.zonas.map(z=><option key={z.id} value={z.id}>{z.nombre}</option>)}</select></div>
 <div className="form-group"><span className="form-label">Fecha</span><input required type="date" min={new Date().toISOString().slice(0,10)} value={form.fechaReserva} onChange={e=>setForm({...form,fechaReserva:e.target.value})}/></div>
 <div className="form-group"><span className="form-label">Hora inicio</span><input required type="time" value={form.horaInicio} onChange={e=>setForm({...form,horaInicio:e.target.value})}/></div>
 <div className="form-group"><span className="form-label">Hora fin</span><input required type="time" value={form.horaFin} onChange={e=>setForm({...form,horaFin:e.target.value})}/></div>
 <div className="form-group"><span className="form-label">Invitados</span><input type="number" min="0" inputMode="numeric" value={form.cantidadInvitados} onChange={e=>setForm({...form,cantidadInvitados:onlyNumbers(e.target.value)})}/></div>
 </>:<>
 <div className="form-group"><span className="form-label">Tipo de visita</span><select required value={form.tipoVisitaId} onChange={e=>setForm({...form,tipoVisitaId:e.target.value})}><option value="">Seleccione...</option>{options.tiposVisita.map(z=><option key={z.id} value={z.id}>{z.nombre}</option>)}</select></div>
 <div className="form-group"><span className="form-label">Tipo de documento</span><select required value={form.tipoDocumentoId} onChange={e=>setForm({...form,tipoDocumentoId:e.target.value})}><option value="">Seleccione...</option>{options.documentos.map(z=><option key={z.id} value={z.id}>{z.nombre}</option>)}</select></div>
 <div className="form-group"><span className="form-label">Nombre del visitante</span><input required maxLength="100" pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+" value={form.nombreVisitante} onChange={e=>setForm({...form,nombreVisitante:onlyLetters(e.target.value)})}/></div>
 <div className="form-group"><span className="form-label">Documento</span><input required maxLength="30" inputMode="numeric" pattern="[0-9]+" value={form.documentoVisitante} onChange={e=>setForm({...form,documentoVisitante:onlyNumbers(e.target.value)})}/></div>
 <div className="form-group full"><span className="form-label">Motivo</span><input maxLength="150" value={form.motivoVisita} onChange={e=>setForm({...form,motivoVisita:e.target.value})}/></div>
 <div className="form-group"><span className="form-label">Ingreso</span><input required type="datetime-local" value={form.fechaIngreso} onChange={e=>setForm({...form,fechaIngreso:e.target.value})}/></div>
 </>}</div>{error&&<div className="form-error">{error}</div>}<div className="form-footer"><button type="submit" className="primary-btn">Guardar</button></div></form></Modal>}
 </div>
}
