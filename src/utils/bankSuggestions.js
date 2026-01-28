// Bank suggestion heuristics based on account number prefixes
const bankSuggestionMap = {
  // Strong confidence: Mobile Money / Digital Banks
  "90": { banks: ["999992", "999991", "50515", "50211"], confidence: "high", names: ["OPay", "PalmPay", "Moniepoint", "Kuda Bank"] },
  "91": { banks: ["999992", "999991", "50515", "50211"], confidence: "high", names: ["OPay", "PalmPay", "Moniepoint", "Kuda Bank"] },
  "70": { banks: ["999992", "999991", "50515", "50211"], confidence: "high", names: ["OPay", "PalmPay", "Moniepoint", "Kuda Bank"] },
  "80": { banks: ["999992", "999991", "50515", "50211"], confidence: "high", names: ["OPay", "PalmPay", "Moniepoint", "Kuda Bank"] },
  "81": { banks: ["999992", "999991", "50515", "50211"], confidence: "high", names: ["OPay", "PalmPay", "Moniepoint", "Kuda Bank"] },

  // Medium confidence: Microfinance / Fintech
  "60": { banks: ["566", "51318", "565", "040"], confidence: "medium", names: ["VFD Microfinance", "FairMoney", "Carbon", "Access Bank"] },
  "61": { banks: ["566", "51318", "565"], confidence: "medium", names: ["VFD Microfinance", "FairMoney", "Carbon"] },

  // Weak confidence: Traditional banks (fallback)
  "01": { banks: ["044", "058"], confidence: "low", names: ["Access Bank", "Guaranty Trust Bank"] },
  "02": { banks: ["033", "057","035"], confidence: "low", names: ["United Bank For Africa", "Zenith Bank","Wema Bank"] },
  "04": { banks: ["044", "070"], confidence: "low", names: ["Access Bank", "Fidelity Bank"] },
  "06": { banks: ["044", "068","058"], confidence: "low", names: ["Access Bank", "Standard Chartered", "Guaranty Trust Bank"] },
  "08": { banks: ["058", "011"], confidence: "low", names: ["Guaranty Trust Bank", "First Bank"] },
  "10": { banks: ["033", "011", "214"], confidence: "low", names: ["United Bank For Africa", "First Bank", "FCMB"] },
  "20": { banks: ["011", "033"], confidence: "low", names: ["First Bank", "United Bank For Africa"] },
  "30": { banks: ["033", "011"], confidence: "low", names: ["United Bank For Africa", "First Bank"] },
};

// All banks reference data
const allBanksData = {
  "40195": "78 Finance Company Ltd",
  "120001": "9mobile 9Payment Service Bank",
  "404": "Abbey Mortgage Bank",
  "44": "Access Bank",
  "044": "Access Bank",
  "999992": "OPay Digital Services Limited",
  "999991": "PalmPay",
  "50515": "Moniepoint MFB",
  "50211": "Kuda Bank",
  "125": "Rubies MFB",
  "566": "VFD Microfinance Bank Limited",
  "51318": "FairMoney Microfinance Bank",
  "565": "Carbon",
  "058": "Guaranty Trust Bank",
  "057": "Zenith Bank",
  "033": "United Bank For Africa",
  "011": "First Bank of Nigeria",
  "214": "First City Monument Bank",
  "070": "Fidelity Bank",
  "068": "Standard Chartered Bank",
};

/**
 * Suggest banks based on account number prefix
 * Shows up to 4 banks if they match the category
 * @param {string} accountNumber - 10-digit NUBAN account number
 * @returns {Array} Array of suggested banks with confidence levels
 */
export const suggestBanks = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 2) {
    return [];
  }

  const prefix = accountNumber.slice(0, 2);
  const suggestion = bankSuggestionMap[prefix];

  if (suggestion) {
    // Return up to 4 banks from the matched category
    return suggestion.banks.slice(0, 4).map((code, index) => ({
      code,
      name: allBanksData[code] || suggestion.names[index] || "Unknown Bank",
      confidence: suggestion.confidence,
    }));
  }

  // Fallback: return 2 popular banks if no prefix match
  return [
    { code: "058", name: "Guaranty Trust Bank", confidence: "low" },
    { code: "033", name: "United Bank For Africa", confidence: "low" },
  ];
};

/**
 * Get confidence badge color
 * @param {string} confidence - Confidence level
 * @returns {string} CSS color class
 */
export const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case "high":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-orange-400";
    default:
      return "text-white/60";
  }
};

/**
 * Get confidence badge background
 * @param {string} confidence - Confidence level
 * @returns {string} CSS background class
 */
export const getConfidenceBg = (confidence) => {
  switch (confidence) {
    case "high":
      return "bg-green-500/10 border-green-500/20";
    case "medium":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "low":
      return "bg-orange-500/10 border-orange-500/20";
    default:
      return "bg-white/[0.06] border-white/10";
  }
};

/**
 * Batch check banks in parallel for faster verification
 * @param {string} accountNumber - 10-digit account number
 * @param {Array} banks - Array of bank codes to check
 * @param {Function} resolveFunc - walletAPI.resolvePayoutBank function
 * @returns {Promise<Array>} Array of banks that returned valid accounts
 */
export const batchCheckBanks = async (accountNumber, banks, resolveFunc) => {
  const BATCH_SIZE = 5; // Increased batch size for parallel checks
  const accepted = [];

  for (let i = 0; i < banks.length; i += BATCH_SIZE) {
    const batch = banks.slice(i, i + BATCH_SIZE);
    
    // Check all banks in batch in parallel
    const checks = await Promise.allSettled(
      batch.map((code) => resolveFunc(accountNumber, code))
    );

    checks.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        const data = res.value;
        const accountName =
          data?.accountName ||
          data?.account_name ||
          data?.name ||
          data?.data?.accountName ||
          data?.data?.account_name;

        if (accountName) {
          accepted.push({
            code: batch[idx],
            name: allBanksData[batch[idx]] || "Unknown Bank",
            verified: true,
          });
        }
      }
    });

    // If we found matches, return them immediately
    if (accepted.length > 0) {
      return accepted;
    }
  }

  return accepted;
};
