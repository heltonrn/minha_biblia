# Publicação — Minha Bíblia

## O que já está pronto

- [x] Ícone do app, adaptive icon (foreground/background), ícone
      monocromático (Android 13+), splash (claro e escuro) e favicon em `assets/`.
- [x] `app.config.ts` com ícones, splash, cores da marca e pacote
      `br.com.volvet.minhabiblia`.
- [x] `eas.json` com perfis development / preview (APK) / production (AAB)
      e envio para a trilha **interna**.
- [x] `src/constants/ads.ts` decide anúncio de teste x real por
      `EXPO_PUBLIC_ADS_ENV` (definida no `eas.json`).
- [x] Gráficos da loja em `store/play-store/`: ícone 512, gráfico de
      destaque 1024×500 e 6 capturas 1080×1920.
- [x] Textos da ficha, classificação, público-alvo e roteiro do formulário
      de Segurança dos dados em `store/FICHA_PLAY_STORE.md`.
- [x] Política de privacidade em `store/POLITICA_DE_PRIVACIDADE.md`.
- [x] Scripts para regerar ícones e gráficos: `scripts/store/icons.py` e
      `scripts/store/store.py` (Python + Playwright).

## Antes do primeiro build de produção

1. **Pasta `android/`** — ela foi gerada pelo `expo run:android`. Enquanto
   existir, o EAS usa esse projeto nativo e **ignora** ícones/splash/cores
   do `app.config.ts`. Escolha um:
   - apagar `android/` (recomendado — o EAS gera tudo no build), ou
   - rodar `npx expo prebuild --clean` depois de trocar os ícones.
   Se apagar, adicione `/android` ao `.gitignore`.
2. **Limpeza** — apagar os `hs_err_pid*.log` e `replay_pid*.log` da raiz
   (logs de crash da JVM do Gradle), `src/db/seed.ts` e a pasta vazia
   `app/capitulo/[bookId]/`. Adicionar ao `.gitignore`:
   `hs_err_pid*.log`, `replay_pid*.log`, `play-store-service-account.json`,
   `*.keystore`.
3. **Política de privacidade** — preencher a data e **hospedar** numa URL
   pública (ex.: GitHub Pages, ou uma página em volvet.com.br). A URL vai
   na ficha e no formulário de Segurança dos dados.
4. **Development build** — testar AdMob e notificações de verdade
   (não funcionam no Expo Go):
   ```bash
   npx eas build --platform android --profile preview
   ```

## Play Console — ordem de preenchimento

1. Criar o app: nome "Minha Bíblia", idioma PT-BR, **App**, **Gratuito**.
2. **Configurar o app** (painel → "Configure seu app"):
   - Política de privacidade (URL).
   - Acesso ao app: tudo disponível sem login.
   - Anúncios: **Sim**.
   - Classificação de conteúdo → roteiro na ficha.
   - Público-alvo: 13+ (ver ficha).
   - Segurança dos dados → roteiro na ficha.
   - Apps governamentais / financeiros / saúde: Não.
   - ID de publicidade: Sim (publicidade).
3. **Presença na loja → Versão principal da página**: textos da ficha +
   arquivos de `store/play-store/`.
4. Categoria **Livros e referências** + e-mail contato@volvet.com.br.

## Testes e liberação

> **Conta pessoal criada após nov/2023:** antes de liberar para produção,
> a Play exige um **teste fechado com pelo menos 12 testadores ativos por
> 14 dias seguidos**. Se a conta Volvet for de organização (empresa com
> D-U-N-S), essa exigência não se aplica.

```bash
npx eas login
npx eas build:configure                                   # gera o projectId
npx eas build --platform android --profile production     # AAB
npx eas submit --platform android                         # vai para "Teste interno"
```

- **Teste interno** (até 100 e-mails): libera em minutos; serve para você
  e a família validarem.
- **Teste fechado**: promova a mesma versão, convide os 12+ testadores
  (Grupo do Google ou lista de e-mails) e conte os 14 dias.
- **Produção**: depois do período, "Solicitar acesso à produção" no painel,
  responder ao questionário sobre o teste e enviar para revisão.

O `eas submit` usa a mesma Service Account do Frase do Dia/Hidrata
(`play-store-service-account.json` na raiz — fora do git). Basta dar a ela
acesso ao novo app em Play Console → Usuários e permissões.

## Requisitos técnicos

- **Target API**: desde 31/08/2026 apps novos precisam mirar Android 16
  (API 36). O Expo SDK 57 já compila para ela — confira no log do build
  (`targetSdkVersion`).
- **Formato**: AAB (o perfil production já gera AAB).
- **Assinatura**: deixe o EAS gerenciar a keystore e ative o "Play App
  Signing" (padrão em apps novos).

## Depois de publicar

- [ ] Vincular o app à Play Store no painel do AdMob.
- [ ] Publicar o `app-ads.txt` em volvet.com.br (o AdMob mostra o conteúdo)
      e informar o site na ficha da loja.
- [ ] Trocar as capturas por prints reais quando quiser (mesmo layout:
      `scripts/store/store.py`).
- [ ] A cada atualização: o EAS incrementa o `versionCode` sozinho
      (`autoIncrement`); suba o `version` (ex.: 1.0.1) no `app.config.ts`.
