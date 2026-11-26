export const registerStrings = {
  nameLabel: 'Nome',
  emailLabel: 'Email',
  passwordLabel: 'Senha',
  passwordConfirmationLabel: 'Confirmar senha',
  submit: 'Cadastrar',
  alreadyHaveAccount: 'Já tem cadastro?',
  goToLogin: 'Faça login.',
  validation: {
    nameRequired: 'Informe o nome.',
    nameMaxLength: 'O nome deve ter no máximo 255 caracteres.',
    emailRequired: 'Informe o e-mail.',
    emailInvalid: 'Informe um e-mail válido.',
    emailMaxLength: 'O e-mail deve ter no máximo 255 caracteres.',
    passwordRequired: 'Informe a senha.',
    passwordMinLength: 'A senha deve ter no mínimo 8 caracteres.',
    passwordConfirmationRequired: 'Confirme a senha.',
    passwordConfirmationMismatch: 'As senhas não coincidem.',
  },
} as const;

export default registerStrings;
