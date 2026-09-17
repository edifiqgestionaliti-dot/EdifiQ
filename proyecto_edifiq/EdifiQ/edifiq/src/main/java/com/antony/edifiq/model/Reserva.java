package com.antony.edifiq.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.*;
@Entity @Table(name="reserva_zona")
public class Reserva {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_reserva") private Long id;
 @NotNull(message="La fecha es obligatoria") @Column(name="fecha_reserva",nullable=false) private LocalDate fechaReserva;
 @NotNull(message="La hora de inicio es obligatoria") @Column(name="hora_inicio",nullable=false) private LocalTime horaInicio;
 @NotNull(message="La hora de fin es obligatoria") @Column(name="hora_fin",nullable=false) private LocalTime horaFin;
 @Min(value=0,message="Los invitados no pueden ser negativos") @Column(name="cantidad_invitados") private Integer cantidadInvitados=0;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_estado_reserva",nullable=false) private EstadoReserva estadoReserva;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_zona",nullable=false) private ZonaComun zona;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_apartamento",nullable=false) private Apartamento apartamento;
 @Column(name="fecha_creacion",updatable=false,insertable=false) private LocalDateTime fechaCreacion;
 @Column(name="fecha_actualizacion",insertable=false) private LocalDateTime fechaActualizacion;
 public Long getId(){return id;} public void setId(Long v){id=v;} public LocalDate getFechaReserva(){return fechaReserva;} public void setFechaReserva(LocalDate v){fechaReserva=v;}
 public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime v){horaInicio=v;} public LocalTime getHoraFin(){return horaFin;} public void setHoraFin(LocalTime v){horaFin=v;}
 public Integer getCantidadInvitados(){return cantidadInvitados;} public void setCantidadInvitados(Integer v){cantidadInvitados=v;} public EstadoReserva getEstadoReserva(){return estadoReserva;} public void setEstadoReserva(EstadoReserva v){estadoReserva=v;}
 public ZonaComun getZona(){return zona;} public void setZona(ZonaComun v){zona=v;} public Apartamento getApartamento(){return apartamento;} public void setApartamento(Apartamento v){apartamento=v;}
 public LocalDateTime getFechaCreacion(){return fechaCreacion;} public LocalDateTime getFechaActualizacion(){return fechaActualizacion;}
}
