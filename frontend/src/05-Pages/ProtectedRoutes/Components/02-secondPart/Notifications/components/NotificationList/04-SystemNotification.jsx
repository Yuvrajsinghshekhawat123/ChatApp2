export function SystemNotification({ n }) {
  return (
    <div className="relative p-3 border-b border-gray-800 text-gray-400">
      
      {/* 🔵 Unread dot */}
      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-500"></span>

      System update available
    </div>
  );
}
