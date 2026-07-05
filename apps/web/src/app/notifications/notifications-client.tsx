"use client";

import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
  deleteNotificationAction,
  markNotificationReadAction,
} from "@/app/actions";
import { Card, StatusBadge } from "@/components/ui";
import type { NotificationItem } from "@/lib/data/types";

const filters = ["All", "Unread", "High Priority", "Document Updates"];

export function NotificationsClient({
  notifications,
  setupMode,
}: {
  notifications: NotificationItem[];
  setupMode: boolean;
}) {
  const [filter, setFilter] = useState("All");
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "Unread") {
      return notification.unread;
    }

    if (filter === "High Priority") {
      return notification.priority === "High";
    }

    if (filter === "Document Updates") {
      return /document|evidence|upload|certificate/i.test(
        `${notification.title} ${notification.detail}`,
      );
    }

    return true;
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-surface-soft/60 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {filters.map((item) => (
            <button
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                item === filter
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-white text-slate-700 hover:bg-surface-soft"
              }`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {filteredNotifications.map((notification) => (
          <div
            className={`flex flex-col gap-4 border-l-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between ${
              notification.unread
                ? "border-primary bg-emerald-50/80 shadow-[inset_0_0_0_1px_rgba(4,120,87,0.12)]"
                : "border-transparent bg-white"
            }`}
            key={notification.id}
          >
            <div className="flex gap-4">
              <span
                className={`mt-1 rounded-lg p-2 shadow-sm ${
                  notification.unread
                    ? "bg-primary text-white"
                    : "bg-white text-primary"
                }`}
              >
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className={`font-semibold ${
                      notification.unread ? "text-primary-dark" : "text-slate-950"
                    }`}
                  >
                    {notification.title}
                  </h2>
                  {notification.unread && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notification.detail}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {notification.time}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={notification.priority} />
              {notification.unread && (
                <form action={markNotificationReadAction}>
                  <input name="notificationId" type="hidden" value={notification.id} />
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft"
                    disabled={setupMode}
                  >
                    <Check className="h-4 w-4" />
                    Mark read
                  </button>
                </form>
              )}
              <form action={deleteNotificationAction}>
                <input name="notificationId" type="hidden" value={notification.id} />
                <button
                  aria-label={`Delete ${notification.title}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-red-100"
                  disabled={setupMode}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="px-6 py-10 text-sm text-slate-600">
            No reminders match this filter.
          </div>
        )}
      </div>
    </Card>
  );
}
