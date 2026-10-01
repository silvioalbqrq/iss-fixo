# Portal & Simulador do ISS Fixo (Fortaleza & Canindé - CE)

Aplicação web estática para **diagnóstico de elegibilidade tributária** e **cálculo de economia financeira em R$** para Sociedades Uniprofissionais de prestadores de serviços regulamentados (Médicos, Advogados, Contadores, Dentistas, Engenheiros, Psicólogos, etc.), com foco estrito nas legislações de **Fortaleza** e **Canindé** (Ceará) e no ordenamento jurídico federal.

---

## ⚖️ Fundamentação Legal e Jurisprudencial

Esta versão foi integralmente revisada para garantir total fidedignidade às normas vigentes:

1. **Âmbito Federal:**
   * **Decreto-Lei nº 406/1968 (Art. 9º, §§ 1º e 3º):** Norma geral recepcionada pela CF/88 com status de Lei Complementar. Fixa a apuração por cota periódica em função de cada profissional habilitado, sócio, empregado ou terceiro, que atue sob responsabilidade pessoal.
   * **Lei Complementar nº 123/2006 (Art. 18, § 5º-B, XIV, e § 22-A):** Assegura expressamente o recolhimento em valor fixo de ISS aos **escritórios de serviços contábeis** optantes pelo Simples Nacional, fora do DAS.
   * **STF - Tema 918 (Repercussão Geral no RE 940.769):** Declara a inconstitucionalidade de normas municipais que impedem sociedades de profissionais de recolherem o ISS Fixo apenas pela adoção do modelo de Sociedade Limitada (LTDA).
   * **STJ - Tema 1323 (Recursos Repetitivos):** A adoção da forma societária de responsabilidade limitada pela sociedade uniprofissional não constitui, por si só, impedimento ao regime fixo do ISS, desde que mantida a atuação uniprofissional.

2. **Município de Fortaleza - CE:**
   * **Lei Complementar Municipal nº 159/2013 (Código Tributário Municipal - CTM):** Arts. 249 e 250, com os requisitos da sociedade de profissionais e a **cota mensal fixada em reais** (R$ 140 / 160 / 180 / 200 / 220 por profissional, conforme o porte). O art. 245 fixa as alíquotas do regime variável (3% para os itens 4 e 5; 5% nos demais).
   * **Decreto Municipal nº 13.716/2015 (Regulamento do CTM - Arts. 676 e 677):** Lista restrita e taxativa de subitens homologados pela SEFIN Fortaleza e tabela da cota por profissional. O art. 667 fixa as alíquotas do regime variável.

3. **Município de Canindé - CE:**
   * **Lei Complementar nº 2.384/2017 (Código Tributário do Município de Canindé):** Arts. 249 a 251, com rol e cota **idênticos** aos de Fortaleza, porém com alíquotas próprias no art. 245 (4% para os itens 4 e 5; 3% para 7.01; 5% nos demais).

> **Cota mensal por profissional (2026):** até 5 = R$ 140,00 · de 6 a 10 = R$ 160,00 · de 11 a 15 = R$ 180,00 · de 16 a 20 = R$ 200,00 · mais de 20 = R$ 220,00 (a soma considera todos os estabelecimentos).

---

## 🚀 Principais Funcionalidades

* **Diagnosticador Legal Inteligente:**
  * Avalia presença de sócio PJ, sócio apenas investidor/dirigente, sócio leigo, pluriprofissionalidade e elemento de empresa.
  * Valida o rol taxativo de subitens (idêntico em Fortaleza e em Canindé).
  * Trata separadamente sociedades no Lucro Presumido/Real, escritórios contábeis no Simples Nacional e demais atividades no Simples (com orientações de PGDAS-D).
* **Simulador Financeiro em Reais (R$):**
  * Computa sócios + empregados/colaboradores habilitados (DL 406/68 art. 9º, § 3º).
  * Aplica a cota legal por faixa de porte (R$ 140 a R$ 220) e pré-seleciona a alíquota variável do subitem (2% a 5%) conforme o município.
  * Compara o ISS Variável sobre o faturamento contra o ISS em cota fixa mensal, exibindo **economia**, **equilíbrio** ou **acréscimo**, o ponto de equilíbrio e a projeção anual.
* **Plano de Ação e Checklist:**
  * Roteiro de documentos para protocolo na SEFIN Fortaleza ou em Canindé.
  * Guia de saneamento societário e contratual para sociedades classificadas como inaptas.
* **UX/A11y Refinada:**
  * Validação sem `alert()` nativo, mensagens contextuais, scroll suave e acessibilidade (`aria-live="polite"` e `role="status"`).

---

## 📁 Estrutura do Projeto

```
iss-fixo/
├── index.html      # Estrutura semântica, formulários e painéis normativos
├── styles.css      # Estilização CSS moderna, responsiva e com variáveis
├── app.js          # Motor de regras tributárias e cálculos financeiros
└── README.md       # Documentação do projeto
```

---

## 💻 Como Testar Localmente

Basta abrir o arquivo `index.html` em qualquer navegador web moderno:
```powershell
# No PowerShell:
Start-Process "index.html"
```
Ou rodar um servidor HTTP local simples:
```powershell
python -m http.server 8000
# Acesse http://localhost:8000
```

---

## 🌐 Como Publicar no GitHub Pages

1. Crie ou acesse o repositório no GitHub (ex: `silvioalbqrq/iss-fixo`).
2. Copie os arquivos `index.html`, `styles.css`, `app.js` e `README.md` para a raiz do repositório ou branch `main` / `gh-pages`.
3. Nas configurações do repositório (**Settings > Pages**), selecione a branch `main` e a pasta `/ (root)`.
4. Em poucos minutos, a versão atualizada estará ativa no endereço público.
