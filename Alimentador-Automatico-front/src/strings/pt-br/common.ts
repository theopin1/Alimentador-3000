export const commonStrings = {
  loading: 'Carregando...',
  retry: 'Tentar novamente',
  cancel: 'Cancelar',
  save: 'Salvar',
  register: 'Cadastrar',
  confirm: 'Confirmar',
  loadMore: 'Carregar mais',
  soon: 'Em breve',
  emptyValue: '—',
  unexpectedError: 'Erro inesperado. Tente novamente.',
  apiCommunicationError: 'Erro inesperado ao comunicar com a API.',
  appLogoLabel: 'Logo do Alimentador Automático',
  closeModal: 'Fechar modal',
  deviceFallbackName: (id: number | string) => `Alimentador #${id}`,
  feed: {
    error: 'Não foi possível liberar a comida. Tente novamente.',
    success: (deviceName: string) =>
      `A comida do alimentador ${deviceName} foi liberada.`,
    confirmTitle: 'Liberar comida',
    confirmDescription: (deviceName: string) =>
      `Deseja liberar a comida do alimentador ${deviceName} agora?`,
    confirmLabel: 'Liberar agora',
  },
  providerError: (hookName: string, providerName: string) =>
    `${hookName} deve ser usado dentro de <${providerName}>.`,
} as const;

export default commonStrings;
