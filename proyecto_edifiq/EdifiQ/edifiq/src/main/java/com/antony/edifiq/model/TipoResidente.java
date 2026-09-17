package com.antony.edifiq.model;
import jakarta.persistence.*;
@Entity @Table(name="tipo_residente")
public class TipoResidente {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="id_tipo_residente") private Long id;
 private String nombre;
 public Long getId(){return id;} public void setId(Long id){this.id=id;}
 public String getNombre(){return nombre;} public void setNombre(String nombre){this.nombre=nombre;}
}
