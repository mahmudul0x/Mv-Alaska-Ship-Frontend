import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  Loader2,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Trash2,
  Users,
} from "lucide-react";

import { PageHeader, errorText } from "@/components/staff/ui";
import {
  deleteStaffContactMessage,
  getStaffContactMessages,
  updateStaffContactMessage,
} from "@/lib/api/staff";
import type { ContactMessageStatus, StaffContactMessage } from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/messages")({
  component: MessagesPage,
});

const FILTERS: { value: ContactMessageStatus | "all"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

const STATUS_STYLE: Record<ContactMessageStatus, string> = {
  new: "bg-gold/15 text-gold",
  read: "bg-ocean/10 text-ocean",
  archived: "bg-muted text-muted-foreground",
};

// Full ship charter / corporate leads are the high-value ones — tint them so
// they stand out in the queue; general/family stay neutral.
const INQUIRY_STYLE: Record<string, string> = {
  charter: "bg-emerald-100 text-emerald-700",
  corporate: "bg-emerald-100 text-emerald-700",
  family: "bg-ocean/10 text-ocean",
  general: "bg-muted text-muted-foreground",
};

function MessagesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ContactMessageStatus | "all">("new");

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "contact-messages", filter],
    queryFn: () =>
      getStaffContactMessages(filter === "all" ? undefined : filter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
      updateStaffContactMessage(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "contact-messages"] });
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStaffContactMessage(id),
    onSuccess: () => {
      toast.success("Message deleted.");
      queryClient.invalidateQueries({ queryKey: ["staff", "contact-messages"] });
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const messages = data?.results ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Inquiries submitted through the website contact form."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.value
                ? "bg-ocean text-background"
                : "bg-muted text-muted-foreground hover:text-ocean"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <MessageSquare className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter} messages.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onStatus={(status) => statusMutation.mutate({ id: msg.id, status })}
              onDelete={() => {
                if (confirm(`Delete the message from ${msg.name}?`)) {
                  deleteMutation.mutate(msg.id);
                }
              }}
              busy={
                (statusMutation.isPending && statusMutation.variables?.id === msg.id) ||
                (deleteMutation.isPending && deleteMutation.variables === msg.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageCard({
  msg,
  onStatus,
  onDelete,
  busy,
}: {
  msg: StaffContactMessage;
  onStatus: (status: ContactMessageStatus) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const created = new Date(msg.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all ${
        msg.status === "new" ? "border-gold/40 shadow-luxe" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg leading-tight truncate">{msg.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${
                INQUIRY_STYLE[msg.inquiry_type] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {msg.inquiry_type_display}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase shrink-0 ${STATUS_STYLE[msg.status]}`}
            >
              {msg.status}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{created}</div>
        </div>
        {busy && <Loader2 className="size-4 animate-spin text-gold shrink-0" />}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {msg.email && (
            <a
              href={`mailto:${msg.email}`}
              className="inline-flex items-center gap-1.5 text-ocean hover:text-gold"
            >
              <Mail className="size-3.5" /> {msg.email}
            </a>
          )}
          {msg.phone && (
            <a
              href={`tel:${msg.phone}`}
              className="inline-flex items-center gap-1.5 text-ocean hover:text-gold"
            >
              <Phone className="size-3.5" /> {msg.phone}
            </a>
          )}
          {msg.departure_date && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> {msg.departure_date}
            </span>
          )}
          {msg.guests != null && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-3.5" /> {msg.guests} guest{msg.guests === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {msg.message && (
          <p className="text-sm whitespace-pre-wrap rounded-xl bg-muted/40 px-4 py-3">
            {msg.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {msg.status !== "read" && msg.status !== "archived" && (
            <ActionButton icon={MailOpen} label="Mark read" onClick={() => onStatus("read")} />
          )}
          {msg.status === "archived" ? (
            <ActionButton icon={ArchiveRestore} label="Unarchive" onClick={() => onStatus("read")} />
          ) : (
            <ActionButton icon={Archive} label="Archive" onClick={() => onStatus("archived")} />
          )}
          <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Mail;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        danger
          ? "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
          : "border-border text-ocean hover:border-gold hover:text-gold"
      }`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
