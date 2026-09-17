package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.EstadoPaquete;
import com.antony.edifiq.repository.EstadoPaqueteRepository;

@RestController
@RequestMapping("/api/estados-paquete")
@CrossOrigin(origins = "*")
public class EstadoPaqueteController {
	private final EstadoPaqueteRepository repo;

	public EstadoPaqueteController(EstadoPaqueteRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public List<EstadoPaquete> listar() {
		return repo.findAll();
	}
}
