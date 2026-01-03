import { useMutation } from "@tanstack/react-query";
import { acceptRequests } from "../01-api/02-acceptRequests";


export function useAcceptRequests(){
    return useMutation({
        mutationFn:acceptRequests
    })
}

