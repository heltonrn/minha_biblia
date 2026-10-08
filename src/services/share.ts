import { Share } from 'react-native';

/**
 * Link da Play Store para incluir na mensagem. Fica `null` até o app ser
 * publicado (antes disso o link abre uma página de erro).
 * Quando publicar: 'https://play.google.com/store/apps/details?id=br.com.volvet.minhabiblia'
 */
const STORE_URL: string | null = null;

const INVITE = '📖 Receba um versículo por dia no app Minha Bíblia';

/**
 * Compartilha um versículo pelo menu nativo do Android.
 * A menção "Bíblia Livre" atende à atribuição exigida pela licença
 * CC BY 3.0 BR da tradução.
 *
 * Formato:
 *   “texto do versículo”
 *   — João 3:16 · Bíblia Livre
 *
 *   📖 Receba um versículo por dia no app Minha Bíblia
 */
export async function shareVerse(reference: string, text: string): Promise<void> {
  const lines = [`“${text}”`, `— ${reference} · Bíblia Livre`, '', INVITE];
  if (STORE_URL) {
    lines.push(STORE_URL);
  }

  try {
    await Share.share({ message: lines.join('\n') });
  } catch (error) {
    console.error('Falha ao compartilhar', error);
  }
}
