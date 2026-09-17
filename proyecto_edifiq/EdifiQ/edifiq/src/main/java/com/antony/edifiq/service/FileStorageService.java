package com.antony.edifiq.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

	@Value("${app.uploads.comprobantes-dir}")
	private String comprobantesDir;

	public String guardarComprobante(MultipartFile archivo) {
		if (archivo == null || archivo.isEmpty()) {
			throw new IllegalArgumentException("Debe adjuntar el comprobante de pago");
		}

		String tipo = archivo.getContentType();
		if (tipo == null || !tipo.startsWith("image/")) {
			throw new IllegalArgumentException("El comprobante debe ser una imagen (jpg, png, etc.)");
		}

		if (archivo.getSize() > 5 * 1024 * 1024) {
			throw new IllegalArgumentException("El comprobante no debe superar 5 MB");
		}

		try {
			Path carpeta = Paths.get(comprobantesDir).toAbsolutePath().normalize();
			Files.createDirectories(carpeta);

			String original = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "comprobante";
			String extension = "";
			int punto = original.lastIndexOf('.');
			if (punto >= 0) {
				extension = original.substring(punto);
			}

			String nombreArchivo = UUID.randomUUID() + extension;
			Path destino = carpeta.resolve(nombreArchivo);
			Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

			return nombreArchivo;
		} catch (IOException e) {
			throw new IllegalArgumentException("No se pudo guardar el comprobante: " + e.getMessage());
		}
	}
}
