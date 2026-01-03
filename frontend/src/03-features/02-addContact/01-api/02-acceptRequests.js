import axiosClient from "./00-axiosClient";

export async function acceptRequests(data) {
    const resp=await axiosClient.post("/addContact/acceptRequest",data);
    return resp.data;
}






export async function rejectRequests(data) {
    const resp=await axiosClient.post("/addContact/rejectRequest",data);
    return resp.data;
}