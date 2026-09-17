package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.EstadoRecibo;
import com.antony.edifiq.repository.EstadoReciboRepository;

@RestController
@RequestMapping("/api/estados-recibo")
@CrossOrigin(origins = "*")
public class EstadoReciboController {
	private final EstadoReciboRepository repo;

	public EstadoReciboController(EstadoReciboRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public List<EstadoRecibo> listar() {
		return repo.findAll();
	}
}
