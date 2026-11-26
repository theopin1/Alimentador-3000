export const historyStrings = {
  title: 'Histórico',
  deviceLabel: 'Alimentador',
  noDevices: 'Nenhum alimentador disponível',
  loading: 'Carregando histórico...',
  empty: 'Nenhuma liberação registrada para este alimentador.',
  loadError: 'Não foi possível carregar o histórico.',
  recordCount: (total: number) =>
    `${total} ${total === 1 ? 'registro' : 'registros'}`,
  portion: (grams: number) => `${grams} g`,
  triggerType: {
    manual: 'Manual',
    scheduled: 'Agendada',
    remote: 'Remota',
    default: 'Liberação',
  },
  status: {
    success: 'Concluída',
    failure: 'Falhou',
    pending: 'Pendente',
  },
} as const;

export default historyStrings;
