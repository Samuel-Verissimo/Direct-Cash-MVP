const currencyFormatter = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-br', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatCurrency(value: string | number): string {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return currencyFormatter.format(numericValue);
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

export function formatInputDateValue(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function shiftDate(value: Date, days: number): Date {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}
