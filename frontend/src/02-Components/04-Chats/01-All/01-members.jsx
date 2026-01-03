import { useDispatch, useSelector } from "react-redux";
import { openChat} from "../../../00-app/01-chatSlice";

 export function Members({ data}) {
  const dispatch =useDispatch();
  const activeChatId = useSelector(state => state.chat.activeChatId);
  
  return (
    <div className="w-full px-4">
      <div onClick={(e)=>{ dispatch(openChat(data.id))}}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                     transition-all duration-200 ${activeChatId==data.id ? "bg-[#28353c]":"hover:bg-[#202c33]"}  `}
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br
                       from-amber-600 to-amber-900
                       flex items-center justify-center
                       text-white font-bold text-lg shadow-md"
          >
            {data.name.charAt(0)}
          </div>

           {!!data.isOnline && (
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                   border-2 border-[#111b21] rounded-full"></span>
)}

        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Name & Time */}
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold text-base">
              {data.name}
            </h3>
            <span className="text-xs text-gray-400">

             {new Date(data.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}

              
            </span>
          </div>

          {/* Last Message & Notification */}
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm truncate max-w-[80%]">
              {data.lastMessage} 
            </p>

            {data.unreadCount > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 flex items-center justify-center
                           bg-green-500 text-black text-xs font-bold
                           rounded-full"
              >
                {data.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
