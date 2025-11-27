import { NextResponse } from 'next/server';
import patientAIService from '@/lib/deepseek-service';
import { Diagnosis } from '../../../lib/models'; // 根据你的项目结构调整导入路径

export async function POST(request: Request) {
    try {
        const { diagnosisId, patientFeedback } = await request.json();

        // 参数验证
        if (!diagnosisId || !patientFeedback) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少必要参数：diagnosisId 和 patientFeedback'
                },
                { status: 400 }
            );
        }

        // 从真实数据库查询诊疗记录
        const medicalRecord = await getMedicalRecordById(diagnosisId);

        // 调用AI服务
        const aiAdvice = await patientAIService.providePatientAdvice(
            medicalRecord,
            patientFeedback
        );

        return NextResponse.json({
            success: true,
            data: {
                advice: aiAdvice,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('AI建议接口错误:', error);

        return NextResponse.json(
            {
                success: false,
                error: '服务暂时不可用，请稍后重试'
            },
            { status: 500 }
        );
    }
}

// 真实的数据库查询函数
async function getMedicalRecordById(diagnosisId: number): Promise<string> {
    try {
        const diagnosis = await Diagnosis.findByPk(diagnosisId);

        if (!diagnosis) {
            throw new Error(`未找到ID为 ${diagnosisId} 的诊疗记录`);
        }

        // 组合诊疗信息
        const medicalRecord = `
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

        return medicalRecord;
    } catch (error) {
        console.error('查询诊疗记录失败:', error);
        throw new Error('获取诊疗记录失败');
    }
}