import axiosClient from "./00-axiosClient";

export async function allNotifiction() {
  const resp = await axiosClient.get("/notification/allNotifiction");
  return resp.data;
}



