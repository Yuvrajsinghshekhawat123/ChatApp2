import { useMutation, useQuery } from "@tanstack/react-query";
import { allNotifiction } from "../01-api/01-allNotifiction";

export function useAllNotifiction(){
    return useQuery({
        queryKey:["allNotifiction"],
        queryFn:allNotifiction
    })
}


