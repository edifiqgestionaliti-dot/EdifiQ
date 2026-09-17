package com.antony.edifiq.service;

import java.util.List;

import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;

import com.antony.edifiq.model.Apartamento;
import com.antony.edifiq.model.EstadoReserva;
import com.antony.edifiq.model.Reserva;
import com.antony.edifiq.model.ZonaComun;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.EstadoReservaRepository;
import com.antony.edifiq.repository.ReservaRepository;
import com.antony.edifiq.repository.ZonaComunRepository;

@Service
public class ReservaService {
	private final ReservaRepository repo;
	private final ApartamentoRepository aptRepo;
	private final ZonaComunRepository zonaRepo;
	private final EstadoReservaRepository estadoRepo;

	public ReservaService(
			ReservaRepository r,
			ApartamentoRepository a,
			ZonaComunRepository z,
			EstadoReservaRepository e) {
		repo = r;
		aptRepo = a;
		zonaRepo = z;
		estadoRepo = e;
	}

	public List<Reserva> listar() {
		return repo.findAll();
	}

	public List<Reserva> porApartamento(Long id) {
		return repo.findByApartamento_Id(id);
	}

	@Transactional
	public Reserva guardar(Reserva r) {
		validar(r, null);
		r.setApartamento(apt(r));
		r.setZona(zona(r));
		r.setEstadoReserva(estado(r));

		if (r.getCantidadInvitados() == null) {
			r.setCantidadInvitados(0);
		}
		return repo.save(r);
	}

	@Transactional
	public Reserva actualizar(Long id, Reserva d) {
		Reserva r = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
		validar(d, id);
		r.setFechaReserva(d.getFechaReserva());
		r.setHoraInicio(d.getHoraInicio());
		r.setHoraFin(d.getHoraFin());
		r.setCantidadInvitados(d.getCantidadInvitados());
		r.setApartamento(apt(d));
		r.setZona(zona(d));
		r.setEstadoReserva(estado(d));
		return repo.save(r);
	}

	private void validar(Reserva r, Long id) {
		if (r.getApartamento() == null || r.getApartamento().getId() == null) {
			throw new IllegalArgumentException("El apartamento es obligatorio");
		}

		if (r.getZona() == null || r.getZona().getId() == null) {
			throw new IllegalArgumentException("La zona es obligatoria");
		}

		if (r.getEstadoReserva() == null || r.getEstadoReserva().getId() == null) {
			throw new IllegalArgumentException("El estado es obligatorio");
		}

		if (r.getFechaReserva() != null
				&& r.getFechaReserva().isBefore(java.time.LocalDate.now())) {
			throw new IllegalArgumentException(
					"La fecha de reserva no puede ser anterior a hoy");
		}

		if (r.getHoraInicio() != null
				&& r.getHoraFin() != null
				&& !r.getHoraFin().isAfter(r.getHoraInicio())) {
			throw new IllegalArgumentException(
					"La hora final debe ser posterior a la inicial");
		}

		if (r.getFechaReserva() != null
				&& r.getHoraInicio() != null
				&& r.getHoraFin() != null
				&& repo.existeConflicto(
						r.getZona().getId(),
						r.getFechaReserva(),
						r.getHoraInicio(),
						r.getHoraFin(),
						id)) {
			throw new IllegalArgumentException(
					"La zona ya está reservada en ese horario");
		}
	}

	private Apartamento apt(Reserva r) {
		return aptRepo.findById(r.getApartamento().getId())
				.orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado"));
	}

	private ZonaComun zona(Reserva r) {
		return zonaRepo.findById(r.getZona().getId())
				.orElseThrow(() -> new IllegalArgumentException("Zona común no encontrada"));
	}

	private EstadoReserva estado(Reserva r) {
		return estadoRepo.findById(r.getEstadoReserva().getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Estado de reserva no encontrado"));
	}

	public void eliminar(Long id) {
		repo.deleteById(id);
	}
}
