# Semana 1 — Entrega 2: calendário menstrual preliminar

Status técnico em 28/08/2026: fluxo funcional validado para demonstração local no navegador.

## O que a entrega demonstra

| Critério | Evidência no aplicativo |
|---|---|
| Registro do início e término | O botão da data selecionada inicia o período e muda para **Encerrar período** enquanto houver um ciclo aberto. |
| Armazenamento local | Os ciclos são gravados no `localStorage` do navegador/WebView sob a chave versionada `cuidado-feminino:ciclos:v1`. Não dependem do backend. |
| Visualização no calendário | Todo o intervalo registrado recebe a cor de **Período real registrado**; um ciclo aberto é exibido do início até o dia atual. |
| Identificação dos períodos | Ao selecionar um dia registrado, o painel informa **Período menstrual registrado**. A legenda diferencia registros reais e fases previstas. |
| Previsão do próximo ciclo | A previsão usa a média dos intervalos entre os inícios dos ciclos. Com pouco histórico, usa 28 dias e informa confiança baixa. |
| Consulta dos registros | A seção **Últimos Ciclos Registrados** mostra início, fim, duração e status; quando houver mais de três, permite exibir todos. |

## Como iniciar a demonstração

1. Abra a pasta `frontend`.
2. Execute `INICIAR_DEMO.bat`.
3. Abra `http://127.0.0.1:4173` no navegador.
4. Aguarde a tela inicial por cerca de dois segundos e entre em **Calendário**.

O backend e o banco de dados não precisam estar ligados para esta entrega.

Se precisar zerar os registros depois de ensaiar, abra o console do navegador com `F12` e execute:

```js
localStorage.removeItem("cuidado-feminino:ciclos:v1");
location.reload();
```

## Dados sugeridos para a demonstração

Use datas recentes para que o período apareça no mês atual:

1. Selecione uma data de quatro dias atrás e clique em **Registrar início do período**.
2. Mostre o intervalo em andamento no calendário e no histórico.
3. Selecione a data de hoje e clique em **Encerrar período**.
4. Mostre o intervalo fechado, sua duração e a previsão recalculada.
5. Recarregue a página e volte ao calendário para comprovar que o registro permaneceu salvo.

## Roteiro de vídeo — aproximadamente 4 minutos

### 0:00–0:25 — Apresentação

“Esta é a versão preliminar do calendário menstrual do aplicativo Minha Saúde Feminina. Nesta etapa, os registros ficam armazenados localmente no dispositivo e o recurso funciona sem depender do servidor.”

### 0:25–1:25 — Início e término

- Abra o calendário.
- Mostre o aviso **Dados salvos neste dispositivo**.
- Selecione a data inicial e registre o início.
- Mostre o status **Em andamento**.
- Selecione a data final e encerre o período.

### 1:25–2:15 — Calendário e identificação

- Mostre os dias do período real destacados.
- Selecione um desses dias e mostre **Período menstrual registrado**.
- Abra a legenda e explique as cores de menstruação, período fértil e ovulação.

### 2:15–2:55 — Previsão

- Mostre a próxima menstruação, início do período fértil e ovulação prevista.
- Explique que o cálculo usa os intervalos entre os inícios registrados e começa com a referência de 28 dias quando há pouco histórico.
- Mostre o nível de confiança exibido pelo aplicativo.

### 2:55–3:30 — Histórico e persistência

- Mostre início, término e duração em **Últimos Ciclos Registrados**.
- Recarregue a página.
- Volte ao calendário e confirme que o registro continua presente.

### 3:30–3:50 — Encerramento

“Assim, a versão preliminar permite registrar e consultar ciclos, visualizar os períodos no calendário e prever o próximo ciclo. As previsões são estimativas e não substituem avaliação médica.”

## Checklist antes de apresentar

- [ ] Ensaiar o fluxo uma vez e depois limpar os dados de ensaio.
- [ ] Fechar notificações e aplicativos pessoais antes de gravar a tela.
- [ ] Confirmar que `INICIAR_DEMO.bat` abre o servidor local.
- [ ] Fazer o registro completo usando datas do mês visível.
- [ ] Recarregar a página para provar a persistência local.
- [ ] Manter o vídeo abaixo de 6 minutos.
- [ ] Conferir áudio e legibilidade das datas antes de enviar.

## Verificações técnicas executadas

- 44 testes automatizados do frontend aprovados com Vitest; a suíte inclui os cenários do calendário.
- Build de produção do frontend aprovado com Vite.
- Lint completo aprovado com 0 erros e 3 avisos de Fast Refresh em componentes existentes.
- 43 testes do backend aprovados com Java 21 e H2 isolado; o backend não é necessário para a demonstração do calendário.
- Fluxo visual validado em viewport de celular: início, encerramento, histórico, previsão e recarga sem erros no console.
- Assets web sincronizados com o projeto Android pelo Capacitor.

Observação: a geração local do APK ainda requer a instalação do Android SDK Platform 36 e Build Tools 35.0.0 nessa máquina. Para a entrega de amanhã, a demonstração no navegador é o caminho validado e de menor risco.
