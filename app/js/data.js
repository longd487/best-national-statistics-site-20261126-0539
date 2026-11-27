// StatAtlas USA — all figures are published official statistics.
// Sources are listed in methods.html and README.md. Values are reproduced
// exactly as published (vintages noted per series); no figure is estimated
// or interpolated by this site.
window.STAT_DATA = {
  meta: {
    country: "United States",
    updated: "26 November 2026",
    currency: "US dollars"
  },

  // Nominal GDP, current US$, billions. BEA NIPA Table 1.1.5,
  // 2026 annual-update vintage. 2016-2020 as published by the World Bank
  // World Development Indicators (same underlying BEA series).
  gdpNominal: [
    { year: 2015, value: 18295.0 }, { year: 2016, value: 18804.9 },
    { year: 2017, value: 19612.1 }, { year: 2018, value: 20656.5 },
    { year: 2019, value: 21540.0 }, { year: 2020, value: 21354.1 },
    { year: 2021, value: 23745.8 }, { year: 2022, value: 26059.7 },
    { year: 2023, value: 27825.9 }, { year: 2024, value: 29381.0 },
    { year: 2025, value: 30861.3 }
  ],

  // Real GDP growth, percent change from preceding year. BEA NIPA Table 1.1.1.
  gdpRealGrowth: [
    { year: 2015, value: 2.9 }, { year: 2016, value: 1.7 },
    { year: 2017, value: 2.5 }, { year: 2018, value: 3.0 },
    { year: 2019, value: 2.6 }, { year: 2020, value: -2.2 },
    { year: 2021, value: 6.3 }, { year: 2022, value: 2.4 },
    { year: 2023, value: 2.9 }, { year: 2024, value: 3.0 },
    { year: 2025, value: 2.3 }
  ],

  // Value added by sector, percent of GDP, 2021. World Bank WDI.
  gdpComposition2021: [
    { sector: "Services", value: 76.3 },
    { sector: "Industry", value: 17.6 },
    { sector: "Agriculture, forestry and fishing", value: 0.9 },
    { sector: "Net taxes on products", value: 5.2 }
  ],

  // Resident population, July 1 estimates, millions.
  // U.S. Census Bureau, Vintage 2025 population estimates.
  population: [
    { year: 2020, value: 331.58 }, { year: 2021, value: 332.10 },
    { year: 2022, value: 334.00 }, { year: 2023, value: 336.76 },
    { year: 2024, value: 340.00 }, { year: 2025, value: 341.78 }
  ],
  populationGrowth: [
    { year: 2021, value: 0.16 }, { year: 2022, value: 0.57 },
    { year: 2023, value: 0.83 }, { year: 2024, value: 0.96 },
    { year: 2025, value: 0.52 }
  ],

  // Largest states, July 1 2024 resident population, millions.
  // U.S. Census Bureau, Vintage 2024 estimates (rounded to 2 decimals).
  states: [
    { state: "California", pop: 39.43, capital: "Sacramento" },
    { state: "Texas", pop: 31.29, capital: "Austin" },
    { state: "Florida", pop: 23.37, capital: "Tallahassee" },
    { state: "New York", pop: 19.87, capital: "Albany" },
    { state: "Pennsylvania", pop: 13.08, capital: "Harrisburg" },
    { state: "Illinois", pop: 12.71, capital: "Springfield" },
    { state: "Ohio", pop: 11.88, capital: "Columbus" },
    { state: "Georgia", pop: 11.18, capital: "Atlanta" },
    { state: "North Carolina", pop: 11.05, capital: "Raleigh" },
    { state: "Michigan", pop: 10.14, capital: "Lansing" }
  ],

  // Unemployment rate, annual average, percent. BLS, Local Area
  // Unemployment Statistics / Current Population Survey.
  unemployment: [
    { year: 2015, value: 5.3 }, { year: 2016, value: 4.9 },
    { year: 2017, value: 4.4 }, { year: 2018, value: 3.9 },
    { year: 2019, value: 3.7 }, { year: 2020, value: 8.1 },
    { year: 2021, value: 5.4 }, { year: 2022, value: 3.6 },
    { year: 2023, value: 3.6 }, { year: 2024, value: 4.0 }
  ],

  // Labour force participation rate, percent of population age 16+.
  // BLS Current Population Survey, annual averages.
  participation: [
    { year: 2019, value: 63.1 }, { year: 2020, value: 61.4 },
    { year: 2021, value: 61.7 }, { year: 2022, value: 62.2 },
    { year: 2023, value: 62.6 }, { year: 2024, value: 62.5 }
  ],

  // Consumer Price Index, all items, 12-month average percent change.
  // BLS CPI, annual averages. Core = all items less food and energy.
  cpiHeadline: [
    { year: 2015, value: 0.1 }, { year: 2016, value: 1.3 },
    { year: 2017, value: 2.1 }, { year: 2018, value: 2.4 },
    { year: 2019, value: 1.8 }, { year: 2020, value: 1.2 },
    { year: 2021, value: 4.7 }, { year: 2022, value: 8.0 },
    { year: 2023, value: 4.1 }, { year: 2024, value: 2.9 }
  ],
  cpiCore: [
    { year: 2015, value: 1.8 }, { year: 2016, value: 2.2 },
    { year: 2017, value: 1.8 }, { year: 2018, value: 2.1 },
    { year: 2019, value: 2.2 }, { year: 2020, value: 1.7 },
    { year: 2021, value: 3.6 }, { year: 2022, value: 6.2 },
    { year: 2023, value: 4.8 }, { year: 2024, value: 3.4 }
  ],

  // International trade in goods and services, balance of payments basis,
  // billions of dollars. BEA / U.S. Census Bureau, FT-900 (Feb 5, 2025).
  tradeBalance: [
    { year: 2019, value: -576.9 }, { year: 2020, value: -676.7 },
    { year: 2021, value: -845.0 }, { year: 2022, value: -944.8 },
    { year: 2023, value: -784.9 }, { year: 2024, value: -918.4 }
  ],
  trade2024: {
    exports: 3191.6, imports: 4110.0, balance: -918.4,
    goodsBalance: -1211.7, servicesBalance: 293.3,
    goodsExports: 2083.8, goodsImports: 3295.6,
    servicesExports: 1107.4, servicesImports: 814.4,
    balancePctGdp: 3.1, chinaGoodsDeficit: 295.0
  },

  // Society, latest available year. Sources per indicator.
  society: {
    lifeExpectancy: { value: 78.4, year: 2023, source: "NCHS, National Vital Statistics System" },
    povertyRate: { value: 10.2, year: "2020–2024", source: "U.S. Census Bureau, American Community Survey 5-year estimates (QuickFacts)" },
    homeownership: { value: 65.2, year: "2020–2024", source: "U.S. Census Bureau, American Community Survey 5-year estimates (QuickFacts)" },
    medianHouseholdIncome: { value: 83730, year: 2024, source: "U.S. Census Bureau, CPS ASEC, Current Population Reports P60-286 (2024 dollars)" },
    medianHouseholdIncome2023: { value: 82690, year: 2023, source: "U.S. Census Bureau, CPS ASEC (2024 dollars)" },
    internetUsers: { value: 94.7, year: 2024, source: "World Bank, World Development Indicators" },
    meanSchooling: { value: 13.9, year: 2023, source: "UNDP Human Development Report" },
    gdpPerCapita: { value: 85809, year: 2024, source: "World Bank, World Development Indicators" },
    federalDebtGross: { value: 36.2, year: "Dec 2024", unit: "trillion", source: "U.S. Department of the Treasury, Fiscal Data" }
  }
};
