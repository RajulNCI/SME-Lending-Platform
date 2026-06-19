// apps/api/app/services/ai/rulesEngineMock.js
function getMockRulesResult(extractedData, pdScore) {
  var dscr = (extractedData.dscr !== undefined && extractedData.dscr !== null)
    ? extractedData.dscr
    : 1.2;

  dscr = Number(dscr);
  if (isNaN(dscr)) {
    console.warn('dscr is not a number; falling back to 1.2');
    dscr = 1.2;
  }

  var loanAmount = (extractedData.loanAmount !== undefined && extractedData.loanAmount !== null)
    ? extractedData.loanAmount
    : 0;

  var riskGrade = pdScore < 0.05 ? 'A' : pdScore < 0.15 ? 'B' : pdScore < 0.3 ? 'C' : 'D';
  var recommendedStatus = (pdScore < 0.2 && dscr >= 1.1) ? 'APPROVED' : pdScore < 0.4 ? 'REFERRED' : 'DECLINED';

  return {
    riskGrade: riskGrade,
    dscr: dscr,
    lgd: 0.45,
    ead: loanAmount,
    apr: 7.5,
    eclStage: pdScore < 0.1 ? 1 : pdScore < 0.3 ? 2 : 3,
    ecl12m: loanAmount * pdScore * 0.45,
    eclLifetime: loanAmount * pdScore * 0.45 * 1.8,
    recommendedStatus: recommendedStatus,
    discrepancy: false,
    fairnessMetrics: { disparateImpact: 0.92, equalOpportunity: 0.88 },
    _mock: true, // flag so dashboard can show "MOCK" badge if useful
  };
}

module.exports = { getMockRulesResult };