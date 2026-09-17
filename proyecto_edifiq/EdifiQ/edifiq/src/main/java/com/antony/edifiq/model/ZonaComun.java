package com.antony.edifiq.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name="zona_comun")
public class ZonaComun {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_zona") private Long id;
 @NotBlank(message="El nombre es obligatorio") @Size(max=50) private String nombre;
 @NotBlank(message="La descripción es obligatoria") @Size(max=200) private String descripcion;
 public Long getId(){return id;} public void setId(Long v){id=v;} public String getNombre(){return nombre;} public void setNombre(String v){nombre=v;}
 public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
}
