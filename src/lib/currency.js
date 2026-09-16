// Formateador de moneda para Bolívares (Bs.) y Dólares (USD $)

export const TASA_DEFAULT = 36.50;

/**
 * Formatea un monto en Bolívares con formato venezolano (ej: Bs. 1.250,50)
 * @param {number} montoUSD - Monto base en USD
 * @param {number} tasa - Tasa de cambio BCV (Bs por USD)
 * @returns {string}
 */
export const formatBs = (montoUSD, tasa = TASA_DEFAULT) => {
  const num = Number(montoUSD) || 0;
  const tasaNum = Number(tasa) || TASA_DEFAULT;
  const montoBs = num * tasaNum;

  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(montoBs)
    .replace('VES', 'Bs.')
    .trim();
};

/**
 * Formatea un monto en Dólares americanos (ej: $12.50)
 * @param {number} montoUSD
 * @returns {string}
 */
export const formatUSD = (montoUSD) => {
  const num = Number(montoUSD) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Convierte un monto de USD a Bs
 */
export const usdToBs = (montoUSD, tasa = TASA_DEFAULT) => {
  const num = Number(montoUSD) || 0;
  const tasaNum = Number(tasa) || TASA_DEFAULT;
  return num * tasaNum;
};
