"use client";

import { Button, Input, Modal, Select, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import ChatList, { ChatMessage } from "@/components/chatlist";
import { APPEAL_REASONS, DEPARTMENT_OPTIONS } from "@/constants";
import UploadComponent from "./upload";

type MedicalRecord = {
  id?: number;
  patientPhone: string;
  gender: string;
  age: string;
  department: string;
  chiefComplaint: string;
  presentIllness: string;
  allergyHistory: string;
  familyHistory: string;
  tcmInspection: string;
  physicalExam: string;
  auxiliaryExam: string;
  tcmDiagnosisPrimary: string;
  tcmDiagnosisSecondary: string;
  treatmentRequest: string;
  prescription: string;
  suggestion: string;
  appealStatus?: APPEAL_REASONS | null;
  appealReply?: string | null;
  createdAt?: string;
};

type AppealMessage = ChatMessage;

const APPEAL_STATUS_LABELS: Record<APPEAL_REASONS, string> = {
  [APPEAL_REASONS.PENDING]: "未上诉",
  [APPEAL_REASONS.PROGRESS]: "上诉中",
  [APPEAL_REASONS.APPROVE]: "已回复",
};

const QcList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<MedicalRecord[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    phone: "",
    department: "",
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(
    null
  );
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyRecord, setReplyRecord] = useState<MedicalRecord | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const parsedAppealHistory = useMemo<AppealMessage[]>(() => {
    if (!viewingRecord?.appealReply) {
      return [];
    }
    try {
      const parsed = JSON.parse(viewingRecord.appealReply);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const mapped = parsed
        .map((entry): AppealMessage | null => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const entries = Object.entries(entry as Record<string, unknown>);
          const first = entries[0];
          if (!first) {
            return null;
          }
          const [role, content] = first;
          if (!role) {
            return null;
          }
          return {
            role,
            content: typeof content === "string" ? content : "",
          };
        })
        .filter((item): item is AppealMessage => Boolean(item));
      return mapped;
    } catch (error) {
      console.warn("Failed to parse appealReply", error);
      return [];
    }
  }, [viewingRecord]);

  const [appliedFilters, setAppliedFilters] = useState({
    phone: "",
    department: "",
  });

  const handleReplyOpen = (record: MedicalRecord) => {
    setReplyRecord(record);
    setReplyContent("");
    setReplyModalOpen(true);
  };

  const handleReplyCancel = () => {
    setReplyModalOpen(false);
    setReplyRecord(null);
    setReplyContent("");
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      message.warning("请输入回复内容");
      return;
    }
    if (!replyRecord?.id) {
      message.error("当前记录缺少唯一标识，无法回复");
      return;
    }
    try {
      setReplySubmitting(true);
      const response = await fetch(`/api/diagnoses/${replyRecord.id}/appeal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          user: "doctor",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "回复失败");
      }
      message.success("回复已提交");
      handleReplyCancel();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("提交回复失败", error);
      message.error(
        error instanceof Error ? error.message : "回复失败，请稍后再试"
      );
    } finally {
      setReplySubmitting(false);
    }
  };

  const { current, pageSize } = pagination;

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: current.toString(),
          limit: pageSize.toString(),
        });
        if (appliedFilters.phone.trim()) {
          params.append("patientPhone", appliedFilters.phone.trim());
        }
        if (appliedFilters.department) {
          params.append("department", appliedFilters.department);
        }
        const response = await fetch(`/api/diagnoses?${params.toString()}`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data)) {
          setDataSource(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.pagination?.total ?? prev.total,
          }));
        } else {
          setDataSource([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch (error) {
        console.error("获取诊疗记录失败", error);
        setDataSource([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [current, pageSize, refreshKey, appliedFilters]);

  const handleTableChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    setAppliedFilters({ ...filters });
    setRefreshKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setFilters({
      phone: "",
      department: "",
    });
    setAppliedFilters({
      phone: "",
      department: "",
    });
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    setRefreshKey((prev) => prev + 1);
  };

  const getDepartmentLabel = (code: string) => {
    return DEPARTMENT_OPTIONS.find((opt) => opt.code === code)?.label || code;
  };

  const columns: ColumnsType<MedicalRecord> = [
    {
      title: "患者电话",
      dataIndex: "patientPhone",
      key: "patientPhone",
      width: 120,
      fixed: "left",
    },
    {
      title: "性别",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      render: (gender: string) => (
        <Tag color={gender === "男" ? "blue" : "pink"}>{gender}</Tag>
      ),
    },
    {
      title: "年龄",
      dataIndex: "age",
      key: "age",
      width: 80,
    },
    {
      title: "所在科室",
      dataIndex: "department",
      key: "department",
      width: 120,
      render: (department: string) => getDepartmentLabel(department),
    },
    {
      title: "主诉",
      dataIndex: "chiefComplaint",
      key: "chiefComplaint",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "现病史",
      dataIndex: "presentIllness",
      key: "presentIllness",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "过敏史",
      dataIndex: "allergyHistory",
      key: "allergyHistory",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "家族史",
      dataIndex: "familyHistory",
      key: "familyHistory",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中医四诊",
      dataIndex: "tcmInspection",
      key: "tcmInspection",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "体检",
      dataIndex: "physicalExam",
      key: "physicalExam",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "辅助检查",
      dataIndex: "auxiliaryExam",
      key: "auxiliaryExam",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中医诊断",
      dataIndex: "tcmDiagnosisPrimary",
      key: "tcmDiagnosisPrimary",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中西医诊断",
      dataIndex: "tcmDiagnosisSecondary",
      key: "tcmDiagnosisSecondary",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "治疗申请",
      dataIndex: "treatmentRequest",
      key: "treatmentRequest",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "西、成药处方",
      dataIndex: "prescription",
      key: "prescription",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "建议",
      dataIndex: "suggestion",
      key: "suggestion",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "上诉状态",
      dataIndex: "appealStatus",
      key: "appealStatus",
      width: 120,
      fixed: "right",
      render: (status: APPEAL_REASONS | null = APPEAL_REASONS.PENDING) => {
        const currentStatus = status ?? APPEAL_REASONS.PENDING;
        const colorMap: Record<APPEAL_REASONS, string> = {
          [APPEAL_REASONS.PENDING]: "default",
          [APPEAL_REASONS.PROGRESS]: "gold",
          [APPEAL_REASONS.APPROVE]: "green",
        };
        return (
          <Tag color={colorMap[currentStatus]}>
            {APPEAL_STATUS_LABELS[currentStatus]}
          </Tag>
        );
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setViewingRecord(record);
              setViewModalOpen(true);
            }}
          >
            查看
          </Button>
          {record.appealStatus === APPEAL_REASONS.PROGRESS && (
            <Button
              type="link"
              size="small"
              onClick={() => handleReplyOpen(record)}
            >
              回复
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1d1d1f]">诊疗记录</h2>
        <Button
          type="primary"
          onClick={() => setUploadOpen(true)}
          className="bg-[#3aa982] hover:bg-[#2d8864]"
        >
          上传诊断记录
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder="患者电话"
          value={filters.phone}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, phone: e.target.value }))
          }
          style={{ width: 200 }}
        />
        <Select
          placeholder="所在科室"
          allowClear
          value={filters.department || undefined}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, department: value || "" }))
          }
          options={DEPARTMENT_OPTIONS.map((opt) => ({
            label: opt.label,
            value: opt.code,
          }))}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleSearch}>
          查询
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={(record) => record.id?.toString() || record.patientPhone}
        scroll={{ x: 2800 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: handleTableChange,
        }}
      />
      <ChatList
        open={viewModalOpen}
        messages={parsedAppealHistory}
        onClose={() => {
          setViewModalOpen(false);
          setViewingRecord(null);
        }}
      />
      <Modal
        title="回复上诉"
        open={replyModalOpen}
        onCancel={handleReplyCancel}
        onOk={handleReplySubmit}
        confirmLoading={replySubmitting}
        okText="提交"
        cancelText="取消"
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-600">
            当前记录：{replyRecord?.patientPhone || "-"}
          </div>
          <Input.TextArea
            rows={4}
            placeholder="请输入回复内容"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
        </div>
      </Modal>
      <UploadComponent
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmitted={() => {
          setUploadOpen(false);
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default QcList;
