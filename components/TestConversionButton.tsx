'use client';

import { useState } from 'react';

export default function TestConversionButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Gerar valores aleatórios
      const randomValue = (Math.random() * 1000).toFixed(2);
      const randomTransactionId = `TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Enviar conversão para Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL}`,
          'value': randomValue,
          'currency': 'BRL',
          'transaction_id': randomTransactionId
        });

        setMessage(`✅ Conversão enviada! Valor: R$ ${randomValue} | ID: ${randomTransactionId}`);
        console.log('Conversão enviada:', {
          value: randomValue,
          transaction_id: randomTransactionId,
          send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL}`
        });
      } else {
        setMessage('❌ Google Ads não está carregado');
      }
    } catch (error) {
      setMessage('❌ Erro ao enviar conversão');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border-2 border-red-500 max-w-md">
      <h3 className="font-bold text-lg mb-2 text-red-600">🧪 Teste de Conversão</h3>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {loading ? 'Enviando...' : 'Enviar Conversão de Teste'}
      </button>
      {message && (
        <p className="mt-2 text-sm break-words">{message}</p>
      )}
    </div>
  );
}
