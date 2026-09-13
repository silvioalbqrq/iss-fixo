# Portal & Simulador do ISS Fixo (Fortaleza & Canindé - CE)

Aplicação web estática para **diagnóstico de elegibilidade tributária** e **cálculo de economia financeira em R$** para Sociedades Uniprofissionais de prestadores de serviços regulamentados (Médicos, Advogados, Contadores, Dentistas, Engenheiros, Psicólogos, etc.), com foco estrito nas legislações de **Fortaleza** e **Canindé** (Ceará) e no ordenamento jurídico federal.

---

## ⚖️ Fundamentação Legal e Jurisprudencial

Esta versão foi integralmente revisada para garantir total fidedignidade às normas vigentes:

1. **Âmbito Federal:**
   * **Decreto-Lei nº 406/1968 (Art. 9º, §§ 1º e 3º):** Norma geral recepcionada pela CF/88 com status de Lei Complementar. Fixa a apuração por cota periódica em função de cada profissional habilitado, sócio, empregado ou terceiro, que atue sob responsabilidade pessoal.
   * **Lei Complementar nº 123/2006 (Art. 18, §§ 18 e 22-A):** Assegura expressamente o recolhimento em valor fixo de ISS aos **escritórios de serviços contábeis** optantes pelo Simples Nacional, fora do DAS.
   * **STF - Tema 918 (Repercussão Geral no RE 940.769):** Declara a inconstitucionalidade de normas municipais que impedem sociedades de profissionais de recolherem o ISS Fixo apenas pela adoção do modelo de Sociedade Limitada (LTDA).
   * **STJ - Tema 1323 (Recursos Repetitivos):** Consolida que a responsabilidade limitada no âmbito societário não exclui a responsabilidade técnica direta pelos serviços, preservando o direito à cota fixa desde que não haja organização estritamente empresarial e impessoal.

2. **Município de Fortaleza - CE:**
   * **Lei Complementar Municipal nº 159/2013 (Código Tributário Municipal - CTM):** Arts. 238 a 244, regulando a cota mensal calculada em UFMs por profissional habilitado (sócios + empregados técnicos).
   * **Decreto Municipal nº 13.716/2015 (Regulamento do CTM - Art. 676):** Lista restrita e taxativa de subitens homologados pela SEFIN Fortaleza.

3. **Município de Canindé - CE:**
   * **Lei Municipal nº 1.839/2006 (Código Tributário de Canindé):** Recepção do regime do DL 406/1968 com apuração em cota fixa na unidade fiscal municipal local.

---

## 🚀 Principais Funcionalidades

* **Diagnosticador Legal Inteligente:**
  * Avalia presença de sócio PJ, sócio leigo, pluriprofissionalidade e elemento de empresa.
  * Valida subitens estritos conforme o município selecionado.
  * Trata separadamente sociedades no Lucro Presumido/Real, escritórios contábeis no Simples Nacional e demais atividades no Simples (com orientações de PGDAS-D).
* **Simulador Financeiro em Reais (R$):**
  * Computa sócios + empregados/colaboradores habilitados (DL 406/68 art. 9º, § 3º).
  * Compara o ISS Variável sobre o faturamento (2% a 5%) contra o ISS em cota fixa mensal.
  * Exibe economia estimada mensal e anual com barra gráfica de redução percentual da carga fiscal.
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
