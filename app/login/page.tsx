"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Typography,
  message,
} from "antd";
import {
  IdcardOutlined,
  LockOutlined,
  PhoneOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { USER_ROLES } from "@/constants";

const { Title, Text } = Typography;

type RecordItem = {
  patientName: string;
  doctorId: string;
  visitId: string;
  status: string;
  note: string;
};

const mockRecords: RecordItem[] = [
  {
    patientName: "张伟",
    doctorId: "D1035",
    visitId: "M-QC-240001",
    status: "待复核",
    note: "血常规指标超范围",
  },
  {
    patientName: "李娜",
    doctorId: "D2077",
    visitId: "M-QC-240002",
    status: "已处理",
    note: "影像资料缺失1张片",
  },
  {
    patientName: "王磊",
    doctorId: "D1035",
    visitId: "M-QC-240003",
    status: "待提交",
    note: "诊疗路径节点遗漏",
  },
  {
    patientName: "赵敏",
    doctorId: "D0880",
    visitId: "M-QC-240004",
    status: "复审中",
    note: "质控项需补充护理记录",
  },
];

export default function LoginPage() {
  const [loginForm] = Form.useForm();
  const [linkForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeForm, setActiveForm] = useState<"login" | "register">("login");
  const router = useRouter();
  const [registering, setRegistering] = useState(false);

  const heroStats = useMemo(
    () => [
      { label: "数据探针", value: "210+", desc: "覆盖质控指标" },
      { label: "响应时间", value: "< 3min", desc: "异常推送" },
      { label: "运维通过率", value: "99.2%", desc: "连续稳定" },
    ],
    []
  );

  const handleRegister = async (values: { phone: string; role: string }) => {
    if (!values.phone || !values.role) {
      message.warning("请填写手机号和角色");
      return;
    }
    if (!/^1\d{10}$/.test(values.phone)) {
      message.error("请输入 11 位国内手机号（模拟）");
      return;
    }
    setRegistering(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: values.phone,
          role: values.role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        message.error(data?.message || "注册失败，请稍后再试");
        return;
      }

      message.success(data.message || "注册成功");
      registerForm.resetFields();
    } catch (error) {
      console.error("Register failed:", error);
      message.error("注册失败，请稍后再试");
    } finally {
      setRegistering(false);
    }
  };

  const setPhoneCookie = (phone: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const expires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toUTCString();
    document.cookie = `qc_phone=${encodeURIComponent(
      phone
    )}; expires=${expires}; path=/`;
  };

  const setRoleCookie = (role: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const expires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toUTCString();
    document.cookie = `qc_role=${encodeURIComponent(
      role
    )}; expires=${expires}; path=/`;
  };

  const handleLogin = async (values: { phone: string; code?: string }) => {
    if (!values.phone) {
      message.warning("请输入手机号");
      return;
    }
    if (values.code && values.code !== "6666") {
      message.error("模拟环境仅支持 6666 验证码");
      return;
    }
    setLoggingIn(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: values.phone }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        message.error(data?.message || "登录失败，请稍后再试");
        return;
      }

      const role = data?.data?.role;

      if (role) {
        setRoleCookie(role);
      }

      message.success(data?.message || "登录成功");
      setPhoneCookie(values.phone);
      setIsLoggedIn(true);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      message.error("登录失败，请稍后再试");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSearch = async (values: {
    patientName: string;
    doctorId: string;
  }) => {
    setSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const normalize = (value: string) => value.trim().toLowerCase();
    const patient = normalize(values.patientName || "");
    const doctor = normalize(values.doctorId || "");

    const result = mockRecords.filter((record) => {
      const matchPatient = patient
        ? record.patientName.toLowerCase().includes(patient)
        : true;
      const matchDoctor = doctor
        ? record.doctorId.toLowerCase().includes(doctor)
        : true;
      return matchPatient && matchDoctor;
    });

    setSearching(false);

    if (!result.length) {
      message.info("未匹配到诊疗记录，请调整关键词重试");
      return;
    }

    message.success(`匹配到 ${result.length} 条模拟数据`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600 p-10 text-white">
          <div>
            <p className="mb-6 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Medical QC Portal
            </p>
            <Title level={2} className="!text-white !text-4xl !font-semibold">
              账号登录 / 关联
            </Title>
            <Text className="mt-4 block max-w-sm text-base text-white/80">
              输入手机号即可进入，无需注册与真实校验。登录后快速关联 “患者姓名 +
              医生工号” 获取诊疗质控样本数据。
            </Text>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="text-sm text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/60">
            模块纯演示，不产生真实诊疗数据。
          </p>
        </section>

        <section className="flex flex-col gap-8 px-8 py-12 lg:px-12">
          <Card
            className="shadow-lg"
            title={activeForm === "login" ? "手机号极速登录" : "快速注册账号"}
            extra={
              <span className="text-xs text-slate-400">
                {activeForm === "login" ? "无需注册" : "模拟环境"}
              </span>
            }
          >
            <div className="mb-6 grid grid-cols-2 gap-2">
              <Button
                type={activeForm === "login" ? "primary" : "default"}
                className="h-11 rounded-xl"
                onClick={() => setActiveForm("login")}
                disabled={activeForm === "login"}
              >
                手机号登录
              </Button>
              <Button
                type={activeForm === "register" ? "primary" : "default"}
                className="h-11 rounded-xl"
                onClick={() => setActiveForm("register")}
                disabled={activeForm === "register"}
              >
                快速注册
              </Button>
            </div>

            <div className="relative min-h-[420px]">
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  activeForm === "login"
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <Form
                  form={loginForm}
                  layout="vertical"
                  size="large"
                  onFinish={handleLogin}
                  requiredMark={false}
                  initialValues={{ code: "6666" }}
                >
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: "请输入手机号" },
                      {
                        pattern: /^1\d{10}$/,
                        message: "请输入 11 位国内手机号（模拟）",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-slate-400" />}
                      placeholder="138****0000"
                      disabled={isLoggedIn}
                    />
                  </Form.Item>

                  <Form.Item name="code" label="验证码">
                    <Input
                      prefix={<LockOutlined className="text-slate-400" />}
                      placeholder="6666"
                      maxLength={4}
                      disabled={isLoggedIn}
                    />
                  </Form.Item>

                  <div className="mb-6 flex items-center justify-between text-sm">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox disabled>记住设备（演示不可更改）</Checkbox>
                    </Form.Item>
                    <span className="text-slate-400">验证码固定为 6666</span>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-12 w-full rounded-xl text-base"
                    disabled={isLoggedIn || loggingIn}
                    loading={loggingIn}
                  >
                    {isLoggedIn ? "已登录" : "直接登录"}
                  </Button>
                </Form>
              </div>

              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  activeForm === "register"
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <Form
                  form={registerForm}
                  layout="vertical"
                  size="large"
                  onFinish={handleRegister}
                  requiredMark={false}
                >
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: "请输入手机号" },
                      {
                        pattern: /^1\d{10}$/,
                        message: "请输入 11 位国内手机号（模拟）",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-slate-400" />}
                      placeholder="138****0000"
                    />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="角色"
                    rules={[{ required: true, message: "请选择角色" }]}
                  >
                    <Select
                      placeholder="请选择角色"
                      optionFilterProp="label"
                      options={USER_ROLES.map((role) => ({
                        label: role.label,
                        value: role.code,
                      }))}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-12 w-full rounded-xl text-base"
                    loading={registering}
                    disabled={registering}
                  >
                    提交注册
                  </Button>
                </Form>
              </div>
            </div>
          </Card>

          <Card
            className="shadow-lg"
            title="患者 / 医生模糊匹配"
            extra={<span className="text-xs text-slate-400">登录后可用</span>}
          >
            {isLoggedIn ? (
              <>
                <Form
                  form={linkForm}
                  layout="vertical"
                  size="large"
                  onFinish={handleSearch}
                  requiredMark={false}
                  className="[&_.ant-form-item-label>label]:text-sm"
                >
                  <Form.Item
                    name="patientName"
                    label="患者姓名（模糊）"
                    rules={[{ required: true, message: "请输入患者姓名" }]}
                  >
                    <Input
                      prefix={<IdcardOutlined className="text-slate-400" />}
                      placeholder="如：张"
                    />
                  </Form.Item>

                  <Form.Item
                    name="doctorId"
                    label="医生工号（模糊）"
                    rules={[{ required: true, message: "请输入医生工号" }]}
                  >
                    <Input
                      prefix={<IdcardOutlined className="text-slate-400" />}
                      placeholder="如：D10"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mb-4 h-12 w-full rounded-xl text-base"
                    icon={<SearchOutlined />}
                    loading={searching}
                  >
                    开始匹配
                  </Button>
                </Form>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                完成手机号登录后，可用患者姓名 + 医生工号快速定位模拟诊疗数据。
              </div>
            )}
          </Card>

          <p className="text-center text-xs text-slate-400">
            手机号 + 验证码登录仅为演示目的，不触达真实服务。
          </p>
        </section>
      </div>
    </div>
  );
}
