package com.antony.edifiq.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name="recibo")
public class Recibo {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_recibo") private Long id;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_tipo_servicio",nullable=false) private TipoServicio tipoServicio;
 @NotBlank(message="El periodo es obligatorio") @Size(max=20) private String periodo;
 @NotNull(message="El valor es obligatorio") @DecimalMin(value="0.01",message="El valor debe ser mayor a 0") @Digits(integer=10,fraction=2) private BigDecimal valor;
 @NotNull(message="La fecha de emisión es obligatoria") @Column(name="fecha_emision",nullable=false) private LocalDate fechaEmision;
 @NotNull(message="La fecha de vencimiento es obligatoria") @Column(name="fecha_vencimiento",nullable=false) private LocalDate fechaVencimiento;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_estado_recibo",nullable=false) private EstadoRecibo estadoRecibo;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="id_apartamento",nullable=false) private Apartamento apartamento;
 @Column(name="ruta_comprobante") private String rutaComprobante;
 @Column(name="fecha_pago") private LocalDateTime fechaPago;
 @Column(name="fecha_creacion",updatable=false,insertable=false) private LocalDateTime fechaCreacion;
 @Column(name="fecha_actualizacion",insertable=false) private LocalDateTime fechaActualizacion;
 public Long getId(){return id;} public void setId(Long v){id=v;} public TipoServicio getTipoServicio(){return tipoServicio;} public void setTipoServicio(TipoServicio v){tipoServicio=v;}
 public String getPeriodo(){return periodo;} public void setPeriodo(String v){periodo=v;} public BigDecimal getValor(){return valor;} public void setValor(BigDecimal v){valor=v;}
 public LocalDate getFechaEmision(){return fechaEmision;} public void setFechaEmision(LocalDate v){fechaEmision=v;} public LocalDate getFechaVencimiento(){return fechaVencimiento;} public void setFechaVencimiento(LocalDate v){fechaVencimiento=v;}
 public EstadoRecibo getEstadoRecibo(){return estadoRecibo;} public void setEstadoRecibo(EstadoRecibo v){estadoRecibo=v;} public Apartamento getApartamento(){return apartamento;} public void setApartamento(Apartamento v){apartamento=v;}
 public String getRutaComprobante(){return rutaComprobante;} public void setRutaComprobante(String v){rutaComprobante=v;}
 public LocalDateTime getFechaPago(){return fechaPago;} public void setFechaPago(LocalDateTime v){fechaPago=v;}
 public LocalDateTime getFechaCreacion(){return fechaCreacion;} public LocalDateTime getFechaActualizacion(){return fechaActualizacion;}
}
