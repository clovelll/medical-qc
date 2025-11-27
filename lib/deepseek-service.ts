import axios from 'axios';

class PatientAIService {
    private apiKey: string = process.env.DEEPSEEK_API_KEY || '';
    private baseURL = 'https://api.deepseek.com/v1';

    // 为患者提供健康建议
    async providePatientAdvice(medicalRecord: string, patientFeedback: string): Promise<string> {
        try {
            // 如果没有API密钥，返回模拟数据
            if (!this.apiKey) {
                return this.generateMockResponse(patientFeedback);
            }

            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: `你是一名患者健康顾问，为患者提供健康建议。
请用简洁明了的语言，直接针对患者本人。
重要原则：
- 不要提供医疗诊断
- 强调必要时必须就医
- 所有建议仅供参考`
                        },
                        {
                            role: "user",
                            content: `请根据以下诊疗记录和患者反馈提供建议：

诊疗记录：${medicalRecord}

患者反馈：${patientFeedback}

请提供实用的健康建议：`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('AI服务调用失败:', error);
            // 失败时返回模拟数据
            return this.generateMockResponse(patientFeedback);
        }
    }

    private generateMockResponse(feedback: string): string {
        return `AI健康建议（演示版）：

根据您的反馈："${feedback}"

建议如下：
1. 注意休息，保证充足睡眠
2. 饮食清淡，避免刺激性食物
3. 如症状持续，请及时联系医生复查
4. 按时服药，不要自行调整剂量

温馨提示：如有紧急情况请立即就医。`;
    }
}

const patientAIService = new PatientAIService();
export default patientAIService;