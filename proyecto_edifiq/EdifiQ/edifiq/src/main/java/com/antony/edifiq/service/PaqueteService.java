package com.antony.edifiq.service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antony.edifiq.model.Apartamento;
import com.antony.edifiq.model.EstadoPaquete;
import com.antony.edifiq.model.Paquete;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.EstadoPaqueteRepository;
import com.antony.edifiq.repository.PaqueteRepository;

@Service
public class PaqueteService {
	private final PaqueteRepository repo;
	private final ApartamentoRepository aptRepo;
	private final EstadoPaqueteRepository estadoRepo;

	public PaqueteService(
			PaqueteRepository r,
			ApartamentoRepository a,
			EstadoPaqueteRepository e) {
		repo = r;
		aptRepo = a;
		estadoRepo = e;
	}

	public List<Paquete> listar() {
		return repo.findAll();
	}

	public List<Paquete> porApartamento(Long id) {
		return repo.findByApartamento_Id(id);
	}

	@Transactional
	public Paquete guardar(Paquete p) {
		validar(p);
		p.setApartamento(apt(p));
		p.setEstadoPaquete(estado(p));

		if (p.getFechaRecepcion() == null) {
			p.setFechaRecepcion(LocalDateTime.now());
		}

		return repo.save(p);
	}

	@Transactional
	public Paquete actualizar(Long id, Paquete d) {
		Paquete p = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Paquete no encontrado"));
		validar(d);
		p.setDescripcion(d.getDescripcion());
		p.setRemitente(d.getRemitente());
		p.setFechaRecepcion(d.getFechaRecepcion());
		p.setFechaEntrega(d.getFechaEntrega());
		p.setApartamento(apt(d));
		p.setEstadoPaquete(estado(d));
		return repo.save(p);
	}

	private void validar(Paquete p) {
		if (p.getApartamento() == null || p.getApartamento().getId() == null) {
			throw new IllegalArgumentException("El apartamento es obligatorio");
		}

		if (p.getEstadoPaquete() == null || p.getEstadoPaquete().getId() == null) {
			throw new IllegalArgumentException("El estado es obligatorio");
		}

		if (p.getFechaEntrega() != null
				&& p.getFechaRecepcion() != null
				&& p.getFechaEntrega().isBefore(p.getFechaRecepcion())) {
			throw new IllegalArgumentException(
					"La entrega no puede ser anterior a la recepción");
		}
	}

	private Apartamento apt(Paquete p) {
		return aptRepo.findById(p.getApartamento().getId())
				.orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado"));
	}

	private EstadoPaquete estado(Paquete p) {
		return estadoRepo.findById(p.getEstadoPaquete().getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Estado de paquete no encontrado"));
	}

	public void eliminar(Long id) {
		repo.deleteById(id);
	}
}
