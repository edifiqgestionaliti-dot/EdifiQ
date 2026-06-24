package com.example.edifiq

import android.graphics.Rect
import android.os.Bundle
import android.text.InputFilter
import android.util.Patterns
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.android.volley.Request
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout

class MainActivity : AppCompatActivity() {

    private lateinit var scrollView: ScrollView
    private lateinit var spinnerTipoDoc: Spinner
    private lateinit var txtNumDoc: TextInputEditText
    private lateinit var txtNombres: TextInputEditText
    private lateinit var txtApellidos: TextInputEditText
    private lateinit var txtTelefono: TextInputEditText
    private lateinit var txtCorreo: TextInputEditText
    private lateinit var btnGuardar: Button

    private lateinit var layoutNumDoc: TextInputLayout
    private lateinit var layoutNombres: TextInputLayout
    private lateinit var layoutApellidos: TextInputLayout
    private lateinit var layoutTelefono: TextInputLayout
    private lateinit var layoutCorreo: TextInputLayout

    // CAMBIA ESTA URL POR TU IP LOCAL
    private val url = "http://192.168.1.12:8000/api/personas"

    private val tipoDocumentoIds = arrayOf("1", "2", "3")
    private val tipoDocumentoLabels = arrayOf("Cédula", "Pasaporte", "Tarjeta de Identidad")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.form)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(
                systemBars.left,
                systemBars.top,
                systemBars.right,
                maxOf(systemBars.bottom, ime.bottom)
            )

            if (ime.bottom > 0) {
                currentFocus?.let { focused ->
                    focused.post {
                        val rect = Rect(0, 0, focused.width, focused.height)
                        focused.requestRectangleOnScreen(rect, true)
                    }
                }
            }

            insets
        }

        scrollView = findViewById(R.id.scrollView)
        spinnerTipoDoc = findViewById(R.id.spinner_tipo_doc)
        txtNumDoc = findViewById(R.id.txt_num_doc)
        txtNombres = findViewById(R.id.txt_nombres)
        txtApellidos = findViewById(R.id.txt_apellidos)
        txtTelefono = findViewById(R.id.txt_telefono)
        txtCorreo = findViewById(R.id.txt_correo)
        btnGuardar = findViewById(R.id.btn_guardar)

        layoutNumDoc = findViewById(R.id.layout_num_doc)
        layoutNombres = findViewById(R.id.layout_nombres)
        layoutApellidos = findViewById(R.id.layout_apellidos)
        layoutTelefono = findViewById(R.id.layout_telefono)
        layoutCorreo = findViewById(R.id.layout_correo)

        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, tipoDocumentoLabels)
        spinnerTipoDoc.adapter = adapter

        // Filtro: solo letras y espacios para Nombres y Apellidos
        val filtroSoloLetras = InputFilter { source, start, end, _, _, _ ->
            val builder = StringBuilder()
            for (i in start until end) {
                val c = source[i]
                if (c.isLetter() || c == ' ') {
                    builder.append(c)
                }
            }
            if (builder.length == end - start) null else builder.toString()
        }
        txtNombres.filters = arrayOf(filtroSoloLetras)
        txtApellidos.filters = arrayOf(filtroSoloLetras)

        btnGuardar.setOnClickListener {
            if (validarCampos()) {
                registrarPersona()
            }
        }
    }

    private fun validarCampos(): Boolean {
        var esValido = true

        layoutNumDoc.error = null
        layoutNombres.error = null
        layoutApellidos.error = null
        layoutTelefono.error = null
        layoutCorreo.error = null

        if (txtNumDoc.text.toString().trim().isEmpty()) {
            layoutNumDoc.error = "Ingresa el número de documento"
            esValido = false
        }

        if (txtNombres.text.toString().trim().isEmpty()) {
            layoutNombres.error = "Ingresa los nombres"
            esValido = false
        }

        if (txtApellidos.text.toString().trim().isEmpty()) {
            layoutApellidos.error = "Ingresa los apellidos"
            esValido = false
        }

        val telefono = txtTelefono.text.toString().trim()
        if (telefono.isEmpty()) {
            layoutTelefono.error = "Ingresa el teléfono"
            esValido = false
        }

        val correo = txtCorreo.text.toString().trim()
        if (correo.isEmpty()) {
            layoutCorreo.error = "Ingresa el correo"
            esValido = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(correo).matches()) {
            layoutCorreo.error = "Ingresa un correo válido"
            esValido = false
        }

        return esValido
    }

    private fun registrarPersona() {
        val idTipoDoc = tipoDocumentoIds[spinnerTipoDoc.selectedItemPosition]
        val numDoc = txtNumDoc.text.toString().trim()
        val nombres = txtNombres.text.toString().trim()
        val apellidos = txtApellidos.text.toString().trim()
        val telefono = txtTelefono.text.toString().trim()
        val correo = txtCorreo.text.toString().trim()

        val queue = Volley.newRequestQueue(this)

        val request = object : StringRequest(
            Request.Method.POST, url,
            { response ->
                Toast.makeText(this, response, Toast.LENGTH_LONG).show()
            },
            { error ->
                Toast.makeText(this, "Error: ${error.message}", Toast.LENGTH_LONG).show()
            }
        ) {
            override fun getParams(): MutableMap<String, String> {
                val params = HashMap<String, String>()
                params["id_tipo_documento"] = idTipoDoc
                params["numero_documento"] = numDoc
                params["nombres"] = nombres
                params["apellidos"] = apellidos
                params["telefono"] = telefono
                params["correo"] = correo
                return params
            }
        }

        queue.add(request)
    }
}