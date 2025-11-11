import { NextRequest, NextResponse } from 'next/server';

const EZZPAG_API_AUTH = process.env.EZZPAG_API_AUTH;
const EZZPAG_API_URL = 'https://api.ezzypag.com.br/v1/transactions';

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const { transactionId } = params;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação não fornecido' },
        { status: 400 }
      );
    }

    if (!EZZPAG_API_AUTH) {
      console.error("❌ [Ezzpag] EZZPAG_API_AUTH não configurado");
      return NextResponse.json(
        { error: 'Configuração de API Ezzpag não encontrada' },
        { status: 500 }
      );
    }

    console.log(`[Ezzpag] Consultando status da transação: ${transactionId}`);

    // Consultar status na API Ezzpag
    const response = await fetch(
      `${EZZPAG_API_URL}/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${EZZPAG_API_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`[Ezzpag] Erro na API: ${response.status}`);
      return NextResponse.json(
        { error: `Erro na API Ezzpag: ${response.status}` },
        { status: response.status }
      );
    }

    const transactionData = await response.json();
    console.log(`[Ezzpag] Status atual: ${transactionData.status}`);

    // Mapear status do Ezzpag para o formato esperado
    // Ezzpag usa: waiting_payment, paid, refused, refunded, etc.
    // Nosso sistema usa: AGUARDANDO_PAGAMENTO, PAID, etc.
    const statusMap: { [key: string]: string } = {
      'waiting_payment': 'AGUARDANDO_PAGAMENTO',
      'paid': 'PAID',
      'refused': 'RECUSADO',
      'refunded': 'REEMBOLSADO',
      'pending': 'AGUARDANDO_PAGAMENTO'
    };

    const mappedStatus = statusMap[transactionData.status] || transactionData.status.toUpperCase();

    return NextResponse.json({
      success: true,
      transactionId: transactionData.id?.toString(),
      status: mappedStatus,
      amount: transactionData.amount,
      paymentMethod: 'pix',
      paidAt: transactionData.paid_at || null,
      isPaid: transactionData.status === 'paid'
    });

  } catch (error) {
    console.error('[Ezzpag] Erro ao consultar status:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar pagamento' },
      { status: 500 }
    );
  }
}
