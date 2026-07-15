export default async function handler(req, res) {
  // ════════════════════════════════════════
  // CORS: السماح فقط من نفس الدومين
  // ════════════════════════════════════════
  const allowedOrigins = [
    'https://project-kappa-ten-65.vercel.app',
    'https://apexbusinessdevelopmentlabs.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ];
  
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
  
  if (origin && !isAllowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // السماح بطلبات الإرسال (POST) فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ════════════════════════════════════════
  // Server-Side Rate Limiting (بالذاكرة المؤقتة)
  // ════════════════════════════════════════
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  
  // تنظيف الذاكرة من العناوين القديمة
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > 3600000) rateLimitMap.delete(ip);
  }
  
  if (rateLimitMap.has(clientIP) && (now - rateLimitMap.get(clientIP)) < 3600000) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  try {
    // جلب الرابط السري من إعدادات Vercel بشكل آمن
    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Missing GOOGLE_WEBHOOK_URL environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // ════════════════════════════════════════
    // Input Validation (تنظيف البيانات)
    // ════════════════════════════════════════
    const body = req.body || {};
    
    // التحقق من وجود الحقول المطلوبة
    if (!body.companyName || !body.whatsapp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // التحقق من أن البيانات ليست طويلة جداً (هجمات Buffer)
    const MAX_FIELD_LENGTH = 2000;
    for (const key in body) {
      if (typeof body[key] === 'string' && body[key].length > MAX_FIELD_LENGTH) {
        return res.status(400).json({ error: 'Field too long' });
      }
    }

    // تجهيز البيانات لإعادة إرسالها إلى جوجل شيت
    const params = new URLSearchParams();
    for (const key in body) {
      params.append(key, String(body[key]).trim());
    }

    // إرسال البيانات سراً من السيرفر إلى جوجل
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // تسجيل الإرسال الناجح في الـ Rate Limiter
    rateLimitMap.set(clientIP, now);

    // إرجاع رسالة نجاح للواجهة الأمامية
    return res.status(200).json({ success: true, message: 'Data forwarded securely' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ════════════════════════════════════════
// Rate Limit Storage (in-memory, resets on cold start)
// ════════════════════════════════════════
const rateLimitMap = new Map();
