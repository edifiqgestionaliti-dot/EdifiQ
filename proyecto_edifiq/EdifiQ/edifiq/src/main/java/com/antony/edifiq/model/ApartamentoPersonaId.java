package com.antony.edifiq.model;
import java.io.Serializable;
import java.util.Objects;
public class ApartamentoPersonaId implements Serializable {
 private Long apartamento; private Long persona;
 public ApartamentoPersonaId() {}
 public ApartamentoPersonaId(Long apartamento,Long persona){this.apartamento=apartamento;this.persona=persona;}
 public Long getApartamento(){return apartamento;} public void setApartamento(Long v){apartamento=v;}
 public Long getPersona(){return persona;} public void setPersona(Long v){persona=v;}
 @Override public boolean equals(Object o){if(this==o)return true;if(!(o instanceof ApartamentoPersonaId x))return false;return Objects.equals(apartamento,x.apartamento)&&Objects.equals(persona,x.persona);}
 @Override public int hashCode(){return Objects.hash(apartamento,persona);}
}
