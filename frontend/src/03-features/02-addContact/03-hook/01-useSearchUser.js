import { useQuery } from "@tanstack/react-query";
import { searchUser } from "../01-api/01-addContact";
 




export function useSearchUser(email) {
  return useQuery({
    queryKey: ["searchUser", email],
    queryFn: () => searchUser(email),
    enabled: !!email,   // 🔥 prevents API call when email is empty
  });
}




