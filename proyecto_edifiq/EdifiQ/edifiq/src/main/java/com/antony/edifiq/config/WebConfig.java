package com.antony.edifiq.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Value("${app.uploads.comprobantes-dir}")
	private String comprobantesDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String ruta = Paths.get(comprobantesDir).toAbsolutePath().normalize().toString();
		registry.addResourceHandler("/uploads/comprobantes/**")
				.addResourceLocations("file:" + ruta + "/");
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins("http://localhost:5173", "http://localhost:5174")
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*");
		registry.addMapping("/uploads/**")
				.allowedOrigins("http://localhost:5173", "http://localhost:5174");
	}
}
