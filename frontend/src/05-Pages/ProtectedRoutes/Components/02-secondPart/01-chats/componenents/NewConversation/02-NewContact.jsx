import { useDispatch } from "react-redux";
import { setActiveTab } from "../../../../../../../00-app/activeTabSlice";
import { IoArrowBack } from "react-icons/io5";
import { FaDog, FaUser, FaUserCircle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useState } from "react";
import { useSearchUser } from "../../../../../../../03-features/02-addContact/03-hook/01-useSearchUser";
import { useEffect } from "react";
import { useCreateRequest } from "../../../../../../../03-features/02-addContact/03-hook/02-useCreateRequest";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useQueryClient } from "@tanstack/react-query";
import { openChat } from "../../../../../../../00-app/01-chatSlice";

export function NewChat() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  const { data, isLoading, isError, error } = useSearchUser(debouncedEmail);

  function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


 // 🔹 debounce logic
  useEffect(() => {
    if (!isValidEmail(email)) {
      setDebouncedEmail("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 600); // ⏱ user finished typing

    return () => clearTimeout(timer);
  }, [email]);




   const {mutate:sendRequest}=useCreateRequest();
   const [processing,setProcessing]=useState(false);
   const queryClient = useQueryClient();

  function handleAddContact(targetId) {
  setProcessing(true);

  const formData = new FormData();
  formData.append("receiverId", targetId);

  sendRequest(formData, {
    onSuccess: (data) => {
      toast.success(data.message || "Contact request sent ✅");
      setProcessing(false);

      queryClient.invalidateQueries({
  queryKey: ["searchUser", debouncedEmail],
});



    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to send request ❌"
      );
      setProcessing(false);
    }
  });
}



  return (
    <section className="px-4 text-white">
      {/* HEADER */}
      <div
        onClick={() => dispatch(setActiveTab("searchcontact"))}
        className="flex items-center gap-2 text-xl font-semibold cursor-pointer"
      >
        <IoArrowBack className="text-2xl" />
        <span>New chat</span>
      </div>

      {/* FORM */}
      <section className="flex justify-center mt-16">
        <div className="w-full max-w-md space-y-8 bg-[#111] p-6 rounded-xl">

          {/* NAME (optional – can remove later) */}
          <div className="flex items-center gap-4">
            <FaUser className="text-2xl text-[#757575]" />
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-transparent border-b-2 border-[#757575] text-white text-xl outline-none"
            />
          </div>

          {/* EMAIL */}
          <div className="flex items-center gap-4">
            <MdEmail className="text-2xl text-[#757575]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-transparent border-b-2 border-[#757575] text-white text-xl outline-none"
            />
          </div>

          {/* SEARCH RESULT */}
          <div className="mt-6 space-y-4">

            {/* LOADING */}
            {isLoading && (
              <p className="text-gray-400 text-center">
                Searching user...
              </p>
            )}

            {/* ERROR */}
            {isError && (
              <p className="text-red-400 text-center">
                {error.response.data.message || "User not found"}
              </p>
            )}

            {/* USER FOUND */}
            {data?.success && data.user && (
  <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg">
    {/* USER INFO */}
    <div className="flex items-center gap-3">
      {data.user.avatar ? (
        <img
          src={data.user.avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
          <FaUserCircle className="text-white text-xl" />
        </div>
      )}

      <div>
        <p className="font-semibold">{data.user.name}</p>
        <p className="text-sm text-gray-400">{data.user.email}</p>
      </div>
    </div>

    {/* ACTION BUTTONS */}
    <div>
      {/* 1️⃣ Chat already exists */}
      {data.alreadyContact && (
        <button
          onClick={() => {dispatch(openChat(data.id)); dispatch(setActiveTab("all"));
     }}
          className="text-green-500 font-semibold hover:underline"
        >
          View Chat
        </button>
      )}

      {/* 2️⃣ Request already sent */}
      {!data.alreadyContact && data.requestStatus != 'rejected' && 
  data.requestExists &&
  data.requestDirection === "sent" && (
    <div className="relative group">
      <button
        disabled
        className="bg-gray-600 px-4 py-2 rounded cursor-not-allowed"
      >
        Pending
      </button>

      {/* Hover tooltip */}
      <p
        className="absolute left-1/2 -translate-x-1/2 -top-8
          bg-gray-700 text-white text-sm px-2 py-1 rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap"
      >
        Request already sent
      </p>
    </div>
  )}


      {/* 3️⃣ Request received */}
      {!data.alreadyContact &&
        data.requestExists &&
        data.requestDirection === "received" && (
          <button
            onClick={() => acceptRequest(data.requestId)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Accept
          </button>
        )}


{/* 
🔑 CORE CONCEPT (VERY IMPORTANT) 
❌ You must NOT change the other user’s actual name 
✅ You store YOUR personal name for that user

This means:
  Nickname is user-specific
  Different users can save the same person with different names

  | chat_id | user_id | nickname | 
  | ------- | ------- | ----------- | 
  | 10      | 2       | Best Friend | 
  | 10      | 5       | Rahul |

ALTER TABLE chat_members ADD COLUMN nickname VARCHAR(100);
📌 Nickname is per chat / per relationshi

*/}


      {/* 4️⃣ No relation → Add */}
              {!data.alreadyContact &&
(!data.requestExists || data.requestStatus === "rejected") && (
  <button
    onClick={() => handleAddContact(data.user.id)}
    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
    disabled={processing}
  >
    {processing ? (
      <ClipLoader color="white" size={18} />
    ) : (
      "Add"
    )}
  </button>
)}

    </div>
  </div>
)}


          </div>
        </div>
      </section>
    </section>
  );
}
