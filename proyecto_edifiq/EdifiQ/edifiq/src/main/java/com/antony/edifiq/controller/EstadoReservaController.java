package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.EstadoReserva;
import com.antony.edifiq.repository.EstadoReservaRepository;

@RestController
@RequestMapping("/api/estados-reserva")
@CrossOrigin(origins = "*")
public class EstadoReservaController {
	private final EstadoReservaRepository repo;

	public EstadoReservaController(EstadoReservaRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public List<EstadoReserva> listar() {
		return repo.findAll();
	}
}
