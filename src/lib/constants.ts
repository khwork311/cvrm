export const PAGE_LIMIT = 10;

export const getStatusOptions = (t: (key: string) => string) => [
  { value: '', label: t('common:all') },
  { value: '1', label: t('common:active') },
  { value: '0', label: t('common:notActive') },
];

// to be changed
export const getRoleOptions = (t: (key: string) => string) => [
  { value: '', label: t('common:all') },
  { value: '1', label: 'Super Admin' },
  { value: '2', label: 'Admin' },
  { value: '3', label: 'Manager' },
  { value: '4', label: 'Viewer' },
];
