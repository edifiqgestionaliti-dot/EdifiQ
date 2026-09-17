import { useCallback, useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import { lettersPattern, onlyLetters, onlyNumbers, numbersPattern } from "../../utils/validation";
import "../../styles/modules.css";

const getFieldValue = (field, value) => {
    if (field.type === "number") return onlyNumbers(value);
    if (field.type === "letters") return onlyLetters(value);
    return value;
};

const getFieldPattern = (field) => {
    if (field.type === "number") return numbersPattern;
    if (field.type === "letters") return lettersPattern;
    return undefined;
};

export default function CatalogoPage({ title, subtitle, api, fields }) {
    const initial = Object.fromEntries(fields.map((f) => [f.name, ""]));
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initial);
    const [editId, setEditId] = useState(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const load = useCallback(() => api.list().then(setItems).catch((e) => setError(e.message)), [api]);

    // Corrección del useEffect
    useEffect(() => {
        load();
    }, [load]);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (editId) {
                await api.update(editId, form);
            } else {
                await api.create(form);
            }

            setOpen(false);
            setEditId(null);
            setForm(initial);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    const edit = (x) => {
        setForm(Object.fromEntries(fields.map((f) => [f.name, x[f.name] ?? ""])));
        setEditId(x.id);
        setOpen(true);
    };

    const remove = async (id) => {
        if (confirm("¿Eliminar este registro?")) {
            try {
                await api.remove(id);
                load();
            } catch (e) {
                setError(e.message);
            }
        }
    };

    const filtered = items.filter((item) => fields
        .map((field) => item[field.name] ?? "")
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()));

    return (
        <div className="module-page">
            <div className="module-header">
                <div>
                    <h1 className="module-title">{title}</h1>
                    <p className="module-subtitle">{subtitle}</p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => {
                        setForm(initial);
                        setEditId(null);
                        setError("");
                        setOpen(true);
                    }}
                >
                    + Nuevo
                </button>
            </div>

            <div className="card-panel">
                <div className="toolbar"><strong>{filtered.length} de {items.length} registros</strong></div>
                <MultiCriteriaBar
                    search={search}
                    onSearch={setSearch}
                    searchPlaceholder="Buscar por nombre o descripción..."
                    onClear={() => setSearch("")}
                />
                <div className="table-wrap">
                    <table className="module-table">
                        <thead>
                            <tr>
                                {fields.map((f) => (
                                    <th key={f.name}>{f.label}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length ? (
                                filtered.map((x) => (
                                    <tr key={x.id}>
                                        {fields.map((f) => (
                                            <td key={f.name}>{x[f.name]}</td>
                                        ))}
                                        <td>
                                            <button className="small-btn" onClick={() => edit(x)}>
                                                Editar
                                            </button>{" "}
                                            <button
                                                className="danger-btn small-btn"
                                                onClick={() => remove(x.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={fields.length + 1} className="empty-row">
                                        No hay registros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {open && (
                <Modal
                    title={editId ? "Editar" : "Nuevo"}
                    onClose={() => setOpen(false)}
                >
                    <form onSubmit={submit}>
                        {error && <div className="form-error">{error}</div>}
                        <div className="form-grid">
                            {fields.map((f) => (
                                <div className="form-group" key={f.name}>
                                    <label>{f.label}</label>
                                    {f.type === "textarea" ? (
                                        <textarea
                                            required
                                            value={form[f.name]}
                                            onChange={(e) =>
                                                setForm({ ...form, [f.name]: e.target.value })
                                            }
                                        />
                                    ) : (
                                        <input
                                            required
                                            type="text"
                                            maxLength={f.maxLength}
                                            inputMode={f.type === "number" ? "numeric" : undefined}
                                            pattern={getFieldPattern(f)}
                                            value={form[f.name]}
                                            onChange={(e) => {
                                                setForm({ ...form, [f.name]: getFieldValue(f, e.target.value) });
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="primary-btn">Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}