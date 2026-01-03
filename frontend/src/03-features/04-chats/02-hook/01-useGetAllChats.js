import { useQuery } from "@tanstack/react-query";
import { getAllChats } from "../01-api/02-allchats";

export function useAllchats() {
  return useQuery({
    queryKey: ["allchats"],
    queryFn:getAllChats,
  });
}
