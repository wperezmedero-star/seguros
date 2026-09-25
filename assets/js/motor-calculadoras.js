/**
 * Calculadoras educativas para una web de seguros en Florida.
 * No cotizan, recomiendan, suscriben ni garantizan productos.
 * Moneda: USD. Tasas: decimales (4% = 0.04).
 */

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.InsuranceCalculators = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DISCLAIMER =
    "Resultado educativo basado en los datos ingresados. No es una cotización, " +
    "oferta, recomendación, promesa de cobertura ni garantía de rendimiento o ingreso. " +
    "Los productos, costos, impuestos, beneficios y elegibilidad dependen de la aseguradora, " +
    "el contrato y la situación individual.";

  function number(value, name, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    const parsed = typeof value === "string" ? Number(value.replace(/[$,\s]/g, "")) : Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      throw new RangeError(`${name} debe ser un número entre ${min} y ${max}.`);
    }
    return parsed;
  }

  function money(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function rate(value, name, max = 1) {
    return number(value, name, { min: 0, max });
  }

  function futureValuePrincipal(principal, monthlyRate, months) {
    return monthlyRate === 0 ? principal : principal * Math.pow(1 + monthlyRate, months);
  }

  function futureValueContributions(payment, monthlyRate, months) {
    if (months === 0) return 0;
    return monthlyRate === 0
      ? payment * months
      : payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  /**
   * Heurística ampliada de necesidad de seguro de vida.
   * Evite duplicar la hipoteca dentro de otherDebts.
   */
  function lifeInsuranceNeed(input = {}) {
    const annualIncome = number(input.annualIncome ?? 0, "annualIncome");
    const replacementYears = number(input.replacementYears ?? 10, "replacementYears", { min: 0, max: 50 });
    const mortgageBalance = number(input.mortgageBalance ?? 0, "mortgageBalance");
    const otherDebts = number(input.otherDebts ?? 0, "otherDebts");
    const educationGoal = number(input.educationGoal ?? 0, "educationGoal");
    const finalExpenses = number(input.finalExpenses ?? 0, "finalExpenses");
    const otherGoals = number(input.otherGoals ?? 0, "otherGoals");
    const existingCoverage = number(input.existingCoverage ?? 0, "existingCoverage");
    const liquidAssets = number(input.liquidAssets ?? 0, "liquidAssets");

    const incomeReplacement = annualIncome * replacementYears;
    const grossNeed =
      incomeReplacement + mortgageBalance + otherDebts + educationGoal + finalExpenses + otherGoals;
    const availableResources = existingCoverage + liquidAssets;
    const estimatedGap = Math.max(0, grossNeed - availableResources);

    return {
      calculator: "life-insurance-need",
      inputs: {
        annualIncome,
        replacementYears,
        mortgageBalance,
        otherDebts,
        educationGoal,
        finalExpenses,
        otherGoals,
        existingCoverage,
        liquidAssets
      },
      breakdown: {
        incomeReplacement: money(incomeReplacement),
        obligationsAndGoals: money(grossNeed - incomeReplacement),
        grossNeed: money(grossNeed),
        availableResources: money(availableResources)
      },
      estimatedNeed: money(estimatedGap),
      explanation:
        estimatedGap === 0
          ? "Según estos datos, los recursos indicados cubren la necesidad estimada. Conviene revisar beneficiarios, duración y liquidez con un agente autorizado."
          : `La necesidad de protección estimada es ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(estimatedGap)} después de restar la cobertura existente y los activos líquidos declarados.`,
      disclaimer: DISCLAIMER
    };
  }

  /**
   * Proyección de acumulación y retiro. La regla del 4% es una hipótesis editable,
   * no un ingreso garantizado. straightLineMonthly tampoco es una cotización de anualidad.
   */
  function retirementProjection(input = {}) {
    const currentAge = number(input.currentAge, "currentAge", { min: 18, max: 100 });
    const retirementAge = number(input.retirementAge, "retirementAge", { min: currentAge, max: 100 });
    const currentSavings = number(input.currentSavings ?? 0, "currentSavings");
    const monthlyContribution = number(input.monthlyContribution ?? 0, "monthlyContribution");
    const annualReturn = rate(input.annualReturn ?? 0.05, "annualReturn", 0.25);
    const annualInflation = rate(input.annualInflation ?? 0.025, "annualInflation", 0.15);
    const withdrawalRate = rate(input.withdrawalRate ?? 0.04, "withdrawalRate", 0.15);
    const planningAge = number(input.planningAge ?? 90, "planningAge", { min: retirementAge + 1, max: 120 });

    const yearsToRetirement = retirementAge - currentAge;
    const months = Math.round(yearsToRetirement * 12);
    const monthlyRate = annualReturn / 12;
    const projectedSavings =
      futureValuePrincipal(currentSavings, monthlyRate, months) +
      futureValueContributions(monthlyContribution, monthlyRate, months);
    const annualPlanningIncome = projectedSavings * withdrawalRate;
    const monthlyPlanningIncome = annualPlanningIncome / 12;
    const inflationFactor = Math.pow(1 + annualInflation, yearsToRetirement);
    const annualIncomeTodayDollars = inflationFactor === 0 ? annualPlanningIncome : annualPlanningIncome / inflationFactor;
    const retirementYears = planningAge - retirementAge;
    const straightLineMonthly = retirementYears > 0 ? projectedSavings / (retirementYears * 12) : 0;

    return {
      calculator: "retirement-projection",
      inputs: {
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        annualReturn,
        annualInflation,
        withdrawalRate,
        planningAge
      },
      results: {
        yearsToRetirement,
        projectedSavings: money(projectedSavings),
        annualPlanningIncome: money(annualPlanningIncome),
        monthlyPlanningIncome: money(monthlyPlanningIncome),
        annualIncomeTodayDollars: money(annualIncomeTodayDollars),
        straightLineMonthlyNoGrowth: money(straightLineMonthly)
      },
      explanation:
        "La proyección capitaliza el ahorro actual y las aportaciones mensuales. El ingreso de planificación aplica la tasa de retiro elegida. La cifra lineal solo divide el saldo entre los años previstos y supone 0% de rendimiento durante el retiro.",
      disclaimer:
        DISCLAIMER +
        " Una anualidad real requiere ilustración o cotización de una aseguradora; sus garantías dependen de los términos del contrato y de la capacidad de pago de la compañía emisora."
    };
  }

  /**
   * Estima costo anual de salud con datos del plan, no con tablas inventadas por edad.
   * expectedAllowedCharges son cargos cubiertos/permitidos estimados dentro de la red.
   */
  function annualHealthCost(input = {}) {
    const monthlyPremium = number(input.monthlyPremium ?? 0, "monthlyPremium");
    const expectedAllowedCharges = number(input.expectedAllowedCharges ?? 0, "expectedAllowedCharges");
    const deductible = number(input.deductible ?? 0, "deductible");
    const coinsuranceRate = rate(input.coinsuranceRate ?? 0, "coinsuranceRate");
    const annualCopays = number(input.annualCopays ?? 0, "annualCopays");
    const outOfPocketMaximum = number(
      input.outOfPocketMaximum ?? Number.MAX_SAFE_INTEGER,
      "outOfPocketMaximum"
    );
    const nonCoveredCosts = number(input.nonCoveredCosts ?? 0, "nonCoveredCosts");
    const outOfNetworkCosts = number(input.outOfNetworkCosts ?? 0, "outOfNetworkCosts");

    const premiumAnnual = monthlyPremium * 12;
    const deductiblePaid = Math.min(expectedAllowedCharges, deductible);
    const remainingAfterDeductible = Math.max(0, expectedAllowedCharges - deductiblePaid);
    const coinsurancePaid = remainingAfterDeductible * coinsuranceRate;
    const coveredCostBeforeCap = deductiblePaid + coinsurancePaid + annualCopays;
    const coveredOutOfPocket = Math.min(coveredCostBeforeCap, outOfPocketMaximum);
    const totalEstimatedCost =
      premiumAnnual + coveredOutOfPocket + nonCoveredCosts + outOfNetworkCosts;
    const highUseScenario =
      premiumAnnual + outOfPocketMaximum + nonCoveredCosts + outOfNetworkCosts;

    return {
      calculator: "annual-health-cost",
      inputs: {
        monthlyPremium,
        expectedAllowedCharges,
        deductible,
        coinsuranceRate,
        annualCopays,
        outOfPocketMaximum,
        nonCoveredCosts,
        outOfNetworkCosts
      },
      results: {
        annualPremium: money(premiumAnnual),
        estimatedCoveredOutOfPocket: money(coveredOutOfPocket),
        estimatedTotalAnnualCost: money(totalEstimatedCost),
        highUseScenario: money(highUseScenario)
      },
      explanation:
        "El estimado suma prima anual y participación aproximada del asegurado. Los gastos no cubiertos o fuera de la red se muestran aparte porque pueden no contar para el máximo de bolsillo.",
      disclaimer:
        DISCLAIMER +
        " La forma en que deducibles, copagos, coaseguro y máximo de bolsillo se aplican depende del resumen de beneficios, la red y las reglas del plan."
    };
  }

  /**
   * Proyecta costos universitarios y aportación mensual necesaria.
   * Conservador: acumula todo antes de comenzar la universidad.
   */
  function collegeSavings(input = {}) {
    const currentAnnualCost = number(input.currentAnnualCost, "currentAnnualCost");
    const yearsUntilCollege = number(input.yearsUntilCollege, "yearsUntilCollege", { min: 0, max: 40 });
    const yearsInCollege = number(input.yearsInCollege ?? 4, "yearsInCollege", { min: 1, max: 10 });
    const collegeInflation = rate(input.collegeInflation ?? 0.04, "collegeInflation", 0.2);
    const currentSavings = number(input.currentSavings ?? 0, "currentSavings");
    const annualReturn = rate(input.annualReturn ?? 0.05, "annualReturn", 0.25);

    const annualCosts = [];
    let totalProjectedCost = 0;
    for (let year = 0; year < yearsInCollege; year += 1) {
      const projected = currentAnnualCost * Math.pow(1 + collegeInflation, yearsUntilCollege + year);
      annualCosts.push(money(projected));
      totalProjectedCost += projected;
    }

    const months = Math.round(yearsUntilCollege * 12);
    const monthlyRate = annualReturn / 12;
    const projectedCurrentSavings = futureValuePrincipal(currentSavings, monthlyRate, months);
    const fundingGap = Math.max(0, totalProjectedCost - projectedCurrentSavings);
    let requiredMonthlyContribution = 0;
    if (fundingGap > 0 && months > 0) {
      requiredMonthlyContribution =
        monthlyRate === 0
          ? fundingGap / months
          : fundingGap * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    } else if (fundingGap > 0 && months === 0) {
      requiredMonthlyContribution = fundingGap;
    }

    return {
      calculator: "college-savings",
      inputs: {
        currentAnnualCost,
        yearsUntilCollege,
        yearsInCollege,
        collegeInflation,
        currentSavings,
        annualReturn
      },
      results: {
        projectedCostByAcademicYear: annualCosts,
        totalProjectedCost: money(totalProjectedCost),
        projectedCurrentSavings: money(projectedCurrentSavings),
        fundingGap: money(fundingGap),
        requiredMonthlyContribution: money(requiredMonthlyContribution)
      },
      explanation:
        "Los costos actuales se proyectan con la inflación universitaria elegida. El ahorro existente crece según la tasa supuesta y la aportación mensual estimada busca cubrir la diferencia antes del inicio de los estudios.",
      disclaimer:
        DISCLAIMER +
        " No incluye impuestos, comisiones, ayuda financiera, becas ni cambios de matrícula. Revise las reglas actuales de cualquier plan 529 antes de invertir."
    };
  }

  return Object.freeze({
    DISCLAIMER,
    lifeInsuranceNeed,
    retirementProjection,
    annualHealthCost,
    collegeSavings
  });
});
