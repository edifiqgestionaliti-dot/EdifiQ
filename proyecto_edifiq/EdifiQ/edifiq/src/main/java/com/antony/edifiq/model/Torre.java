package com.antony.edifiq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "torre", uniqueConstraints = @UniqueConstraint(columnNames = "nombre_torre"))
public class Torre {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_torre") private Long id;

    @NotBlank(message = "El nombre de la torre es obligatorio")
    @Size(max = 20, message = "El nombre de la torre no puede superar 20 caracteres")
    @Column(name = "nombre_torre", nullable = false, length = 20) private String nombreTorre;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNombreTorre(){return nombreTorre;} public void setNombreTorre(String nombreTorre){this.nombreTorre=nombreTorre;}
}
