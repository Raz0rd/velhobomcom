import { NextRequest, NextResponse } from 'next/server';

const EZZPAG_API_AUTH = process.env.EZZPAG_API_AUTH;
const EZZPAG_API_URL = 'https://api.ezzypag.com.br/v1/transactions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("\n💳 [Ezzpag] Verificando autenticação:", EZZPAG_API_AUTH ? "✓ Token presente" : "✗ Token ausente");
    
    if (!EZZPAG_API_AUTH) {
      console.error("❌ [Ezzpag] EZZPAG_API_AUTH não configurado");
      return NextResponse.json(
        { error: 'Configuração de API Ezzpag não encontrada' },
        { status: 500 }
      );
    }

    // Validar dados obrigatórios
    if (!body.customer?.name || !body.customer?.email || !body.customer?.document?.number) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item no pedido' },
        { status: 400 }
      );
    }

    console.log("📤 [Ezzpag] REQUEST BODY:", JSON.stringify(body, null, 2));

    // Extrair nome do domínio para usar como título do produto
    const getProductTitle = (): string => {
      try {
        const host = request.headers.get('host') || 'obomvelhinho.com';
        const parts = host.split('.'); // ex: ['www', 'obomvelhinho', 'com'] ou ['obomvelhinho', 'com']
        
        // Se o primeiro índice for 'www', usar o índice 1, senão usar o índice 0
        const siteName = parts[0].toLowerCase() === 'www' ? parts[1] : parts[0];
        
        // Capitalizar primeira letra
        return siteName.charAt(0).toUpperCase() + siteName.slice(1);
      } catch (error) {
        console.error("❌ [Ezzpag] Erro ao extrair nome do host:", error);
        return "Obomvelhinho"; // fallback
      }
    };

    const productTitle = getProductTitle();
    console.log("🏷️ [Ezzpag] Nome do produto extraído do domínio:", productTitle);

    // Preparar dados para a API Ezzpag usando dados REAIS do cliente
    const ezzpagPayload = {
      customer: {
        document: {
          number: body.customer.document.number.replace(/\D/g, ''),
          type: 'cpf'
        },
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone.replace(/\D/g, '')
      },
      shipping: {
        address: {
          street: body.customer.address.street,
          streetNumber: body.customer.address.streetNumber,
          zipCode: body.customer.address.zipCode.replace(/\D/g, ''),
          neighborhood: body.customer.address.neighborhood,
          city: body.customer.address.city,
          state: body.customer.address.state,
          country: 'BR'
        },
        fee: 0
      },
      items: body.items.map((item: any) => ({
        tangible: true,
        title: productTitle, // Usa o nome do domínio ao invés do título do produto
        unitPrice: item.unitPrice,
        quantity: item.quantity
      })),
      amount: body.amount,
      paymentMethod: 'pix'
    };
    
    console.log("📤 [Ezzpag] Criando transação PIX...");
    console.log("📤 [Ezzpag] Payload:", JSON.stringify(ezzpagPayload, null, 2));
    
    const response = await fetch(EZZPAG_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${EZZPAG_API_AUTH}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(ezzpagPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error("❌ [Ezzpag] ERROR:", response.status, errorData.message || errorText);
      
      // Extrair mensagem de erro específica da Ezzpag
      let userMessage = 'Erro ao processar pagamento. Tente novamente.';
      const ezzpagError = errorData.message || errorText;
      
      // Verificar erros específicos da Ezzpag (422 retorna array de erros)
      if (response.status === 422) {
        if (ezzpagError.includes('customer.email is invalid')) {
          userMessage = 'Email inválido. Por favor, verifique o email informado.';
        } else if (ezzpagError.includes('customer.phone is invalid')) {
          userMessage = 'Telefone inválido. Por favor, verifique o telefone informado.';
        } else if (ezzpagError.includes('customer.document is invalid')) {
          userMessage = 'CPF inválido. Por favor, verifique o CPF informado.';
        } else if (ezzpagError.includes('customer.name is invalid')) {
          userMessage = 'Nome inválido. Por favor, verifique o nome informado.';
        } else {
          userMessage = 'Dados incompletos ou inválidos. Verifique as informações.';
        }
      } else if (response.status === 400) {
        if (ezzpagError.toLowerCase().includes('cpf')) {
          userMessage = 'CPF inválido. Por favor, verifique os dados e tente novamente.';
        } else if (ezzpagError.toLowerCase().includes('phone')) {
          userMessage = 'Telefone inválido. Por favor, verifique o telefone informado.';
        } else if (ezzpagError.toLowerCase().includes('email')) {
          userMessage = 'Email inválido. Por favor, verifique o email informado.';
        } else {
          userMessage = 'Dados inválidos. Por favor, verifique as informações.';
        }
      } else if (response.status === 401 || response.status === 403) {
        userMessage = 'Erro de autenticação. Entre em contato com o suporte.';
      } else if (response.status >= 500) {
        userMessage = 'Serviço temporariamente indisponível. Tente novamente em instantes.';
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extrair informações da resposta Ezzpag
    const transactionId = data.id?.toString();
    const pixCode = data.pix?.qrcode;
    
    console.log("✅ [Ezzpag] PIX criado com sucesso!");
    console.log(`   - Transaction ID: ${transactionId}`);
    console.log(`   - Valor: R$ ${(data.amount / 100).toFixed(2)}`);
    console.log(`   - Status: ${data.status}`);
    console.log(`   - Cliente: ${data.customer?.name}`);

    // Retornar dados para o frontend
    return NextResponse.json({
      success: true,
      transactionId,
      qrCode: pixCode,
      status: data.status,
      amount: data.amount
    });

  } catch (error) {
    console.error('❌ [Ezzpag] Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar pagamento' },
      { status: 500 }
    );
  }
}
