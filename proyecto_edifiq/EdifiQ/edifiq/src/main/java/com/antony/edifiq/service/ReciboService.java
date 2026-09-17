package com.antony.edifiq.service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.antony.edifiq.model.Apartamento;
import com.antony.edifiq.model.EstadoRecibo;
import com.antony.edifiq.model.Recibo;
import com.antony.edifiq.model.TipoServicio;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.EstadoReciboRepository;
import com.antony.edifiq.repository.ReciboRepository;
import com.antony.edifiq.repository.TipoServicioRepository;

@Service
public class ReciboService {
	public static final String ESTADO_PENDIENTE = "Pendiente";
	public static final String ESTADO_REVISION = "Pendiente por revisar";
	public static final String ESTADO_PAGADO = "Pagado";

	private final ReciboRepository repo;
	private final ApartamentoRepository aptRepo;
	private final TipoServicioRepository servicioRepo;
	private final EstadoReciboRepository estadoRepo;
	private final FileStorageService fileStorageService;

	public ReciboService(
			ReciboRepository r,
			ApartamentoRepository a,
			TipoServicioRepository s,
			EstadoReciboRepository e,
			FileStorageService fileStorageService) {
		repo = r;
		aptRepo = a;
		servicioRepo = s;
		estadoRepo = e;
		this.fileStorageService = fileStorageService;
	}

	public List<Recibo> listar() {
		return repo.findAll();
	}

	public List<Recibo> porApartamento(Long id) {
		return repo.findByApartamento_Id(id);
	}

	public List<Recibo> pendientesPorRevisar() {
		return repo.findAll().stream()
				.filter(r -> ESTADO_REVISION.equalsIgnoreCase(r.getEstadoRecibo().getNombre()))
				.toList();
	}

	/**
	 * Crea un recibo. Puede ser registrado por el admin o por el vigilante;
	 * siempre nace en estado "Pendiente" sin importar lo que envíe el cliente.
	 */
	@Transactional
	public Recibo guardar(Recibo r) {
		validarDatosBase(r);
		r.setApartamento(apt(r));
		r.setTipoServicio(servicio(r));
		r.setEstadoRecibo(estadoPorNombre(ESTADO_PENDIENTE));
		r.setRutaComprobante(null);
		r.setFechaPago(null);
		return repo.save(r);
	}

	/**
	 * Edita los datos del recibo (servicio, periodo, valor, fechas, apartamento).
	 * El estado del recibo NO se toca aquí: solo cambia a través del flujo de
	 * comprobante/verificación/rechazo, y esa parte solo la controla el admin.
	 */
	@Transactional
	public Recibo actualizar(Long id, Recibo d) {
		Recibo r = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Recibo no encontrado"));
		validarDatosBase(d);
		r.setPeriodo(d.getPeriodo());
		r.setValor(d.getValor());
		r.setFechaEmision(d.getFechaEmision());
		r.setFechaVencimiento(d.getFechaVencimiento());
		r.setApartamento(apt(d));
		r.setTipoServicio(servicio(d));
		return repo.save(r);
	}

	/**
	 * El residente sube la foto del comprobante de pago.
	 * Solo se puede hacer si el recibo está "Pendiente por pagar".
	 * Al subirlo, el recibo pasa a "Pendiente por revisar".
	 */
	@Transactional
	public Recibo subirComprobante(Long id, MultipartFile archivo) {
		Recibo r = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Recibo no encontrado"));

		if (!ESTADO_PENDIENTE.equalsIgnoreCase(r.getEstadoRecibo().getNombre())) {
			throw new IllegalArgumentException(
					"Solo se puede subir un comprobante a un recibo pendiente por pagar");
		}

		String rutaGuardada = fileStorageService.guardarComprobante(archivo);
		r.setRutaComprobante(rutaGuardada);
		r.setEstadoRecibo(estadoPorNombre(ESTADO_REVISION));
		return repo.save(r);
	}

	/**
	 * El admin revisa el comprobante y confirma que el pago es correcto.
	 * Solo aplica a recibos "Pendiente por revisar".
	 */
	@Transactional
	public Recibo verificarPago(Long id) {
		Recibo r = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Recibo no encontrado"));

		if (!ESTADO_REVISION.equalsIgnoreCase(r.getEstadoRecibo().getNombre())) {
			throw new IllegalArgumentException(
					"El recibo no está pendiente por revisar");
		}

		r.setEstadoRecibo(estadoPorNombre(ESTADO_PAGADO));
		r.setFechaPago(LocalDateTime.now());
		return repo.save(r);
	}

	/**
	 * El admin rechaza el comprobante (por ejemplo, no corresponde o no se ve
	 * bien). El recibo vuelve a "Pendiente por pagar" para que el residente
	 * suba un nuevo comprobante.
	 */
	@Transactional
	public Recibo rechazarComprobante(Long id) {
		Recibo r = repo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Recibo no encontrado"));

		if (!ESTADO_REVISION.equalsIgnoreCase(r.getEstadoRecibo().getNombre())) {
			throw new IllegalArgumentException(
					"El recibo no está pendiente por revisar");
		}

		r.setRutaComprobante(null);
		r.setEstadoRecibo(estadoPorNombre(ESTADO_PENDIENTE));
		return repo.save(r);
	}

	private void validarDatosBase(Recibo r) {
		if (r.getApartamento() == null || r.getApartamento().getId() == null) {
			throw new IllegalArgumentException("El apartamento es obligatorio");
		}

		if (r.getTipoServicio() == null || r.getTipoServicio().getId() == null) {
			throw new IllegalArgumentException("El servicio es obligatorio");
		}

		if (r.getFechaEmision() != null
				&& r.getFechaVencimiento() != null
				&& r.getFechaVencimiento().isBefore(r.getFechaEmision())) {
			throw new IllegalArgumentException(
					"El vencimiento no puede ser anterior a la emisión");
		}
	}

	private Apartamento apt(Recibo r) {
		return aptRepo.findById(r.getApartamento().getId())
				.orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado"));
	}

	private TipoServicio servicio(Recibo r) {
		return servicioRepo.findById(r.getTipoServicio().getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Tipo de servicio no encontrado"));
	}

	private EstadoRecibo estadoPorNombre(String nombre) {
		return estadoRepo.findAll().stream()
				.filter(e -> nombre.equalsIgnoreCase(e.getNombre()))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException(
						"El estado '" + nombre + "' no está configurado en estado_recibo"));
	}

	public void eliminar(Long id) {
		repo.deleteById(id);
	}
}
