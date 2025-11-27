import axios from 'axios';
import Diagnosis from './models/diagnosis';

class PatientAIService {
    private apiKey: string;
    private baseURL = 'https://api.deepseek.com/v1';

    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY!;
    }

    async provideAdviceByDiagnosisId(
        diagnosisId: number,
        patientFeedback: string
    ): Promise<string> {
        try {
            console.log('开始查询诊断记录，ID:', diagnosisId);

            // 1. 查询诊断记录
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) {
                throw new Error('未找到对应的诊疗记录');
            }

            console.log('成功查询到诊断记录');

            // 2. 组合诊疗信息
            const medicalRecord = this.buildMedicalRecord(diagnosis);
            console.log('组合的医疗记录完成');

            // 3. 检查API密钥
            if (!this.apiKey) {
                console.log('未找到API密钥，使用模拟响应');
                return this.generateMockAIResponse(diagnosis, patientFeedback);
            }

            console.log('开始调用真实DeepSeek API...');

            // 4. 调用真实DeepSeek API
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: "deepseek-chat",
                    messages: [
                        {

                            role: "system",
                            content: `你是一名专业的患者健康顾问，为患者本人提供健康建议。

回答要求：
1. 直接针对患者本人，不要提"家长"或"家属"
2. 简洁明了，避免过度客套和冗长开场白
3. 重点突出，提供实用的健康建议
4. 保持专业但亲切的语气
5. 用点式列表让内容更清晰易读

重要原则：
- 不要提供医疗诊断
- 强调必要时必须就医
- 所有建议仅供参考`
                        },
                        {
                            role: "user",
                            content: `请根据以下诊疗记录和患者反馈提供出现反馈内容的原因和健康建议：

【诊疗记录】
${medicalRecord}

【患者反馈】
${patientFeedback}

请为患者提供易懂的建议和就医指导：`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            console.log('DeepSeek API调用成功');
            return response.data.choices[0].message.content;

        } catch (error) {
            console.error('DeepSeek API 调用失败:', error);

            // 失败时回退到模拟响应
            console.log('回退到模拟响应');
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (diagnosis) {
                return this.generateMockAIResponse(diagnosis, patientFeedback);
            }
            throw new Error('AI服务暂时不可用，请稍后重试');
        }
    }

    private buildMedicalRecord(diagnosis: Diagnosis): string {
        return `
患者基本信息：${diagnosis.gender}性，${diagnosis.age}岁
就诊科室：${diagnosis.department}
主诉：${diagnosis.chiefComplaint || '无'}
现病史：${diagnosis.presentIllness || '无'}
过敏史：${diagnosis.allergyHistory || '无'}
家族史：${diagnosis.familyHistory || '无'}
体格检查：${diagnosis.physicalExam || '无'}
辅助检查：${diagnosis.auxiliaryExam || '无'}
中医诊断：${diagnosis.tcmDiagnosisPrimary || '无'}${diagnosis.tcmDiagnosisSecondary ? `，${diagnosis.tcmDiagnosisSecondary}` : ''}
治疗方案：${diagnosis.prescription || '无'}
医生建议：${diagnosis.suggestion || '无'}
`.trim();
    }

    private generateMockAIResponse(diagnosis: Diagnosis, feedback: string): string {
        return `🤖 AI健康建议（演示版）：

根据您的诊疗记录和反馈"${feedback}"，为您提供以下建议：

📋 基本情况：
• ${diagnosis.gender}性，${diagnosis.age}岁
• 就诊科室：${diagnosis.department}
• 主要诊断：${diagnosis.tcmDiagnosisPrimary || '暂无'}

💡 健康指导：
1. 注意观察身体反应变化
2. 保持规律作息和饮食
3. 按时服药，不要自行调整
4. 定期复查${diagnosis.department}科

🏥 就医提醒：
如出现以下情况请及时就医：
• 症状持续或加重
• 出现新的不适
• 药物不良反应

⚠️ 免责声明：此为演示数据，真实建议请咨询专业医生。`;
    }
}

const patientAIService = new PatientAIService();
export default patientAIService;












// import Diagnosis from './models/diagnosis';
//
// // 定义诊断记录的类型接口
// interface DiagnosisData {
//     department: string;
//     chiefComplaint: string | null;
//     presentIllness: string | null;
//     tcmDiagnosisPrimary: string | null;
//     prescription: string | null;
// }
//
// class PatientAIService {
//     async provideAdviceByDiagnosisId(
//         diagnosisId: number,
//         patientFeedback: string
//     ): Promise<string> {
//         try {
//             // 1. 查询诊断记录
//             const diagnosis = await Diagnosis.findByPk(diagnosisId);
//             if (!diagnosis) {
//                 throw new Error('未找到对应的诊疗记录');
//             }
//
//             // 2. 模拟AI响应
//             return this.generateMockAIResponse(diagnosis, patientFeedback);
//
//         } catch (error) {
//             console.error('服务错误:', error);
//             throw new Error('服务暂时不可用，请稍后重试');
//         }
//     }
//
//     private generateMockAIResponse(diagnosis: DiagnosisData, feedback: string): string {
//         const responses = [
//             `🤖 AI健康建议：\n\n根据您的诊疗记录和反馈"${feedback}"，建议您：\n1. 多注意休息，避免劳累\n2. 饮食清淡，保持规律作息\n3. 如症状持续，建议复查${diagnosis.department}科\n4. 有任何不适及时联系医生`,
//
//             `💡 AI分析结果：\n\n针对"${feedback}"的情况：\n• 可能是正常的治疗反应\n• 建议继续观察症状变化\n• 保持良好生活习惯\n• 如有疑问随时咨询医生`,
//
//             `👨‍⚕️ AI健康指导：\n\n您的反馈"${feedback}"已收到。建议：\n✓ 按时服药，不要自行调整\n✓ 注意身体反应变化\n✓ 定期复查跟踪病情\n✓ 紧急情况立即就医`
//         ];
//
//         return responses[Math.floor(Math.random() * responses.length)];
//     }
// }
//
// const patientAIService = new PatientAIService();
// export default patientAIService;