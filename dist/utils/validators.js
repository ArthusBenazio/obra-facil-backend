export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
export function validatePassword(password) {
    return PASSWORD_REGEX.test(password);
}
export const PASSWORD_REQUIREMENTS = `
A senha deve conter:
- Pelo menos 6 caracteres
- 1 letra maiúscula (A-Z)
- 1 letra minúscula (a-z)
- 1 caractere especial (!@#$%^&* etc.)
`;
