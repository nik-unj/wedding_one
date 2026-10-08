import type { Invitation } from '../types';

export const inviteUrl = () => {
  const u = new URL(window.location.href);
  // never leak a personal guest name into a re-shared link
  u.searchParams.delete('guest');
  u.hash = '';
  return u.toString();
};

export const shareMessage = (inv: Invitation, url: string) =>
  `You're invited to celebrate the wedding of ${inv.bride.name} & ${inv.groom.name}. Open the invitation: ${url}`;

export const whatsappShareUrl = (inv: Invitation, url = inviteUrl()) =>
  `https://wa.me/?text=${encodeURIComponent(shareMessage(inv, url))}`;

export const canNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export async function nativeShare(inv: Invitation): Promise<boolean> {
  if (!canNativeShare()) return false;
  const url = inviteUrl();
  try {
    await navigator.share({
      title: `${inv.couple.displayName} · Wedding Invitation`,
      text: shareMessage(inv, url).replace(url, '').trim(),
      url,
    });
    return true;
  } catch {
    return false; // user cancelled
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
