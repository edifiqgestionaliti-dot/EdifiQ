package com.antony.edifiq.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antony.edifiq.model.Apartamento;
import com.antony.edifiq.model.EstadoVisita;
import com.antony.edifiq.model.TipoDocumento;
import com.antony.edifiq.model.TipoVisita;
import com.antony.edifiq.model.Visita;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.EstadoVisitaRepository;
import com.antony.edifiq.repository.TipoDocumentoRepository;
import com.antony.edifiq.repository.TipoVisitaRepository;
import com.antony.edifiq.repository.VisitaRepository;

@Service
public class VisitaService {
	private final VisitaRepository repo;
	private final ApartamentoRepository aptRepo;
	private final TipoVisitaRepository tipoRepo;
	private final TipoDocumentoRepository docRepo;
	private final EstadoVisitaRepository estadoRepo;

	public VisitaService(
			VisitaRepository r,
			ApartamentoRepository a,
			TipoVisitaRepository t,
			TipoDocumentoRepository d,
			EstadoVisitaRepository e) {
		repo = r;
		aptRepo = a;
		tipoRepo = t;
		docRepo = d;
		estadoRepo = e;
	}

	public List<Visita> listar() {
		return repo.findAll();
	}

	public List<Visita> porApartamento(Long id) {
		return repo.findByApartamento_Id(id);
	}

	@Transactional
	public Visita guardar(Visita v) {
		validar(v);
		v.setApartamento(apt(v));
		v.setTipoVisita(tipo(v));
		v.setTipoDocumento(doc(v));
		v.setEstadoVisita(estado(v));
		return repo.save(v);
	}

	@Transactional
	public Visita actualizar(Long id, Visita d) {
		Visita v = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Visita no encontrada"));
		validar(d);
		v.setTipoVisita(tipo(d));
		v.setTipoDocumento(doc(d));
		v.setNombreVisitante(d.getNombreVisitante());
		v.setDocumentoVisitante(d.getDocumentoVisitante());
		v.setMotivoVisita(d.getMotivoVisita());
		v.setFechaIngreso(d.getFechaIngreso());
		v.setFechaSalida(d.getFechaSalida());
		v.setEstadoVisita(estado(d));
		v.setApartamento(apt(d));
		return repo.save(v);
	}

	private void validar(Visita v) {
		if (v.getApartamento() == null || v.getApartamento().getId() == null) {
			throw new IllegalArgumentException("El apartamento es obligatorio");
		}

		if (v.getTipoVisita() == null || v.getTipoVisita().getId() == null) {
			throw new IllegalArgumentException("El tipo de visita es obligatorio");
		}

		if (v.getTipoDocumento() == null || v.getTipoDocumento().getId() == null) {
			throw new IllegalArgumentException("El tipo de documento es obligatorio");
		}

		if (v.getEstadoVisita() == null || v.getEstadoVisita().getId() == null) {
			throw new IllegalArgumentException("El estado es obligatorio");
		}

		if (v.getFechaIngreso() != null
				&& v.getFechaSalida() != null
				&& v.getFechaSalida().isBefore(v.getFechaIngreso())) {
			throw new IllegalArgumentException("La salida no puede ser anterior al ingreso");
		}
	}

	private Apartamento apt(Visita v) {
		return aptRepo.findById(v.getApartamento().getId())
				.orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado"));
	}

	private TipoVisita tipo(Visita v) {
		return tipoRepo.findById(v.getTipoVisita().getId())
				.orElseThrow(() -> new IllegalArgumentException("Tipo de visita no encontrado"));
	}

	private TipoDocumento doc(Visita v) {
		return docRepo.findById(v.getTipoDocumento().getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Tipo de documento no encontrado"));
	}

	private EstadoVisita estado(Visita v) {
		return estadoRepo.findById(v.getEstadoVisita().getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Estado de visita no encontrado"));
	}

	public void eliminar(Long id) {
		repo.deleteById(id);
	}
}
