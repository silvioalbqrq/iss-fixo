/**
 * PORTAL DO ISS FIXO & SIMULADOR TRIBUTÁRIO (2026)
 * Lógica Tributária Rigorosa e Calculadora de Economia Real
 * Compatível com DL 406/68, LC 123/06, STF Tema 918, STJ Tema 1323,
 * LC Fortaleza 159/13, Dec. Fortaleza 13.716/15 e Lei Canindé 1.839/06.
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

  const actionPlanTitle = document.getElementById('actionPlanTitle');
  const actionPlanContent = document.getElementById('actionPlanContent');

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
    
    // Lista estrita de subitens permitidos pelo Decreto nº 13.716/2015 (Art. 676 - Fortaleza)
    const elegiveisFortaleza = [
      '4.01', '4.02', '4.06', '4.08', '4.09', '4.11', '4.12', '4.13', '4.14', '4.16',
      '5.01', '7.01', '17.13', '17.15', '17.18', '17.19'
    ];

    // Total de profissionais computados para cota (DL 406/68 art. 9º, § 3º e CTM Fortaleza art. 240)
    const totalProfissionais = dados.numSocios + dados.numEmpregados;

    // Valores médios de cota mensal em UFM (Exercício Fiscal 2026)
    // Fortaleza: Cota mensal básica por profissional gira em torno de R$ 380,00 (~65 UFMs)
    // Canindé: Cota mensal básica municipal gira em torno de R$ 220,00
    const cotaMensalUnit = dados.municipio === 'fortaleza' ? 380.00 : 220.00;

    // Cálculos financeiros
    const issVariavelMensal = dados.faturamento * dados.aliquotaIss;
    const issFixoMensal = totalProfissionais * cotaMensalUnit;
    const economiaMensal = Math.max(0, issVariavelMensal - issFixoMensal);
    const economiaAnual = economiaMensal * 12;
    const percentRed = issVariavelMensal > 0 ? Math.min(100, Math.max(0, Math.round((economiaMensal / issVariavelMensal) * 100))) : 0;

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
        resumo: `A legislação de ${nomeMun} e o Decreto-Lei nº 406/1968 vedam peremptoriamente o recolhimento fixo a sociedades que contem com sócio PJ.`,
        motivos: [
          'O art. 9º, § 3º do DL nº 406/1968 exige que os serviços sejam prestados sob a responsabilidade pessoal dos profissionais pessoas físicas.',
          'Pessoas Jurídicas (ex: holdings ou empresas de investimento) não possuem inscrição em conselho de classe e não podem responder técnica e eticamente por atos privativos de profissionais liberais.',
          `Art. 239 da Lei Complementar nº 159/2013 de Fortaleza estabelece expressamente a vedação de sócio PJ como causa de exclusão do regime.`
        ],
        saneamento: 'Para se enquadrar, a sociedade deve promover alteração contratual para retirar o sócio pessoa jurídica, mantendo exclusivamente pessoas naturais devidamente diplomadas e registradas no conselho respectivo.'
      });
      return;
    }

    // 2. Sócio Leigo / Não Habilitado
    if (dados.socios === 'leigo') {
      renderInapto({
        titulo: 'Inapto: Presença de Sócio Não Habilitado na Atividade-Fim',
        resumo: `A existência de sócio sem registro profissional no conselho competente descaracteriza a sociedade uniprofissional.`,
        motivos: [
          'A sociedade de profissionais pressupõe que todos os sócios exerçam a mesma profissão regulamentada.',
          'A admissão de sócios investidores ou leigos transfere o foco societário para a atividade empresarial e divisão de capital, afastando o benefício legal.'
        ],
        saneamento: 'Reestruturação societária para exclusão do sócio não habilitado ou remuneração de terceiros via contratos comerciais avulsos fora do quadro societário.'
      });
      return;
    }

    // 3. Pluriprofissionalidade
    if (dados.socios === 'pluriprofissional') {
      renderInapto({
        titulo: 'Inapto: Pluriprofissionalidade no Mesmo CNPJ',
        resumo: `A reunião de sócios com habilitações ou profissões distintas impede o enquadramento no regime de cota fixa.`,
        motivos: [
          'Jurisprudência Pacífica do STJ: O regime especial do art. 9º, § 3º do DL nº 406/1968 destina-se estritamente a sociedades uniprofissionais.',
          `Em ${nomeMun}, a atuação concomitante de diferentes categorias (ex: médicos + psicólogos, ou engenheiros + arquitetos com objetos mistos) enseja a tributação regular sobre a receita bruta total.`
        ],
        saneamento: 'Cisão das operações ou abertura de CNPJs individualizados para cada especialidade regulamentada.'
      });
      return;
    }

    // 4. Elemento de Empresa / Impessoalidade
    if (dados.prestacao === 'empresarial') {
      renderInapto({
        titulo: 'Inapto: Caracterização de Elemento de Empresa',
        resumo: `A prestação impessoal, terceirizada ou com estrutura empresarial descaracteriza a sociedade de profissionais.`,
        motivos: [
          'Art. 966, parágrafo único do Código Civil: A organização profissional que adota a impessoalidade e a terceirização em massa adquire feição estritamente empresarial.',
          'Tema 1323 do STJ e Tema 918 do STF: Embora a sociedade possa ser uma LTDA, é indispensável que a atuação profissional e a responsabilidade técnica sejam exercidas pessoal e diretamente pelos habilitados.',
          'A terceirização do atendimento-fim é causa clássica de autuação fiscal pelo Fisco Municipal com lançamento de ISS retroativo sobre o faturamento.'
        ],
        saneamento: 'Adequação da cláusula de objeto do contrato social e da rotina operacional, garantindo atendimento direto e responsabilidade técnica individualizada dos profissionais.'
      });
      return;
    }

    // 5. Atividade Não Elegível
    if (dados.atividade === 'outros') {
      renderInapto({
        titulo: 'Inapto: Atividade Não Homologada para o ISS Fixo',
        resumo: `A atividade informada não consta no catálogo legal de serviços intelectuais autorizados.`,
        motivos: [
          `Em ${nomeMun}, somente as profissões de nível superior devidamente regulamentadas e com conselhos de fiscalização profissional próprios podem usufruir do regime fixo.`,
          'Atividades comerciais, laboratoriais com foco industrial, hospitalares ou de intermediação não são elegíveis.'
        ],
        saneamento: 'Verificar se o CNAE e o subitem da LC 116/03 correspondem fielmente à atividade-fim prestada.'
      });
      return;
    }

    // 6. Teste Específico por Município (Fortaleza vs. Canindé)
    if (dados.municipio === 'fortaleza' && !elegiveisFortaleza.includes(dados.atividade)) {
      renderInapto({
        titulo: 'Inapto: Subitem Não Admitido no Art. 676 de Fortaleza',
        resumo: 'O Decreto Municipal nº 13.716/2015 possui uma lista restrita e taxativa para o município de Fortaleza.',
        motivos: [
          'A Secretaria Municipal das Finanças (SEFIN Fortaleza) adota interpretação restritiva do art. 676 do Regulamento do CTM.',
          'Este subitem específico não possui previsão expressa para reconhecimento administrativo em Fortaleza.'
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
      renderAtencaoSimples({
        nomeMun,
        dados,
        totalProfissionais,
        cotaMensalUnit,
        issVariavelMensal,
        issFixoMensal,
        economiaMensal,
        economiaAnual,
        percentRed
      });
    } else {
      // Lucro Presumido/Real OU Simples Nacional Contábil
      renderApto({
        nomeMun,
        dados,
        totalProfissionais,
        cotaMensalUnit,
        issVariavelMensal,
        issFixoMensal,
        economiaMensal,
        economiaAnual,
        percentRed
      });
    }

    // Scroll suave até o painel de resultados
    setTimeout(() => {
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
        <strong>Consequência Fiscal:</strong> A sociedade deve recolher o ISS mensal incidente diretamente sobre a receita bruta (alíquota variável entre 2% e 5%).
      </p>
    `;

    // Oculta bloco financeiro para inapto
    financialSection.style.display = 'none';

    // Checklist de saneamento
    actionPlanSection.style.display = 'block';
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
  function renderApto({ nomeMun, dados, totalProfissionais, cotaMensalUnit, issVariavelMensal, issFixoMensal, economiaMensal, economiaAnual, percentRed }) {
    resultBox.classList.add('state-apto');
    resultBadge.textContent = 'Elegível ao ISS Fixo';
    resultTitle.textContent = `Sociedade Elegível ao Regime de Cota Fixa em ${nomeMun}`;
    resultSummary.textContent = `A sociedade preenche cumulativamente todos os requisitos objetivos e subjetivos do Decreto-Lei nº 406/1968 e da legislação de ${nomeMun}.`;

    const regimeTexto = dados.regime === 'simples_contabil'
      ? 'A sociedade é escritório de contabilidade no Simples Nacional com <strong>garantia legal expressa de recolhimento fixo</strong> concedida pelo Art. 18, §§ 18 e 22-A da Lei Complementar federal nº 123/2006.'
      : 'A sociedade atua sob o regime de Lucro Presumido/Real, permitindo a imediata e plena eficácia da apuração em cota fixa sem interferência do PGDAS-D.';

    parecerContent.innerHTML = `
      <p>${regimeTexto}</p>
      <ul>
        <li><strong>Uniprofissionalidade atendida:</strong> Quadro societário homogêneo formado apenas por pessoas físicas habilitadas na mesma profissão.</li>
        <li><strong>Pessoalidade caracterizada:</strong> Responsabilidade direta e individualizada pelos atos profissionais privativos prestados.</li>
        <li><strong>Compatibilidade com LTDA:</strong> Conforme tese firmada pelo <strong>STF no Tema 918</strong> e <strong>STJ no Tema 1323</strong>, o formato de Sociedade Limitada é plenamente aceito no ISS Fixo.</li>
        <li><strong>Cômputo Total de Cotas:</strong> Com ${dados.numSocios} sócio(s) e ${dados.numEmpregados} empregado(s) habilitado(s), o imposto mensal incidirá sobre o total de <strong>${totalProfissionais} profissional(is) habilitado(s)</strong> (DL 406/68, art. 9º, § 3º).</li>
      </ul>
    `;

    // Exibe e atualiza o comparativo financeiro
    financialSection.style.display = 'block';
    valIssVariavel.textContent = formatBRL(issVariavelMensal);
    descIssVariavel.textContent = `Alíquota de ${(dados.aliquotaIss * 100).toFixed(1)}% sobre faturamento de ${formatBRL(dados.faturamento)}`;

    valIssFixo.textContent = formatBRL(issFixoMensal);
    descIssFixo.textContent = `${totalProfissionais} profissional(is) × ${formatBRL(cotaMensalUnit)} (cota mensal)`;

    valEconomiaMensal.textContent = formatBRL(economiaMensal);
    valEconomiaAnual.textContent = `Projeção anual de economia: ${formatBRL(economiaAnual)}`;
    percentReducao.textContent = `Redução tributária de ${percentRed}%`;
    progressFill.style.width = `${percentRed}%`;

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
            <strong>Obrigações Acessórias:</strong> Manter a declaração mensal de serviços (DMS) e informar qualquer alteração no quadro de sócios ou admissão/demissão de empregados habilitados para recálculo das cotas.
          </div>
        </li>
      </ul>
    `;
  }

  // Renderização: ATENÇÃO (Simples Nacional Não-Contábil)
  function renderAtencaoSimples({ nomeMun, dados, totalProfissionais, cotaMensalUnit, issVariavelMensal, issFixoMensal, economiaMensal, economiaAnual, percentRed }) {
    resultBox.classList.add('state-atencao');
    resultBadge.textContent = 'Elegível com Ressalvas (Simples Nacional)';
    resultTitle.textContent = `Elegível nos Critérios Materiais, com Ponto de Atenção no Simples Nacional`;
    resultSummary.textContent = `A sociedade atende a todos os requisitos societários e legais de ${nomeMun}, mas por ser optante pelo Simples Nacional em área não contábil, exige cautela procedimental na apuração.`;

    parecerContent.innerHTML = `
      <p>A sociedade preenche os requisitos do <strong>Decreto-Lei nº 406/1968</strong>, do <strong>STF Tema 918</strong> e da legislação de <strong>${nomeMun}</strong>. Contudo, há uma especificidade tributária federal:</p>
      <ul>
        <li><strong>Diferença em relação aos contadores:</strong> Apenas os escritórios contábeis possuem autorização expressa no art. 18, §§ 18 e 22-A da LC 123/2006 para recolher ISS fixo direto sem contestação no Simples.</li>
        <li><strong>Operacionalização no PGDAS-D:</strong> Para médicos, advogados, dentistas e engenheiros no Simples, o recolhimento fixo exige que no preenchimento do PGDAS-D a receita seja segregada para declarar o ISS como valor fixo municipal ou isenção no DAS, evitando a bitributação.</li>
        <li><strong>Análise de Cenário com Lucro Presumido:</strong> Devido à complexidade do PGDAS-D e frequentes divergências entre Fisco Municipal e Receita Federal, muitas sociedades uniprofissionais optam pelo <strong>Lucro Presumido</strong>, onde o benefício do ISS Fixo é aproveitado de forma plena, pacífica e juridicamente blindada.</li>
      </ul>
    `;

    // Exibe simulação financeira
    financialSection.style.display = 'block';
    valIssVariavel.textContent = formatBRL(issVariavelMensal);
    descIssVariavel.textContent = `Se apurado pelo percentual padrão de ${(dados.aliquotaIss * 100).toFixed(1)}% no DAS/ISS`;

    valIssFixo.textContent = formatBRL(issFixoMensal);
    descIssFixo.textContent = `${totalProfissionais} profissional(is) × ${formatBRL(cotaMensalUnit)} (cota mensal)`;

    valEconomiaMensal.textContent = formatBRL(economiaMensal);
    valEconomiaAnual.textContent = `Projeção anual de economia: ${formatBRL(economiaAnual)}`;
    percentReducao.textContent = `Redução tributária de ${percentRed}%`;
    progressFill.style.width = `${percentRed}%`;

    // Checklist administrativo
    actionPlanSection.style.display = 'block';
    actionPlanTitle.textContent = `📌 Plano de Ação Recomendado (Simples Nacional)`;
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
