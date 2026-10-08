# Ficha da Play Store — Minha Bíblia

Pacote: `br.com.volvet.minhabiblia` · Idioma padrão: Português (Brasil) · Contato: contato@volvet.com.br

## Nome do app (máx. 30 caracteres)
```
Minha Bíblia
```

## Descrição curta (máx. 80 caracteres)
```
Bíblia offline com versículo do dia, planos de leitura, busca e favoritos.
```

## Descrição completa (máx. 4000 caracteres)
```
Minha Bíblia é um app simples e bonito para ler a Palavra todos os dias —
sem cadastro, sem login e funcionando mesmo sem internet.

VERSÍCULO DO DIA
• Um versículo novo a cada dia, escolhido para ser lido sozinho.
• Compartilhe com amigos e família no WhatsApp ou onde preferir.
• Toque em "Ler no capítulo" para ver o versículo no seu contexto.

A BÍBLIA COMPLETA, OFFLINE
• Antigo e Novo Testamento: todos os 66 livros.
• Leitura confortável, capítulo por capítulo, com navegação para o
  capítulo anterior e o seguinte.
• O app lembra onde você parou e te leva de volta com um toque.

PLANOS DE LEITURA
• Bíblia em 1 ano.
• Novo Testamento em 90 dias.
• Provérbios em 31 dias.
Marque cada dia concluído e acompanhe seu progresso.

BUSCA E FAVORITOS
• Busque qualquer palavra em toda a Bíblia.
• Favorite versículos com um toque e escreva suas próprias anotações.

LEMBRETE DIÁRIO
• Receba um lembrete no horário que você escolher para não perder a
  leitura do dia.

PRIVACIDADE EM PRIMEIRO LUGAR
Seus favoritos, anotações e progresso ficam guardados apenas no seu
aparelho. O app não pede cadastro nem coleta dados pessoais.

SOBRE O TEXTO
O texto bíblico é da Bíblia Livre (BLIVRE), Copyright © Diego Santos,
Mario Sérgio e Marco Teles, distribuída sob a licença Creative Commons
Atribuição 3.0 Brasil (CC BY 3.0 BR). O Novo Testamento segue o Textus
Receptus.

Minha Bíblia é gratuito e exibe um pequeno banner de anúncio.
```
*(≈1.500 caracteres — folga para ajustes.)*

## Gráficos (pasta `store/play-store/`)
| Item | Arquivo | Especificação da Play |
|---|---|---|
| Ícone do app | `play-store-icon-512.png` | 512×512, PNG 32 bits |
| Gráfico de destaque | `feature-graphic-1024x500.png` | 1024×500, PNG/JPG sem transparência |
| Capturas de tela do telefone | `screenshot-01…06-*.png` | 1080×1920 (9:16), mín. 2, máx. 8 |

Ordem sugerida das capturas: 01 Versículo do dia → 02 Leitura → 03 Planos →
04 Busca → 05 Favoritos → 06 Lembrete. As capturas são mockups fiéis às telas
atuais; quando o app estiver no development build, vale trocar pelos prints
reais mantendo a mesma moldura (script `store.py`).

## Categoria
**Livros e referências** (alternativa: Estilo de vida).

## Tags sugeridas (Play Console → Presença na loja → Tags)
Bíblia · Religião · Leitura · Livros

## Detalhes de contato
- E-mail: contato@volvet.com.br
- Site (opcional): página onde a política de privacidade for hospedada.

## Classificação de conteúdo (questionário IARC)
- Categoria do app: **Referência, notícias ou educacional**.
- Violência, sexo, linguagem, drogas, apostas: **Não** para todos.
- Interação entre usuários / compartilhamento de localização / compras: **Não**.
- Resultado esperado: **Livre** (L / PEGI 3 / Everyone).

## Público-alvo e conteúdo
- Faixa etária alvo: marcar **13–15, 16–17 e 18+** (não marcar faixas
  abaixo de 13 — evita as exigências da política "Famílias" para o AdMob).
- O app não é direcionado especificamente a crianças.
- Contém anúncios: **Sim** (banner Google AdMob).
- Compras no app: **Não**.
- Acesso ao app: todas as funções disponíveis sem login (não precisa
  fornecer credenciais de teste).

---

# Formulário de Segurança dos dados (Data Safety)

## O app coleta ou compartilha dados do usuário?
**Sim** — somente por causa do SDK de anúncios (Google AdMob). O app em si
não envia nada: favoritos, notas, planos e configurações ficam no SQLite
local do aparelho (dados que nunca saem do dispositivo não contam como
"coletados" para a Play).

## Dados declarados (via AdMob)
| Tipo de dado | Coletado | Compartilhado | Finalidade | Opcional? |
|---|---|---|---|---|
| Identificadores do dispositivo ou outros IDs (ID de publicidade) | Sim | Sim | Publicidade ou marketing; Análise; Prevenção de fraudes | Não |
| Interações no app (com anúncios) | Sim | Sim | Publicidade ou marketing; Análise | Não |
| Diagnóstico (falhas/desempenho do SDK) | Sim | Não | Análise | Não |
| Localização aproximada (derivada do IP) | Sim | Sim | Publicidade ou marketing | Não |

## Não coletados
Nome, e-mail, telefone, endereço, localização precisa, contatos, fotos,
arquivos, mensagens, informações financeiras, saúde, histórico de navegação.

## Práticas de segurança
- Dados criptografados em trânsito: **Sim** (gerenciado pelo SDK do Google).
- Solicitação de exclusão: o desenvolvedor não guarda dados em servidor;
  o usuário apaga tudo desinstalando o app e controla o ID de publicidade
  nas configurações do Android.

## Política de privacidade
URL pública de `POLITICA_DE_PRIVACIDADE.md` — **[PREENCHER após hospedar]**.

## Declarações adicionais
- **ID de publicidade**: Sim, o app usa (AdMob) → finalidade "Publicidade ou marketing".
- **Permissões**: `POST_NOTIFICATIONS` (lembrete diário), `INTERNET` e
  `ACCESS_NETWORK_STATE` (anúncios). Se o build incluir
  `SCHEDULE_EXACT_ALARM`, declarar o uso para o lembrete diário — ou
  remover a permissão se o agendamento não precisar ser exato.
- **Apps de notícias / saúde / financeiros / governo**: Não se aplica.
