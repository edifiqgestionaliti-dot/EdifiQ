package com.antony.edifiq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "apartamento", uniqueConstraints = @UniqueConstraint(columnNames = {"id_torre","numero_apartamento"}))
public class Apartamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_apartamento") private Long id;

    @NotBlank(message="El número del apartamento es obligatorio")
    @Size(max=10,message="Máximo 10 caracteres")
    @Column(name="numero_apartamento",nullable=false,length=10) private String numeroApartamento;

    @NotNull(message="El piso es obligatorio")
    @Min(value=0,message="El piso no puede ser negativo")
    @Column(nullable=false) private Integer piso;

    @Column(nullable=false) private Boolean activo=true;

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="id_torre",nullable=false) private Torre torre;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNumeroApartamento(){return numeroApartamento;} public void setNumeroApartamento(String v){numeroApartamento=v;}
    public Integer getPiso(){return piso;} public void setPiso(Integer v){piso=v;}
    public Boolean getActivo(){return activo;} public void setActivo(Boolean v){activo=v;}
    public Torre getTorre(){return torre;} public void setTorre(Torre v){torre=v;}
}
