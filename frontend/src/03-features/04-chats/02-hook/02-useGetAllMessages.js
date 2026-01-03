import { useQuery } from "@tanstack/react-query";
import { allMessages } from "../01-api/03-allmessagess";

 export function useGetAllMessagesPerChatId(chatId, cursor) {
  return useQuery({
    queryKey: ["messages", chatId, cursor], // 🔥 cursor included
    queryFn: () => allMessages(chatId, cursor),
    enabled: !!chatId,
    keepPreviousData: true,
  });
}
