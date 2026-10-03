const EMISSION_FACTORS = Object.freeze({
  "Transportation": 0.21,
  "Electricity Usage": 0.82,
  "Fuel Consumption": 2.31,
  "Food Consumption": 1.5,
  "Waste Generation": 0.5,
  "Water Usage": 0.0003,
  "Online Shopping": 0.5,
  "Travel Activities": 0.21,
});

const CATEGORY_ICONS = Object.freeze({
  "Transportation": "🚗",
  "Electricity Usage": "⚡",
  "Fuel Consumption": "⛽",
  "Food Consumption": "🍴",
  "Waste Generation": "🗑️",
  "Water Usage": "💧",
  "Online Shopping": "🛍️",
  "Travel Activities": "✈️",
});

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const getEmissionFactor = (category) => EMISSION_FACTORS[category] ?? null;

const calculateEmission = (category, amount) => {
  const factor = getEmissionFactor(category);
  const numericAmount = Number(amount);

  if (factor === null) {
    throw new Error(`Unsupported carbon category: ${category}`);
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be a finite number greater than zero");
  }

  return round(numericAmount * factor, 2);
};

const getCategories = () =>
  Object.entries(EMISSION_FACTORS).map(([name, factor]) => ({
    name,
    factor,
    icon: CATEGORY_ICONS[name],
    unit: "unit",
    emissionUnit: "kg CO₂e",
  }));

module.exports = {
  EMISSION_FACTORS,
  CATEGORY_ICONS,
  getEmissionFactor,
  calculateEmission,
  getCategories,
};
