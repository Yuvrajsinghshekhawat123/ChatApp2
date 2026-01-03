import axiosClient from "./00-axiosClient";

export async function  getAllChats() {
    const res=await axiosClient.get("/chats/allchats");
    return res.data;
}