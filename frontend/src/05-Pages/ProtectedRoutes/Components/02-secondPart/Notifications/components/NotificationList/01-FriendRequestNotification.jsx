import { useDispatch } from "react-redux";
import { markAsRead } from "../../../../../../../00-app/02-notificationSlice";
import { useAcceptRequests } from "../../../../../../../03-features/02-addContact/03-hook/03-useAcceptRequests";
import { useRejectRequests } from "../../../../../../../03-features/02-addContact/03-hook/04-useRejectRequests";
import { useState } from "react";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export function FriendRequestNotification({ n }) {
  const dispatch = useDispatch();
  const { mutate: acceptRequest } = useAcceptRequests();
  const { mutate: rejectRequest } = useRejectRequests();

  const [processing, setProcessing] = useState(null); 
  // null | "accept" | "reject"

  const isRead = Boolean(n.is_read);

  const isDisabled = processing !== null || isRead

  function handleAcceptRequest(referenceId) {
    if (isDisabled) return;

    setProcessing("accept");

    const formData = new FormData();
    formData.append("reference_id", referenceId);

    acceptRequest(formData, {
      onSuccess: (data) => {
        toast.success(data?.message || "Friend request accepted 🎉");
        dispatch(markAsRead(n.id));
        setProcessing(null);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to accept request ❌"
        );
        setProcessing(null);
      },
    });
  }

  function handleRejectRequest(referenceId) {
    if (isDisabled) return;

    setProcessing("reject");

    const formData = new FormData();
    formData.append("reference_id", referenceId);

    rejectRequest(formData, {
      onSuccess: (data) => {
        toast.success(data?.message || "Friend request rejected 🚫");
        dispatch(markAsRead(n.id));
        setProcessing(null);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to reject request ❌"
        );
        setProcessing(null);
      },
    });
  }

  return (
    <div className="p-3 border-b border-gray-800 flex justify-between items-start">
      {/* LEFT SIDE */}
      <div className="flex gap-2">
        {!isRead && (
          <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
        )}

        <div>
          <p className="font-semibold">New friend request</p>
          <p className="text-sm text-gray-400">
            <span className="font-bold ">{n.name}</span> sent you a request
          </p>

          {isRead && (
            <p className="text-xs text-gray-500 mt-1">
              Request already handled
            </p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAcceptRequest(n.reference_id)}
          disabled={isDisabled}
          className="bg-green-600 px-3 py-1 rounded
                     flex items-center gap-2 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing === "accept" ? (
            <>
              <ClipLoader color="white" size={16} />
              <span>Accepting...</span>
            </>
          ) : (
            "Accept"
          )}
        </button>

        <button
          onClick={() => handleRejectRequest(n.reference_id)}
          disabled={isDisabled}
          className="bg-red-600 px-3 py-1 rounded
                     flex items-center gap-2 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing === "reject" ? (
            <>
              <ClipLoader color="white" size={16} />
              <span>Rejecting...</span>
            </>
          ) : (
            "Reject"
          )}
        </button>
      </div>
    </div>
  );
}
