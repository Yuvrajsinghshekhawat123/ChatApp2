import { useMutation } from "@tanstack/react-query";
import { markNotificationAsRead } from "../01-api/03-markNotificationAsRead";



export function useMarkNotificationAsRead(){
    return useMutation({
        mutationFn:markNotificationAsRead
    })
}

