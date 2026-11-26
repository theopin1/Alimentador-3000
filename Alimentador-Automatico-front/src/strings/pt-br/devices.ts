export const devicesStrings = {
  title: 'Meus Alimentadores',
  loading: 'Carregando alimentadores...',
  empty: 'Nenhum alimentador cadastrado ainda.',
  loadError: 'Não foi possível carregar os alimentadores.',
  addAriaLabel: 'Cadastrar alimentador',
  card: {
    noReadings: 'Sem leituras',
    lastReading: (value: string) => `Última leitura: ${value}`,
    reservoir: 'Reservatório',
    humidity: 'Umidade',
    temperature: 'Temperatura',
    battery: 'Bateria',
    feedAriaLabel: 'Alimentar agora',
    openAriaLabel: (deviceName: string) => `Abrir ${deviceName}`,
  },
  pair: {
    title: 'Cadastrar alimentador',
    description:
      'Informe o código serial impresso no dispositivo para vinculá-lo à sua conta.',
    success: 'Alimentador cadastrado com sucesso!',
    serialCodeLabel: 'Código serial',
    serialCodePlaceholder: 'Ex.: ABCD1234EFGH5678',
    nameLabel: 'Nome (opcional)',
    namePlaceholder: 'Ex.: Cozinha',
    submit: 'Cadastrar',
    validation: {
      serialCodeRequired: 'Informe o código serial do alimentador.',
      serialCodeLength: (length: number) =>
        `O código serial deve ter exatamente ${length} caracteres.`,
      nameMaxLength: 'O nome deve ter no máximo 100 caracteres.',
    },
  },
} as const;

export default devicesStrings;
