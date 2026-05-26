const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface InlineButton {
  text: string;
  callback_data: string;
}

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendMessage(
  chatId: number,
  text: string,
  buttons?: InlineButton[][],
) {
  return call('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(buttons && {
      reply_markup: { inline_keyboard: buttons },
    }),
  });
}

export async function editMessage(
  chatId: number,
  messageId: number,
  text: string,
  buttons?: InlineButton[][],
) {
  return call('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    ...(buttons && {
      reply_markup: { inline_keyboard: buttons },
    }),
  });
}

export async function answerCallback(callbackId: string, text?: string) {
  return call('answerCallbackQuery', {
    callback_query_id: callbackId,
    text,
  });
}

export async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
  buttons?: InlineButton[][],
) {
  return call('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
    ...(buttons && {
      reply_markup: { inline_keyboard: buttons },
    }),
  });
}

export async function deleteMessage(chatId: number, messageId: number) {
  return call('deleteMessage', {
    chat_id: chatId,
    message_id: messageId,
  });
}

export function isAdmin(chatId: number): boolean {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) return true;
  return String(chatId) === adminId;
}

export async function setWebhook(url: string) {
  return call('setWebhook', { url });
}
