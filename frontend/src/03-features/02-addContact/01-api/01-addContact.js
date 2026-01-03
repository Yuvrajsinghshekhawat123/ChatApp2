import axiosClient from "./00-axiosClient";

export async function searchUser(email) {
  const resp = await axiosClient.get(
    "/addContact/users/search",
    {
      params: { email }
    }
  );
  return resp.data;
}



export async function createRequest(data) {
    const resp=await axiosClient.post("/addContact/add",data);
    return resp.data;
}