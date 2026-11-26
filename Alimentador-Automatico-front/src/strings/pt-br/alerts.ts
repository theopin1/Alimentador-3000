export const alertsStrings = {
  title: 'Alertas',
  heading: 'Seus alertas',
  loading: 'Carregando alertas...',
  empty: 'Nenhum alerta registrado por enquanto.',
  loadError: 'Não foi possível carregar os alertas.',
  markAsReadError: 'Não foi possível marcar o alerta como lido.',
  resolveSuccess: 'Alerta marcado como resolvido.',
  resolveError: 'Não foi possível resolver o alerta.',
  alertCount: (total: number) =>
    `${total} ${total === 1 ? 'alerta' : 'alertas'}`,
  unread: 'Não lido',
  resolved: 'Resolvido',
  open: 'Em aberto',
  severityLabel: (label: string) => `Gravidade: ${label}`,
  severity: {
    critical: 'Crítico',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  },
  type: {
    low_reservoir: 'Reservatório baixo',
    empty_reservoir: 'Reservatório vazio',
    low_battery: 'Bateria baixa',
    device_offline: 'Dispositivo offline',
    feeding_failure: 'Falha na alimentação',
    high_temperature: 'Temperatura alta',
  } as Record<string, string>,
  detail: {
    title: 'Detalhes do alerta',
    device: 'Alimentador',
    createdAt: 'Criado em',
    resolvedAt: 'Resolvido em',
    markedAsRead: 'Alerta marcado como lido',
    markingAsRead: 'Marcando como lido...',
    markAsRead: 'Marcar como lido',
    resolvedButton: 'Alerta resolvido',
    resolveButton: 'Marcar como resolvido',
  },
} as const;

export default alertsStrings;
