/**
 * PORTAL DO ISS FIXO & SIMULADOR TRIBUTÁRIO (2026)
 * Lógica tributária revisada com base em:
 *   - Decreto-Lei federal nº 406/1968, art. 9º, §§ 1º e 3º;
 *   - Lei Complementar federal nº 123/2006, art. 18, § 5º-B, XIV, e § 22-A;
 *   - STF Tema 918 (RE 940.769) e STJ Tema 1323;
 *   - Fortaleza: LC nº 159/2013, arts. 245, 249 e 250, e Decreto nº 13.716/2015 (Regulamento do CTM), arts. 667, 676 a 678;
 *   - Canindé: Lei Complementar nº 2.384/2017 (CTM), arts. 245, 246, 249, 250, 251 e 252.
 *
 * IMPORTANTE: em Fortaleza e em Canindé a cota mensal do ISS fixo é fixada em REAIS
 * (não em UFM), em 5 faixas conforme o número de profissionais habilitados:
 *   até 5 = R$ 140 | 6 a 10 = R$ 160 | 11 a 15 = R$ 180 | 16 a 20 = R$ 200 | mais de 20 = R$ 220.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taxForm');
  const btnReset = document.getElementById('btnReset');
  const inputFaturamento = document.getElementById('faturamento');

  const resultBox = document.getElementById('resultBox');
  const resultBadge = document.getElementById('resultBadge');
  const resultTitle = document.getElementById('resultTitle');
  const resultSummary = document.getElementById('resultSummary');
  const parecerContent = document.getElementById('parecerContent');

  const financialSection = document.getElementById('financialSection');
  const valIssVariavel = document.getElementById('valIssVariavel');
  const descIssVariavel = document.getElementById('descIssVariavel');
  const valIssFixo = document.getElementById('valIssFixo');
  const descIssFixo = document.getElementById('descIssFixo');
  const valEconomiaMensal = document.getElementById('valEconomiaMensal');
  const valEconomiaAnual = document.getElementById('valEconomiaAnual');
  const percentReducao = document.getElementById('percentReducao');
  const progressFill = document.getElementById('progressFill');
  const cardEconomia = document.getElementById('cardEconomia');
  const labelEconomia = document.getElementById('labelEconomia');
  const equilibriumNote = document.getElementById('equilibriumNote');

  const actionPlanSection = document.getElementById('actionPlanSection');
  const actionPlanTitle = document.getElementById('actionPlanTitle');
  const actionPlanContent = document.getElementById('actionPlanContent');

  const selectMunicipio = document.getElementById('municipio');
  const selectAtividade = document.getElementById('atividade');
  const selectAliquota = document.getElementById('aliquotaIss');

  // ---------------------------------------------------------------------------
  // PARÂMETROS LEGAIS
  // ---------------------------------------------------------------------------

  // Faixas da cota mensal por profissional habilitado.
  // Fonte: art. 250 da LC 159/2013 (Fortaleza) e art. 250 da LC 2.384/2017 (Canindé).
  const FAIXAS_COTA = [
    { max: 5, valor: 140.00, descricao: 'até 5 profissionais' },
    { max: 10, valor: 160.00, descricao: 'de 6 a 10 profissionais' },
    { max: 15, valor: 180.00, descricao: 'de 11 a 15 profissionais' },
    { max: 20, valor: 200.00, descricao: 'de 16 a 20 profissionais' },
    { max: Infinity, valor: 220.00, descricao: 'mais de 20 profissionais' }
  ];

  function faixaDaCota(total) {
    return FAIXAS_COTA.find(f => total <= f.max) || FAIXAS_COTA[FAIXAS_COTA.length - 1];
  }

  // Rol taxativo de subitens do regime uniprofissional. É idêntico nos dois municípios:
  // Fortaleza (art. 676, § 1º, I, do Dec. 13.716/2015 / art. 249, § 1º, I, da LC 159/2013)
  // Canindé   (art. 249, § 1º, I, da LC 2.384/2017).
  const ROL_UNIPROFISSIONAL = [
    '4.01', '4.02', '4.06', '4.08', '4.09', '4.11', '4.12', '4.13', '4.14', '4.16',
    '5.01', '5.03',
    '7.01',  // exceto agronomia, agrimensura, geologia e congêneres
    '7.11',  // exceto jardinagem, corte e poda de árvores (subsiste a parte de decoração)
    '10.03',
    '17.13', '17.15', '17.18',
    '17.19'  // quando realizada por economistas
  ];

  // Alíquota do regime variável (comparativo) por município e subitem.
  function aliquotaLegal(municipio, atividade) {
    if (municipio === 'fortaleza') {
      // Art. 667 do Decreto 13.716/2015: 2% (8.1, 11.2, 11.3, 16.1, 16.2);
      // 3% (itens 4 e 5 e subitens 7.2, 7.4, 7.5 e 13.4); 5% nos demais.
      if (/^4\./.test(atividade) || /^5\./.test(atividade)) return 0.03;
      return 0.05;
    }
    // Canindé - art. 245 da LC 2.384/2017: 2% (7.02, 7.05, 9.03, 27.01);
    // 3% (7.01, 7.03, 7.04, 7.19, 7.20, 7.21, 8.01, 8.02);
    // 4% (itens 4 e 5); 5% nos demais.
    if (atividade === '7.01') return 0.03;
    if (/^4\./.test(atividade) || /^5\./.test(atividade)) return 0.04;
    return 0.05;
  }

  // Pré-seleciona a alíquota legal do subitem assim que município e atividade são escolhidos.
  // O usuário ainda pode alterá-la manualmente.
  function atualizarAliquotaSugerida() {
    const municipio = selectMunicipio.value;
    const atividade = selectAtividade.value;
    if (!municipio || !atividade || atividade === 'outros') return;

    const aliquota = aliquotaLegal(municipio, atividade).toFixed(2);
    if (!Array.from(selectAliquota.options).some(o => o.value === aliquota)) {
      const opt = document.createElement('option');
      opt.value = aliquota;
      opt.textContent = `${(parseFloat(aliquota) * 100).toFixed(1).replace('.', ',')}% (alíquota legal do subitem)`;
      selectAliquota.appendChild(opt);
    }
    selectAliquota.value = aliquota;
  }

  selectMunicipio.addEventListener('change', atualizarAliquotaSugerida);
  selectAtividade.addEventListener('change', atualizarAliquotaSugerida);

  // Máscara amigável de moeda brasileira para o faturamento
  inputFaturamento.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      e.target.value = '';
      return;
    }
    const floatVal = (parseFloat(value) / 100).toFixed(2);
    e.target.value = formatCurrencyNumber(floatVal);
  });

  // Função para formatar número para padrão R$ 1.234,56
  function formatCurrencyNumber(val) {
    const parts = val.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  }

  // Conversão de string formatada para float
  function parseCurrency(str) {
    if (!str) return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }

  // Formatador de exibição BRL
  function formatBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatPct(fracao) {
    return `${(fracao * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }

  // Limpeza de erros visuais em linha
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  // Definição de erro em campo específico
  function setFieldError(fieldId, errorMsg) {
    const field = document.getElementById(fieldId);
    const errContainer = document.getElementById(`err-${fieldId}`);
    if (field) field.classList.add('input-error');
    if (errContainer) errContainer.textContent = errorMsg;
  }

  // Reset do formulário
  btnReset.addEventListener('click', () => {
    form.reset();
    clearErrors();
    resultBox.style.display = 'none';
    resultBox.className = 'result-box';
    window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
  });

  // Submissão e Análise
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const municipio = document.getElementById('municipio').value;
    const regime = document.getElementById('regime').value;
    const atividade = document.getElementById('atividade').value;
    const socios = document.getElementById('socios').value;
    const prestacao = document.getElementById('prestacao').value;
    const numSocios = parseInt(document.getElementById('numSocios').value, 10);
    const numEmpregados = parseInt(document.getElementById('numEmpregados').value || '0', 10);
    const faturamento = parseCurrency(inputFaturamento.value);
    const aliquotaIss = parseFloat(document.getElementById('aliquotaIss').value);

    // Validação estrita sem alert()
    let hasError = false;
    let firstErrorField = null;

    if (!municipio) {
      setFieldError('municipio', 'Selecione o município do estabelecimento prestador.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'municipio';
    }
    if (!regime) {
      setFieldError('regime', 'Informe o regime tributário federal da pessoa jurídica.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'regime';
    }
    if (!atividade) {
      setFieldError('atividade', 'Selecione a atividade profissional correspondente.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'atividade';
    }
    if (!socios) {
      setFieldError('socios', 'Informe a composição do quadro de sócios.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'socios';
    }
    if (!prestacao) {
      setFieldError('prestacao', 'Indique como os serviços são executados.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'prestacao';
    }
    if (isNaN(numSocios) || numSocios < 1) {
      setFieldError('numSocios', 'Informe ao menos 1 sócio habilitado.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'numSocios';
    }
    if (isNaN(numEmpregados) || numEmpregados < 0) {
      setFieldError('numEmpregados', 'O número de empregados habilitados não pode ser negativo.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'numEmpregados';
    }
    if (isNaN(faturamento) || faturamento <= 0) {
      setFieldError('faturamento', 'Informe um faturamento mensal válido em reais.');
      hasError = true;
      if (!firstErrorField) firstErrorField = 'faturamento';
    }

    if (hasError) {
      const el = document.getElementById(firstErrorField);
      if (el) el.focus();
      return;
    }

    // Processamento da análise tributária
    processarDiagnostico({
      municipio,
      regime,
      atividade,
      socios,
      prestacao,
      numSocios,
      numEmpregados,
      faturamento,
      aliquotaIss
    });
  });

  function processarDiagnostico(dados) {
    const nomeMun = dados.municipio === 'fortaleza' ? 'Fortaleza - CE' : 'Canindé - CE';

    // Total de profissionais computados para a cota (DL 406/68, art. 9º, § 3º).
    const totalProfissionais = dados.numSocios + dados.numEmpregados;

    // Cota mensal por profissional, conforme a faixa de porte (igual nos dois municípios).
    const faixa = faixaDaCota(totalProfissionais);
    const cotaMensalUnit = faixa.valor;

    // Cálculos financeiros (o comparativo é sempre com a alíquota informada).
    const issVariavelMensal = dados.faturamento * dados.aliquotaIss;
    const issFixoMensal = totalProfissionais * cotaMensalUnit;
    const diferenca = issVariavelMensal - issFixoMensal; // positiva = economia com o fixo
    const economiaMensal = Math.max(0, diferenca);
    const economiaAnual = economiaMensal * 12;
    const aumentoMensal = Math.max(0, -diferenca);
    const percentRed = issVariavelMensal > 0 ? (diferenca / issVariavelMensal) * 100 : 0;
    const pontoEquilibrio = dados.aliquotaIss > 0 ? issFixoMensal / dados.aliquotaIss : 0;

    const calc = {
      totalProfissionais,
      cotaMensalUnit,
      faixaCota: faixa.descricao,
      issVariavelMensal,
      issFixoMensal,
      diferenca,
      economiaMensal,
      economiaAnual,
      aumentoMensal,
      percentRed,
      pontoEquilibrio
    };

    // Inicialização do estado
    resultBox.style.display = 'block';
    resultBox.className = 'result-box';

    // -------------------------------------------------------------------------
    // TESTE DE IMPEDIMENTOS LEGAIS (ORDEM DE PRECEDÊNCIA)
    // -------------------------------------------------------------------------

    // 1. Sócio Pessoa Jurídica
    if (dados.socios === 'pj') {
      renderInapto({
        titulo: 'Inapto: Presença de Pessoa Jurídica no Quadro Societário',
        resumo: `A legislação de ${nomeMun} e o Decreto-Lei nº 406/1968 vedam o recolhimento fixo a sociedades que contem com sócio pessoa jurídica.`,
        motivos: [
          'O art. 9º, § 3º do DL nº 406/1968 exige que os serviços sejam prestados sob a responsabilidade pessoal dos profissionais pessoas físicas.',
          'Pessoas jurídicas (ex: holdings ou empresas de investimento) não possuem inscrição em conselho de classe e não podem responder técnica e eticamente por atos privativos de profissionais liberais.',
          `Fundamento expresso: ${dados.municipio === 'fortaleza' ? 'art. 249, § 1º, III, da LC 159/2013 e art. 676, § 1º, III, do Decreto 13.716/2015' : 'art. 249, § 1º, III, da LC 2.384/2017'}, que veda pessoa jurídica como sócia.`
        ],
        saneamento: 'Para se enquadrar, a sociedade deve promover alteração contratual para retirar o sócio pessoa jurídica, mantendo exclusivamente pessoas naturais devidamente diplomadas e registradas no conselho respectivo.'
      });
      return;
    }

    // 2. Sócio apenas investidor ou dirigente
    if (dados.socios === 'investidor') {
      renderInapto({
        titulo: 'Inapto: Sócio Investidor ou Dirigente sem Atuação Pessoal',
        resumo: 'O sócio que não presta pessoalmente os serviços, figurando apenas como investidor ou dirigente, impede o enquadramento no regime uniprofissional.',
        motivos: [
          'O benefício pressupõe que todos os sócios atuem pessoalmente na prestação dos serviços.',
          `Fundamento expresso: ${dados.municipio === 'fortaleza' ? 'art. 249, § 1º, IV, e § 3º, da LC 159/2013 e art. 676, § 1º, IV, do Decreto 13.716/2015' : 'art. 249, § 1º, IV, da LC 2.384/2017'}, que veda sócio que figure apenas como investidor ou dirigente.`
        ],
        saneamento: 'Retirar do quadro societário o sócio investidor/dirigente ou convertê-lo em profissional habilitado que efetivamente preste os serviços em nome da sociedade.'
      });
      return;
    }

    // 3. Sócio Leigo / Não Habilitado
    if (dados.socios === 'leigo') {
      renderInapto({
        titulo: 'Inapto: Presença de Sócio Não Habilitado na Atividade-Fim',
        resumo: 'A existência de sócio sem registro profissional no conselho competente descaracteriza a sociedade uniprofissional.',
        motivos: [
          'A sociedade de profissionais pressupõe que todos os sócios sejam habilitados para o exercício da atividade correspondente ao objeto social.',
          'A admissão de sócios investidores ou leigos transfere o foco societário para a atividade empresarial e divisão de capital, afastando o benefício legal.'
        ],
        saneamento: 'Reestruturação societária para exclusão do sócio não habilitado ou remuneração de terceiros via contratos comerciais avulsos fora do quadro societário.'
      });
      return;
    }

    // 4. Pluriprofissionalidade
    if (dados.socios === 'pluriprofissional') {
      renderInapto({
        titulo: 'Inapto: Pluriprofissionalidade no Mesmo CNPJ',
        resumo: 'A reunião de sócios com habilitações ou profissões distintas impede o enquadramento no regime de cota fixa.',
        motivos: [
          'Jurisprudência pacífica do STJ: o regime especial do art. 9º, § 3º do DL nº 406/1968 destina-se estritamente a sociedades uniprofissionais.',
          `Em ${nomeMun}, a atuação concomitante de diferentes categorias (ex: médicos + psicólogos, ou engenheiros + arquitetos com objetos mistos) enseja a tributação regular sobre a receita bruta total.`,
          `Fundamento expresso: ${dados.municipio === 'fortaleza' ? 'art. 249, § 1º, II, da LC 159/2013 e art. 676, § 1º, II, do Decreto 13.716/2015' : 'art. 249, § 1º, II, da LC 2.384/2017'}.`
        ],
        saneamento: 'Cisão das operações ou abertura de CNPJs individualizados para cada especialidade regulamentada.'
      });
      return;
    }

    // 5. Elemento de Empresa / Impessoalidade
    if (dados.prestacao === 'empresarial') {
      renderInapto({
        titulo: 'Inapto: Caracterização de Elemento de Empresa',
        resumo: 'A prestação impessoal, terceirizada ou com estrutura empresarial descaracteriza a sociedade de profissionais.',
        motivos: [
          'Art. 966, parágrafo único, do Código Civil: a organização profissional que adota a impessoalidade e a terceirização em massa adquire feição estritamente empresarial.',
          'STF Tema 918 e STJ Tema 1323: embora a sociedade possa ser uma LTDA, é indispensável que a atuação profissional e a responsabilidade técnica sejam exercidas pessoal e diretamente pelos habilitados.',
          'A terceirização do atendimento-fim é causa clássica de autuação fiscal pelo Fisco Municipal com lançamento de ISS retroativo sobre o faturamento.'
        ],
        saneamento: 'Adequação da cláusula de objeto do contrato social e da rotina operacional, garantindo atendimento direto e responsabilidade técnica individualizada dos profissionais.'
      });
      return;
    }

    // 6. Atividade Não Elegível
    if (dados.atividade === 'outros') {
      renderInapto({
        titulo: 'Inapto: Atividade Não Homologada para o ISS Fixo',
        resumo: 'A atividade informada não consta no catálogo legal de serviços intelectuais autorizados.',
        motivos: [
          `Em ${nomeMun}, somente os subitens expressamente listados na lei podem usufruir do regime fixo.`,
          'Atividades comerciais, laboratoriais com foco industrial, hospitalares ou de intermediação não elegíveis estão fora do rol.'
        ],
        saneamento: 'Verificar se o CNAE e o subitem da LC 116/2003 correspondem fielmente à atividade-fim prestada.'
      });
      return;
    }

    // 7. Teste do rol taxativo (vale para Fortaleza E para Canindé - lista idêntica)
    if (!ROL_UNIPROFISSIONAL.includes(dados.atividade)) {
      const referencia = dados.municipio === 'fortaleza'
        ? 'art. 676 do Decreto Municipal nº 13.716/2015'
        : 'art. 249 da Lei Complementar nº 2.384/2017';
      renderInapto({
        titulo: 'Inapto: Subitem Não Admitido no Rol Taxativo',
        resumo: `A legislação de ${nomeMun} possui uma lista restrita e taxativa de subitens elegíveis ao ISS fixo.`,
        motivos: [
          `Fundamento: ${referencia}.`,
          'Este subitem específico não possui previsão expressa para reconhecimento administrativo no município.',
          'A ausência no rol impede o enquadramento, ainda que o regime variável seja menos vantajoso (vedação ao recolhimento pelo preço).'
        ],
        saneamento: 'Avaliar junto à assessoria jurídica ou contábil se o serviço pode ser enquadrado em subitem congênere admitido (ex: 4.01, 7.01, 17.13).'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // CASOS DE APROVAÇÃO (ELEGÍVEL / ATENÇÃO NO SIMPLES NACIONAL)
    // -------------------------------------------------------------------------

    if (dados.regime === 'simples_geral') {
      // Simples Nacional Geral (ex: Médicos, Dentistas, Advogados)
      renderAtencaoSimples({ nomeMun, dados, calc });
    } else {
      // Lucro Presumido/Real OU Simples Nacional Contábil
      renderApto({ nomeMun, dados, calc });
    }

    // Scroll suave até o painel de resultados
    setTimeout(() => {
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ---------------------------------------------------------------------------
  // RENDERIZAÇÃO DO COMPARATIVO FINANCEIRO (comum a APTO e ATENÇÃO)
  // ---------------------------------------------------------------------------
  function preencherComparativoFinanceiro(calc, dados) {
    financialSection.style.display = 'block';

    valIssVariavel.textContent = formatBRL(calc.issVariavelMensal);
    descIssVariavel.textContent = `Alíquota de ${formatPct(dados.aliquotaIss)} sobre faturamento de ${formatBRL(dados.faturamento)}`;

    valIssFixo.textContent = formatBRL(calc.issFixoMensal);
    descIssFixo.textContent = `${calc.totalProfissionais} profissional(is) × ${formatBRL(calc.cotaMensalUnit)} (faixa: ${calc.faixaCota})`;

    if (calc.diferenca > 0.005) {
      // O regime fixo é mais barato
      cardEconomia.classList.add('highlight-economy');
      cardEconomia.classList.remove('highlight-loss');
      labelEconomia.textContent = 'Economia Mensal Estimada';
      valEconomiaMensal.className = 'card-value value-positive';
      valEconomiaMensal.textContent = formatBRL(calc.economiaMensal);
      valEconomiaAnual.textContent = `Projeção anual: ${formatBRL(calc.economiaAnual)} (redução de ${Math.round(calc.percentRed)}%)`;
    } else if (calc.diferenca < -0.005) {
      // O regime fixo é mais caro neste patamar de faturamento (a lei, ainda assim, veda recolher pelo preço)
      cardEconomia.classList.remove('highlight-economy');
      cardEconomia.classList.add('highlight-loss');
      labelEconomia.textContent = 'Acréscimo Mensal com o Regime Fixo';
      valEconomiaMensal.className = 'card-value value-negative';
      valEconomiaMensal.textContent = formatBRL(calc.aumentoMensal);
      valEconomiaAnual.textContent = `Projeção anual: ${formatBRL(calc.aumentoMensal * 12)} a mais que o regime variável`;
    } else {
      cardEconomia.classList.remove('highlight-loss');
      cardEconomia.classList.add('highlight-economy');
      labelEconomia.textContent = 'Equilíbrio entre os Regimes';
      valEconomiaMensal.className = 'card-value';
      valEconomiaMensal.textContent = formatBRL(0);
      valEconomiaAnual.textContent = 'O ISS fixo e o ISS variável se equivalem neste faturamento';
    }

    if (equilibriumNote) {
      equilibriumNote.textContent =
        `Ponto de equilíbrio: com ${calc.totalProfissionais} profissional(is) e alíquota de ${formatPct(dados.aliquotaIss)}, ` +
        `o ISS fixo compensa a partir de ${formatBRL(calc.pontoEquilibrio)} de faturamento mensal.`;
    }

    // Barra comparativa: participação do ISS fixo em relação ao ISS variável
    const proporcao = calc.issVariavelMensal > 0
      ? Math.min(100, (calc.issFixoMensal / calc.issVariavelMensal) * 100)
      : 0;
    progressFill.style.width = `${proporcao}%`;

    if (calc.diferenca >= 0) {
      progressFill.classList.remove('is-loss');
      percentReducao.textContent = `Redução de ${Math.round(calc.percentRed)}% vs. regime variável`;
    } else {
      progressFill.classList.add('is-loss');
      percentReducao.textContent = `Acréscimo de ${Math.round(Math.abs(calc.percentRed))}% vs. regime variável`;
    }
  }

  // Renderização: INAPTO
  function renderInapto({ titulo, resumo, motivos, saneamento }) {
    resultBox.classList.add('state-inapto');
    resultBadge.textContent = 'Inapto ao ISS Fixo';
    resultTitle.textContent = titulo;
    resultSummary.textContent = resumo;

    let motivosHtml = '<ul>';
    motivos.forEach(m => {
      motivosHtml += `<li>${m}</li>`;
    });
    motivosHtml += '</ul>';

    parecerContent.innerHTML = `
      <p><strong>Fundamentação do Impedimento:</strong></p>
      ${motivosHtml}
      <p style="margin-top: 14px; font-weight: 600; color: #991b1b;">
        <strong>Consequência Fiscal:</strong> A sociedade deve recolher o ISS mensal incidente diretamente sobre a receita bruta, com alíquota variável conforme o subitem (2% a 5%).
      </p>
    `;

    // Oculta bloco financeiro para inapto
    financialSection.style.display = 'none';

    // Checklist de saneamento
    if (actionPlanSection) actionPlanSection.style.display = 'block';
    actionPlanTitle.textContent = '🛠️ Como Sanear e Adequar a Sociedade';
    actionPlanContent.innerHTML = `
      <ul class="checklist-items">
        <li>
          <span class="checklist-icon">⚠️</span>
          <div>
            <strong>Revisão Societária:</strong> ${saneamento}
          </div>
        </li>
        <li>
          <span class="checklist-icon">📄</span>
          <div>
            <strong>Adequação Contratual:</strong> Inserir cláusula de responsabilidade técnica ilimitada dos profissionais e certificar o registro no conselho regional competente.
          </div>
        </li>
        <li>
          <span class="checklist-icon">👨‍⚖️</span>
          <div>
            <strong>Consulta Prévia:</strong> Consulte seu contador ou advogado tributarista antes de pleitear o enquadramento no órgão fazendário.
          </div>
        </li>
      </ul>
    `;

    setTimeout(() => {
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Renderização: APTO (Lucro Presumido ou Escritório Contábil no Simples)
  function renderApto({ nomeMun, dados, calc }) {
    resultBox.classList.add('state-apto');
    resultBadge.textContent = 'Elegível ao ISS Fixo';
    resultTitle.textContent = `Sociedade Elegível ao Regime de Cota Fixa em ${nomeMun}`;
    resultSummary.textContent = `A sociedade preenche cumulativamente todos os requisitos objetivos e subjetivos do Decreto-Lei nº 406/1968 e da legislação de ${nomeMun}.`;

    const regimeTexto = dados.regime === 'simples_contabil'
      ? 'A sociedade é escritório de contabilidade no Simples Nacional com <strong>garantia legal expressa de recolhimento fixo</strong> concedida pelo art. 18, § 5º-B, XIV, e § 22-A da Lei Complementar federal nº 123/2006.'
      : 'A sociedade atua sob o regime de Lucro Presumido/Real, permitindo a imediata e plena eficácia da apuração em cota fixa sem interferência do PGDAS-D.';

    parecerContent.innerHTML = `
      <p>${regimeTexto}</p>
      <ul>
        <li><strong>Uniprofissionalidade atendida:</strong> quadro societário homogêneo formado apenas por pessoas físicas habilitadas na mesma profissão.</li>
        <li><strong>Pessoalidade caracterizada:</strong> responsabilidade direta e individualizada pelos atos profissionais privativos prestados.</li>
        <li><strong>Compatibilidade com LTDA:</strong> conforme <strong>STF Tema 918</strong> e <strong>STJ Tema 1323</strong>, a adoção da forma de responsabilidade limitada não impede, por si só, o regime fixo do ISS, desde que mantida a atuação uniprofissional.</li>
        <li><strong>Cômputo total de cotas:</strong> com ${dados.numSocios} sócio(s) e ${dados.numEmpregados} empregado(s) habilitado(s), o imposto mensal incidirá sobre <strong>${calc.totalProfissionais} profissional(is)</strong>, à cota de <strong>${formatBRL(calc.cotaMensalUnit)}</strong> cada (DL 406/68, art. 9º, § 3º; ${dados.municipio === 'fortaleza' ? 'art. 250 da LC 159/2013' : 'art. 250 da LC 2.384/2017'}).</li>
        <li><strong>Recolhimento por estabelecimento:</strong> na hipótese de filiais, considera-se a soma dos profissionais de todos os estabelecimentos, recolhendo-se o imposto por estabelecimento na proporção do respectivo número de profissionais.</li>
        <li><strong>Vedação de opção pelo preço:</strong> uma vez atendidas as condições, é vedado recolher o ISS com base no preço dos serviços, ainda que esse regime seja mais favorável (${dados.municipio === 'fortaleza' ? 'art. 678 do Decreto 13.716/2015' : 'art. 251 da LC 2.384/2017'}).</li>
      </ul>
    `;

    preencherComparativoFinanceiro(calc, dados);

    // Checklist administrativo
    actionPlanSection.style.display = 'block';
    actionPlanTitle.textContent = `📌 Próximos Passos para Homologação em ${nomeMun}`;
    actionPlanContent.innerHTML = `
      <ul class="checklist-items">
        <li>
          <span class="checklist-icon">1️⃣</span>
          <div>
            <strong>Protocolo de Processo Administrativo:</strong> ${dados.municipio === 'fortaleza' ? 'Acesse o portal SEFIN Fortaleza e formalize o pedido eletrônico de Reconhecimento de Sociedade de Profissionais.' : 'Apresente o requerimento formal de enquadramento perante a Secretaria de Finanças / Setor Tributário de Canindé.'}
          </div>
        </li>
        <li>
          <span class="checklist-icon">2️⃣</span>
          <div>
            <strong>Documentação Obrigatória:</strong> Contrato Social consolidado, Certidão de Regularidade Profissional no Conselho de Classe de todos os sócios e empregados (CRM, OAB, CRO, CRC, CREA, etc.), comprovante de CNPJ e alvará.
          </div>
        </li>
        <li>
          <span class="checklist-icon">3️⃣</span>
          <div>
            <strong>Obrigações Acessórias:</strong> Manter a declaração mensal de serviços (DMS) e informar qualquer alteração no quadro de sócios ou admissão/demissão de empregados habilitados para recálculo das cotas. Em Fortaleza, o reconhecimento tem validade de 5 anos e as alterações devem ser comunicadas em até 30 dias (arts. 681, § 4º, e 683 do Decreto 13.716/2015).
          </div>
        </li>
      </ul>
    `;
  }

  // Renderização: ATENÇÃO (Simples Nacional Não-Contábil)
  function renderAtencaoSimples({ nomeMun, dados, calc }) {
    resultBox.classList.add('state-atencao');
    resultBadge.textContent = 'Elegível com Ressalvas (Simples Nacional)';
    resultTitle.textContent = 'Elegível nos Critérios Materiais, com Ponto de Atenção no Simples Nacional';
    resultSummary.textContent = `A sociedade atende a todos os requisitos societários e legais de ${nomeMun}, mas, por ser optante pelo Simples Nacional em área não contábil, exige cautela procedimental na apuração.`;

    parecerContent.innerHTML = `
      <p>A sociedade preenche os requisitos do <strong>Decreto-Lei nº 406/1968</strong>, do <strong>STF Tema 918</strong> e da legislação de <strong>${nomeMun}</strong>. Contudo, há uma especificidade tributária federal:</p>
      <ul>
        <li><strong>Diferença em relação aos contadores:</strong> apenas os escritórios de serviços contábeis têm autorização expressa no art. 18, § 5º-B, XIV, e § 22-A da LC 123/2006 para recolher o ISS em valor fixo no Simples Nacional.</li>
        <li><strong>Operacionalização no PGDAS-D:</strong> para médicos, advogados, dentistas e engenheiros no Simples, o recolhimento fixo municipal exige segregação da receita e observância das regras federais, evitando bitributação.</li>
        <li><strong>Análise de cenário com Lucro Presumido:</strong> devido à complexidade do PGDAS-D e a divergências entre Fisco Municipal e Receita Federal, muitas sociedades uniprofissionais optam pelo <strong>Lucro Presumido</strong>, onde o benefício do ISS fixo é aproveitado de forma plena e pacífica.</li>
      </ul>
    `;

    preencherComparativoFinanceiro(calc, dados);

    // Checklist administrativo
    actionPlanSection.style.display = 'block';
    actionPlanTitle.textContent = '📌 Plano de Ação Recomendado (Simples Nacional)';
    actionPlanContent.innerHTML = `
      <ul class="checklist-items">
        <li>
          <span class="checklist-icon">⚖️</span>
          <div>
            <strong>Alinhamento com a Contabilidade:</strong> Avalie com o contador se a prefeitura de ${nomeMun} possui convênio ou sistemática aberta para emissão das guias fixas (DAM) em paralelo ao PGDAS-D.
          </div>
        </li>
        <li>
          <span class="checklist-icon">📊</span>
          <div>
            <strong>Estudo Comparativo de Enquadramento:</strong> Simule se a migração para o Lucro Presumido (com IRPJ/CSLL presumidos + PIS/COFINS cumulativos de 3,65% + ISS Fixo) gera uma carga tributária global ainda menor e com menos risco fiscal.
          </div>
        </li>
        <li>
          <span class="checklist-icon">📝</span>
          <div>
            <strong>Requerimento Administrativo:</strong> Homologar previamente a condição de Sociedade de Profissionais perante o Fisco Municipal de ${nomeMun}.
          </div>
        </li>
      </ul>
    `;
  }

});
