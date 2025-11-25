"use client";

import { Modal, Timeline } from "antd";

export type ChatMessage = {
  role: string;
  content: string;
};

type ChatListProps = {
  open: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  title?: string;
  emptyText?: string;
};

const roleStyles: Record<
  string,
  { label: string; dotColor: string; textColor: string }
> = {
  doctor: {
    label: "医生",
    dotColor: "bg-[#3aa982]",
    textColor: "text-[#0f5132]",
  },
  patient: {
    label: "患者",
    dotColor: "bg-[#4b7bec]",
    textColor: "text-[#1d3a8a]",
  },
};

const normalizeRole = (role: string) => {
  const lower = role?.toLowerCase() || "";
  if (lower.includes("doctor")) return "doctor";
  if (lower.includes("patient")) return "patient";
  return "other";
};

const getRoleDisplay = (role: string) => {
  const normalized = normalizeRole(role);
  if (normalized === "other") {
    return {
      label: role || "未知",
      dotColor: "bg-[#a1a1aa]",
      textColor: "text-[#1f2937]",
    };
  }
  return roleStyles[normalized];
};

const ChatList = ({
  open,
  messages,
  onClose,
  title = "上诉记录",
  emptyText = "暂无聊天记录",
}: ChatListProps) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="关闭"
      cancelButtonProps={{ style: { display: "none" } }}
    >
      {messages.length === 0 ? (
        <div>{emptyText}</div>
      ) : (
        <div className="max-h-80 overflow-y-auto py-1 pr-2">
          <Timeline
            className="ml-1"
            items={messages.map((item, index) => {
              const roleDisplay = getRoleDisplay(item?.role || "");
              return {
                key: `${item?.role || "unknown"}-${index}`,
                dot: (
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${roleDisplay.dotColor}`}
                  />
                ),
                children: (
                  <div className="text-sm leading-6">
                    <span className={`${roleDisplay.textColor} font-medium`}>
                      {roleDisplay.label}：
                    </span>
                    <span className="text-[#1d1d1f] whitespace-pre-wrap align-middle ml-1 text-base">
                      {item?.content || "-"}
                    </span>
                  </div>
                ),
              };
            })}
          />
        </div>
      )}
    </Modal>
  );
};

export default ChatList;
