import { useMutation } from "@tanstack/react-query";
import { createRequest } from "../01-api/01-addContact";

 

export function useCreateRequest(){
    return useMutation({
        mutationFn:createRequest
    })
}