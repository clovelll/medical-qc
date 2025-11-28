"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import ChatList, { ChatMessage } from "@/components/chatlist";
import { APPEAL_REASONS, DEPARTMENT_OPTIONS } from "@/constants";

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

const APPEAL_STATUS_LABELS: Record<APPEAL_REASONS, string> = {
  [APPEAL_REASONS.PENDING]: "未上诉",
  [APPEAL_REASONS.PROGRESS]: "上诉中",
  [APPEAL_REASONS.APPROVE]: "已回复",
};

const PatientQcList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<MedicalRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    phone: "",
    department: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    phone: "",
    department: "",
  });
  const { current, pageSize } = pagination;
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [appealContent, setAppealContent] = useState("");
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(
    null
  );
  //修改的位置
    const [aiSuggestionModalVisible, setAiSuggestionModalVisible] = useState(false);
    const [viewingAiSuggestion, setViewingAiSuggestion] = useState<MedicalRecord | null>(null);
    const [aiSuggestionContent, setAiSuggestionContent] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
  //在这里
    const parsedAppealHistory = useMemo<ChatMessage[]>(() => {
    if (!viewingRecord?.appealReply) {
      return [];
    }
    try {
      const parsed = JSON.parse(viewingRecord.appealReply);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const [role, content] = Object.entries(entry)[0] || [];
          if (typeof role !== "string") {
            return null;
          }
          return {
            role,
            content: typeof content === "string" ? content : "",
          };
        })
        .filter((item): item is ChatMessage => Boolean(item));
    } catch (error) {
      console.warn("Failed to parse appealReply", error);
      return [];
    }
  }, [viewingRecord]);

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
  }, [current, pageSize, appliedFilters, refreshKey]);

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
  };

  const getDepartmentLabel = (code: string) => {
    return DEPARTMENT_OPTIONS.find((opt) => opt.code === code)?.label || code;
  };

  const handleAppeal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setAppealContent("");
    setAppealModalVisible(true);
  };

  const handleAppealSubmit = async () => {
    if (!appealContent.trim()) {
      message.warning("请输入上诉反馈内容");
      return;
    }
    if (!selectedRecord?.id) {
      message.error("当前记录缺少唯一标识，无法上诉");
      return;
    }
    try {
      setAppealSubmitting(true);
      const response = await fetch(
        `/api/diagnoses/${selectedRecord.id}/appeal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: appealContent.trim(),
            user: "patient",
          }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "提交失败");
      }
      message.success("上诉反馈已提交");
      setRefreshKey((prev) => prev + 1);
      handleAppealCancel();
    } catch (error) {
      console.error("提交上诉失败", error);
      message.error("提交失败，请稍后再试");
    } finally {
      setAppealSubmitting(false);
    }
  };

  const handleAppealCancel = () => {
    setAppealModalVisible(false);
    setSelectedRecord(null);
    setAppealContent("");
  };
  //修改
    const fetchAISuggestion = async (record: MedicalRecord) => {
        setAiLoading(true);
        setAiSuggestionContent(''); // 清空之前的内容
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    diagnosisId: record.id, // 使用记录ID
                    patientFeedback: '患者对当前诊疗方案有疑问，需要AI健康建议'
                }),
            });

            const result = await response.json();
            if (result.success) {
                setAiSuggestionContent(result.data.advice);
            } else {
                message.error(result.error || '获取AI建议失败');
                setAiSuggestionContent('获取AI建议失败，请稍后重试');
            }
        } catch (error) {
            console.error('获取AI建议错误:', error);
            message.error('网络错误，请稍后重试');
            setAiSuggestionContent('网络错误，获取AI建议失败');
        } finally {
            setAiLoading(false);
        }
    };

  const columns: ColumnsType<MedicalRecord> = [
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
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "现病史",
      dataIndex: "presentIllness",
      key: "presentIllness",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "过敏史",
      dataIndex: "allergyHistory",
      key: "allergyHistory",
      width: 150,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "家族史",
      dataIndex: "familyHistory",
      key: "familyHistory",
      width: 150,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中医四诊",
      dataIndex: "tcmInspection",
      key: "tcmInspection",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "体检",
      dataIndex: "physicalExam",
      key: "physicalExam",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "辅助检查",
      dataIndex: "auxiliaryExam",
      key: "auxiliaryExam",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中医诊断",
      dataIndex: "tcmDiagnosisPrimary",
      key: "tcmDiagnosisPrimary",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "中西医诊断",
      dataIndex: "tcmDiagnosisSecondary",
      key: "tcmDiagnosisSecondary",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "治疗申请",
      dataIndex: "treatmentRequest",
      key: "treatmentRequest",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "西、成药处方",
      dataIndex: "prescription",
      key: "prescription",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "建议",
      dataIndex: "suggestion",
      key: "suggestion",
      width: 200,
      ellipsis: { showTitle: false },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "上诉状态",
      dataIndex: "appealStatus",
      key: "appealStatus",
      width: 120,
      fixed: "right",
      render: (status: APPEAL_REASONS | null = APPEAL_REASONS.PENDING) =>
        status
          ? APPEAL_STATUS_LABELS[status]
          : APPEAL_STATUS_LABELS[APPEAL_REASONS.PENDING],
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => {
            if (record.appealStatus === APPEAL_REASONS.PROGRESS) {
                return (
                    <Space size="middle">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setViewingAiSuggestion(record);
                                setAiSuggestionModalVisible(true);
                                fetchAISuggestion(record); // 添加这行，自动调用AI接口
                            }}
                        >
                            AI建议
                        </Button>
                    </Space>
                );
            }
            return (
                <Space size="middle">
                    {record.appealReply && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setViewingRecord(record);
                                setViewModalVisible(true);
                            }}
                        >
                            查看
                        </Button>
                    )}
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleAppeal(record)}
                    >
                        上诉
                    </Button>
                </Space>
            );
      },
      // render: (_, record) => {
      //   if (record.appealStatus === APPEAL_REASONS.PROGRESS) {
      //     return <span>-</span>;
      //   }
      //   return (
      //     <Space size="middle">
      //       {record.appealReply && (
      //         <Button
      //           type="link"
      //           size="small"
      //           onClick={() => {
      //             setViewingRecord(record);
      //             setViewModalVisible(true);
      //           }}
      //         >
      //           查看
      //         </Button>
      //       )}
      //       <Button
      //         type="link"
      //         size="small"
      //         onClick={() => handleAppeal(record)}
      //       >
      //         上诉
      //       </Button>
      //     </Space>
      //   );
      // },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1d1d1f]">诊疗记录</h2>
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
      <Modal
        title="上诉反馈"
        open={appealModalVisible}
        onOk={handleAppealSubmit}
        onCancel={handleAppealCancel}
        confirmLoading={appealSubmitting}
        okText="提交"
        cancelText="取消"
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-600">
            当前记录：{selectedRecord?.patientPhone || "-"}
          </div>
          <Input.TextArea
            rows={4}
            placeholder="请输入上诉内容"
            value={appealContent}
            onChange={(e) => setAppealContent(e.target.value)}
          />
        </div>
      </Modal>
      <ChatList
        open={viewModalVisible}
        messages={parsedAppealHistory}
        onClose={() => {
          setViewModalVisible(false);
          setViewingRecord(null);
        }}
      />
        {/* AI建议弹窗，修改在这里 */}
        <Modal
            title="AI健康建议"
            open={aiSuggestionModalVisible}
            onCancel={() => {
                setAiSuggestionModalVisible(false);
                setViewingAiSuggestion(null);
                setAiSuggestionContent(''); // 添加这行
            }}
            footer={[
                <Button key="close" onClick={() => {
                    setAiSuggestionModalVisible(false);
                    setViewingAiSuggestion(null);
                    setAiSuggestionContent(''); // 添加这行
                }}>
                    关闭
                </Button>
            ]}
            width={700}
        >
            <div className="p-4">
                {aiLoading ? (
                    <div className="text-center py-8">
                        <div>AI正在分析您的诊疗记录，请稍候...</div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-6">
                        {aiSuggestionContent || "暂无AI建议内容"}
                    </div>
                )}
            </div>
        </Modal>

    </div>
  );
};

export default PatientQcList;
