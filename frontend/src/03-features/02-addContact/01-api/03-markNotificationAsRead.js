import axiosClient from "./00-axiosClient";

export async function markNotificationAsRead(data) {
    const resp=await axiosClient.post("/addContact/marknotificationread",data);
    return resp.data;
}
