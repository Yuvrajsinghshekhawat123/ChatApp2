import axiosClient from "./00-axiosClient";

export async function allMessages(chatId, cursor) {
  const resp = await axiosClient.get(
    "/chats/messages",
    {
      params: { chatId,cursor: cursor ? JSON.stringify(cursor) : null}
    }
  );

  return resp.data;
}