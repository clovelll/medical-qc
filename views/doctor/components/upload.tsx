"use client";

import { Form, Input, Modal, Select, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { DEPARTMENT_OPTIONS } from "@/constants";

type UploadComponentProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

type FormState = {
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
};

const defaultDepartment = DEPARTMENT_OPTIONS[0]?.code ?? "";

const initialState: FormState = {
  patientPhone: "",
  gender: "女",
  age: "",
  department: defaultDepartment,
  chiefComplaint: "",
  presentIllness: "",
  allergyHistory: "",
  familyHistory: "",
  tcmInspection: "",
  physicalExam: "",
  auxiliaryExam: "",
  tcmDiagnosisPrimary: "",
  tcmDiagnosisSecondary: "",
  treatmentRequest: "",
  prescription: "",
  suggestion: "",
};

const detailFields: { label: string; name: keyof FormState; rows?: number }[] =
  [
    { label: "主诉", name: "chiefComplaint" },
    { label: "现病史", name: "presentIllness" },
    { label: "过敏史", name: "allergyHistory" },
    { label: "家族史", name: "familyHistory" },
    { label: "中医四诊", name: "tcmInspection" },
    { label: "体检", name: "physicalExam" },
    { label: "辅助检查", name: "auxiliaryExam", rows: 4 },
  ];

const UploadComponent = ({
  open,
  onClose,
  onSubmitted,
}: UploadComponentProps) => {
  const [form] = Form.useForm<FormState>();
  const [patientPhones, setPatientPhones] = useState<string[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const fetchPatients = async () => {
      setPatientLoading(true);
      try {
        const response = await fetch("/api/patients");
        if (!response.ok) {
          throw new Error(`Failed to load patients: ${response.status}`);
        }
        const result = await response.json();
        if (isMounted && Array.isArray(result?.data)) {
          setPatientPhones(
            result.data.map((patient: { phone: string }) => patient.phone)
          );
        }
      } catch (error) {
        console.error("获取患者电话失败", error);
        if (isMounted) {
          setPatientPhones([]);
        }
      } finally {
        if (isMounted) {
          setPatientLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const patientOptions = useMemo(
    () =>
      patientPhones.map((phone) => ({
        label: phone,
        value: phone,
      })),
    [patientPhones]
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialState);
    }
  }, [open, form]);

  const handleFinish = async (values: FormState) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/diagnoses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message ?? "保存失败");
      }

      message.success("诊疗信息保存成功");
      onSubmitted?.();
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("提交诊疗信息失败", error);
      const msg =
        error instanceof Error ? error.message : "保存诊疗信息失败，请稍后再试";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="编辑诊疗信息"
      width={1000}
      centered
      maskClosable={false}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      onOk={() => form.submit()}
      confirmLoading={submitting}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <p className="text-sm text-[#8f8f8f] mb-6">
        请填写完整的患者诊疗资料，确保临床信息准确无误
      </p>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialState}
        onFinish={handleFinish}
        className="space-y-8"
      >
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Form.Item
            label="患者电话"
            name="patientPhone"
            rules={[{ required: true, message: "请选择患者电话" }]}
          >
            <Select
              placeholder="请选择"
              loading={patientLoading}
              options={patientOptions}
              showSearch
              optionFilterProp="label"
              filterSort={(a, b) =>
                (a?.label ?? "").localeCompare(b?.label ?? "")
              }
            />
          </Form.Item>
          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: "请选择性别" }]}
          >
            <Select
              options={[
                { label: "女", value: "女" },
                { label: "男", value: "男" },
              ]}
              placeholder="请选择"
            />
          </Form.Item>
          <Form.Item
            label="年龄"
            name="age"
            rules={[{ required: true, message: "请输入年龄" }]}
          >
            <Input placeholder="请输入" inputMode="numeric" />
          </Form.Item>
          <Form.Item
            label="所在科室"
            name="department"
            rules={[{ required: true, message: "请选择科室" }]}
          >
            <Select
              options={DEPARTMENT_OPTIONS.map(({ label, code }) => ({
                label,
                value: code,
              }))}
              placeholder="请选择"
            />
          </Form.Item>
        </section>

        <section className="space-y-6">
          {detailFields.map(({ label, name, rows }) => (
            <Form.Item key={name} label={label} name={name}>
              <Input.TextArea rows={rows ?? 3} placeholder="请输入" />
            </Form.Item>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item label="中医诊断" name="tcmDiagnosisPrimary">
            <Input.TextArea rows={3} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="中西医诊断" name="tcmDiagnosisSecondary">
            <Input.TextArea rows={3} placeholder="请输入" />
          </Form.Item>
        </section>

        <section className="space-y-6">
          <Form.Item label="治疗申请" name="treatmentRequest">
            <Input.TextArea rows={3} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="西、成药处方" name="prescription">
            <Input.TextArea rows={3} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="建议" name="suggestion">
            <Input.TextArea rows={3} placeholder="请输入" />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
};

export default UploadComponent;
