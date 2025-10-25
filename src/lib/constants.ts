export const PAGE_LIMIT = 10;

export const getStatusOptions = (t: (key: string) => string) => [
  { value: '', label: t('common:all') },
  { value: '1', label: t('common:active') },
  { value: '0', label: t('common:notActive') },
];
