function parseScenario(prompt) {
  const p = (prompt || "").toLowerCase();
  
  // 1. Amount extraction
  let extractedAmount = null;

  // Patterns: "1.5 lakh", "2 lakh"
  const lakhMatch = p.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)/i);
  if (lakhMatch) {
    extractedAmount = parseFloat(lakhMatch[1]) * 100000;
  }

  // Patterns: "15k", "25 k"
  if (!extractedAmount) {
    const kMatch = p.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      extractedAmount = parseFloat(kMatch[1]) * 1000;
    }
  }

  // Patterns: "₹15,000", "rs 15000", "15000 inr", "costing 15000", "spend 15000"
  if (!extractedAmount) {
    const directMatch = p.match(/(?:₹|rs\.?|inr|cost(?:ing)?|spend(?:ing)?|worth)\s*[:=]?\s*(\d[\d,]*(?:\.\d+)?)/i);
    if (directMatch) {
      const cleaned = directMatch[1].replace(/,/g, "");
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) {
        extractedAmount = val;
      }
    }
  }

  // Also check for "for <amount>" like "for 20000" but NOT "for 5 days"
  if (!extractedAmount) {
    const forMatch = p.match(/\bfor\s+(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)(?!\s*(?:days?|hours?|hrs?|weeks?|months?|years?|am|pm))/i);
    if (forMatch) {
      const cleaned = forMatch[1].replace(/,/g, "");
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val >= 50) {
        extractedAmount = val;
      }
    }
  }

  // Fallback: any standalone number >= 100 that is not followed by 'day', 'days', 'month', 'year', 'hr', 'hours'
  if (!extractedAmount) {
    const genericNumberMatches = p.matchAll(/\b(\d[\d,]+)\b/g);
    for (const match of genericNumberMatches) {
      const idx = match.index;
      const followingText = p.slice(idx + match[0].length).trim();
      if (!followingText.match(/^(?:days?|hours?|hrs?|months?|years?|am|pm|weeks?)/i)) {
        const val = parseFloat(match[1].replace(/,/g, ""));
        if (!isNaN(val) && val >= 50) {
          extractedAmount = val;
          break;
        }
      }
    }
  }

  // Activity / Category extraction
  let category = "Discretionary";
  let defaultEst = 0;
  let activity = "Planned Expense";

  if (p.includes("trip") || p.includes("tour") || p.includes("goa") || p.includes("vacation") || p.includes("flight") || p.includes("travel")) {
    category = "travel";
    activity = "Vacation / Travel";
    // Check if days are mentioned: "for 5 days"
    const daysMatch = p.match(/(\d+)\s*days?/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 3;
    defaultEst = days * 3000; // ~₹3000/day typical travel rate
  } else if (p.includes("iphone") || p.includes("phone") || p.includes("laptop") || p.includes("macbook") || p.includes("ipad")) {
    category = "shopping";
    activity = "Electronics / Device";
    defaultEst = p.includes("laptop") || p.includes("macbook") ? 55000 : 45000;
  } else if (p.includes("shopping") || p.includes("clothes") || p.includes("dress") || p.includes("watch")) {
    category = "shopping";
    activity = "Shopping";
    defaultEst = 5000;
  } else if (p.includes("party") || p.includes("dinner") || p.includes("club") || p.includes("drinks") || p.includes("restaurant")) {
    category = "food";
    activity = "Dining / Party";
    defaultEst = 3500;
  } else if (p.includes("hospital") || p.includes("medical") || p.includes("surgery") || p.includes("doctor")) {
    category = "healthcare";
    activity = "Medical Expense";
    defaultEst = 8000;
  }

  const finalAmount = extractedAmount !== null ? extractedAmount : (defaultEst > 0 ? defaultEst : 0);
  const isEstimated = extractedAmount === null && defaultEst > 0;

  // Timeframe: this month vs next month
  let targetMonthOffset = 0; // 0 = current month, 1 = next month
  if (p.includes("next month") || p.includes("following month") || p.includes("upcoming month")) {
    targetMonthOffset = 1;
  }

  return {
    activity,
    category,
    amount: finalAmount,
    isEstimated,
    hasScenario: finalAmount > 0,
    targetMonthOffset
  };
}

// Test various inputs
const testPrompts = [
  'If I go on a trip to Goa for 5 days, how will it affect my budget this month?',
  'What if I buy a laptop for 65000 next month?',
  'Can I afford a trip of ₹25,000?',
  'If I spend 15k on shopping this weekend',
  'What if I buy a car with down payment of 1.5 lakh',
  'How does my recent spending affect my budget?' // general query
];

console.log("Scenario Parser Test Results:");
for (const tp of testPrompts) {
  console.log(`\nInput: "${tp}"`);
  console.log("Parsed:", JSON.stringify(parseScenario(tp), null, 2));
}
