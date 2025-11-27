import { NextRequest, NextResponse } from 'next/server';
import patientAIService from '@/lib/deepseek-service';

export async function POST(request: NextRequest) {
    try {
        const { diagnosisId, patientFeedback } = await request.json();

        if (!diagnosisId || !patientFeedback) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少必要参数：diagnosisId 和 patientFeedback'
                },
                { status: 400 }
            );
        }

        const aiAdvice = await patientAIService.provideAdviceByDiagnosisId(
            diagnosisId,
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
                error: error instanceof Error ? error.message : 'AI服务暂时不可用'
            },
            { status: 500 }
        );
    }
}