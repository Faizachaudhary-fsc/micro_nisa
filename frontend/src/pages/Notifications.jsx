import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className="bg-white shadow rounded-lg p-3 mb-3 border"
          >
            <h3 className="font-semibold">
              {n.titleUr || n.title}
            </h3>
            <p className="text-sm text-gray-600">
              {n.messageUr || n.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}