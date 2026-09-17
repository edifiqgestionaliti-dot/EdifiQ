export const onlyLetters = (value) =>
    value.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]/g, "");

export const onlyNumbers = (value) => value.replace(/\D/g, "");

export const onlyDecimal = (value) => value.replace(/[^0-9.]/g, "");

export const normalizeText = (value = "") => String(value ?? "").trim();

export const isRequiredText = (value, min = 1) =>
    normalizeText(value).length >= min;

export const isValidEmail = (value) => {
    const email = normalizeText(value);
    const parts = email.split("@");
    if (parts.length !== 2) return false;
    const [localPart, domain] = parts;
    return localPart.length > 0 && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
};

export const isValidDocumentNumber = (value) => /^\d{6,20}$/.test(normalizeText(value));

export const isValidPhone = (value) => {
    const phone = normalizeText(value);
    return phone === "" || /^\d{7,20}$/.test(phone);
};

export const isValidPassword = (value, min = 6) => normalizeText(value).length >= min;

export const isValidUsername = (value, min = 4) => normalizeText(value).length >= min;

export const isValidName = (value, min = 2) => {
    const text = normalizeText(value);
    return text.length >= min && /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+$/.test(text);
};

export const lettersPattern = String.raw`[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+`;
export const numbersPattern = "[0-9]+";