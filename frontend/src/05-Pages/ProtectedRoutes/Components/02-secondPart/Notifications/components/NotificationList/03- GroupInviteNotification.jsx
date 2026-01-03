export function GroupInviteNotification({ n }) {
  return (
    <div className="relative p-3 border-b border-gray-800 flex justify-between items-center">
      
      {/* 🔵 Unread dot */}
      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-500"></span>

      <p>You were invited to a group</p>

      <button className="bg-blue-600 px-3 py-1 rounded">
        Join
      </button>
    </div>
  );
}
