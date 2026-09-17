package com.antony.edifiq.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
@Entity @Table(name="paquete")
public class Paquete {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_paquete") private Long id;
 @NotBlank(message="La descripción es obligatoria") @Size(max=200) private String descripcion;
 @NotBlank(message="El remitente es obligatorio") @Size(max=100) private String remitente;
 @NotNull(message="La fecha de recepción es obligatoria") @Column(name="fecha_recepcion",nullable=false) private LocalDateTime fechaRecepcion;
 @Column(name="fecha_entrega") private LocalDateTime fechaEntrega;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_estado_paquete",nullable=false) private EstadoPaquete estadoPaquete;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_apartamento",nullable=false) private Apartamento apartamento;
 @Column(name="fecha_creacion",updatable=false,insertable=false) private LocalDateTime fechaCreacion;
 @Column(name="fecha_actualizacion",insertable=false) private LocalDateTime fechaActualizacion;
 public Long getId(){return id;} public void setId(Long v){id=v;} public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
 public String getRemitente(){return remitente;} public void setRemitente(String v){remitente=v;} public LocalDateTime getFechaRecepcion(){return fechaRecepcion;} public void setFechaRecepcion(LocalDateTime v){fechaRecepcion=v;}
 public LocalDateTime getFechaEntrega(){return fechaEntrega;} public void setFechaEntrega(LocalDateTime v){fechaEntrega=v;} public EstadoPaquete getEstadoPaquete(){return estadoPaquete;} public void setEstadoPaquete(EstadoPaquete v){estadoPaquete=v;}
 public Apartamento getApartamento(){return apartamento;} public void setApartamento(Apartamento v){apartamento=v;} public LocalDateTime getFechaCreacion(){return fechaCreacion;} public LocalDateTime getFechaActualizacion(){return fechaActualizacion;}
}
