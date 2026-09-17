package com.antony.edifiq.model;
import jakarta.validation.constraints.*;
public class UsuarioRegistroDTO {
 @NotNull(message="La persona es obligatoria") private Long idPersona;
 @NotBlank(message="El usuario es obligatorio") @Size(min=4,max=50,message="El usuario debe tener entre 4 y 50 caracteres") private String username;
 @NotBlank(message="La contraseña es obligatoria") @Size(min=6,message="La contraseña debe tener al menos 6 caracteres") private String password;
 public Long getIdPersona(){return idPersona;} public void setIdPersona(Long v){idPersona=v;}
 public String getUsername(){return username;} public void setUsername(String v){username=v;}
 public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
