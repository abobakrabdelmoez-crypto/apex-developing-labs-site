export default async function handler(req, res) {
  // السماح بطلبات الإرسال (POST) فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // جلب الرابط السري من إعدادات Vercel بشكل آمن
    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Missing GOOGLE_WEBHOOK_URL environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // تجهيز البيانات لإعادة إرسالها إلى جوجل شيت
    let bodyData;
    if (typeof req.body === 'string') {
      bodyData = req.body;
    } else {
      const params = new URLSearchParams();
      for (const key in req.body) {
        params.append(key, req.body[key]);
      }
      bodyData = params.toString();
    }

    // إرسال البيانات سراً من السيرفر إلى جوجل
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyData,
    });

    // إرجاع رسالة نجاح للواجهة الأمامية
    return res.status(200).json({ success: true, message: 'Data forwarded securely' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
