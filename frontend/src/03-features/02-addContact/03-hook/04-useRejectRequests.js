import { useMutation } from "@tanstack/react-query";
import { rejectRequests } from "../01-api/02-acceptRequests";



export function useRejectRequests(){
    return useMutation({
        mutationFn:rejectRequests
    })
}

