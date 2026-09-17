package com.antony.edifiq.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "estado_visita")
public class EstadoVisita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_visita")
    private Long id;

    private String nombre;

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public String getNombre() { return nombre; }
    public void setNombre(String v) { nombre = v; }
}
