/* Currency formatting. The catalogue itself lives in the API. */
export const formatAUD = (n) => {
  if (n === null || n === undefined) return "Enquire";
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2 }).format(n);
};
