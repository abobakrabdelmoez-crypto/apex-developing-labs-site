/**
 * APEX DEVELOPING LABS — Admin Board Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadRequests();
});

function loadRequests() {
  const container = document.getElementById('requestsContainer');
  const requests = JSON.parse(localStorage.getItem('apex_requests') || '[]');
  
  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        <h3 class="heading-4">لا توجد طلبات جديدة</h3>
        <p class="body-sm">عندما يقوم عميل بملء نموذج المراجعة الاستراتيجية، سيظهر طلبه هنا.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  // Security Function to prevent XSS (Cross-Site Scripting)
  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };
  
  requests.forEach(req => {
    html += `
      <div class="request-card">
        <div class="request-card__header">
          <div>
            <h3 class="request-card__title">${escapeHTML(req.companyName)}</h3>
            <div class="request-card__meta">${escapeHTML(req.date)} &bull; قطاع ${escapeHTML(req.sector)}</div>
          </div>
          <span class="request-badge">طلب جديد</span>
        </div>
        
        <div class="request-grid">
          <div class="data-group">
            <span class="data-label">واتساب</span>
            <span class="data-value" dir="ltr" style="text-align: right;">${escapeHTML(req.whatsapp)}</span>
          </div>
          <div class="data-group">
            <span class="data-label">البريد الإلكتروني</span>
            <span class="data-value">${escapeHTML(req.email) || '-'}</span>
          </div>
          <div class="data-group">
            <span class="data-label">لينكد إن</span>
            <span class="data-value">${req.linkedin ? `<a href="${escapeHTML(req.linkedin)}" target="_blank" style="color: var(--color-navy-500); text-decoration: underline;">فتح الرابط</a>` : '-'}</span>
          </div>
          <div class="data-group">
            <span class="data-label">انستجرام</span>
            <span class="data-value">${escapeHTML(req.instagram) || '-'}</span>
          </div>
          <div class="data-group">
            <span class="data-label">الموقع الجغرافي</span>
            <span class="data-value">${escapeHTML(req.location)}</span>
          </div>
          <div class="data-group">
            <span class="data-label">الفريق الحالي</span>
            <span class="data-value">${formatTeam(req.hasTeam)}</span>
          </div>
          <div class="data-group">
            <span class="data-label">الحضور الرقمي</span>
            <span class="data-value">${formatDigital(req.digitalPresence)}</span>
          </div>
          <div class="data-group">
            <span class="data-label">جاهزية الاستثمار</span>
            <span class="data-value">${formatInvest(req.readyToInvest)}</span>
          </div>
        </div>
        
        <div class="request-grid">
          <div class="data-group data-full">
            <span class="data-label" style="margin-bottom: 8px; display: block;">الرؤية خلال السنتين القادمتين</span>
            <span class="data-value" style="line-height: 1.6;">${escapeHTML(req.vision)}</span>
          </div>
          <div class="data-group data-full">
            <span class="data-label" style="margin-bottom: 8px; display: block;">التحدي الأكبر حالياً</span>
            <span class="data-value" style="line-height: 1.6;">${escapeHTML(req.challenge)}</span>
          </div>
          ${req.triedBefore ? `
          <div class="data-group data-full">
            <span class="data-label" style="margin-bottom: 8px; display: block;">محاولات سابقة لم تنجح</span>
            <span class="data-value" style="line-height: 1.6;">${escapeHTML(req.triedBefore)}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function clearRequests() {
  if(confirm('هل أنت متأكد من مسح جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.')) {
    localStorage.removeItem('apex_requests');
    loadRequests();
  }
}

// Helpers
function formatTeam(val) {
  const map = {
    'yes-both': 'مبيعات وتسويق',
    'yes-sales': 'مبيعات فقط',
    'yes-marketing': 'تسويق فقط',
    'no': 'لا يوجد فريق'
  };
  return map[val] || val || '-';
}

function formatDigital(val) {
  const map = {
    'website-social-ads': 'موقع + سوشيال ميديا + إعلانات',
    'website-social': 'موقع + سوشيال ميديا فقط',
    'social-only': 'سوشيال ميديا فقط',
    'minimal': 'حضور بسيط جدًا',
    'none': 'لا يوجد حضور رقمي'
  };
  return map[val] || val || '-';
}

function formatInvest(val) {
  const map = {
    'yes-now': 'نعم، مستعدون الآن',
    'yes-soon': 'نعم، خلال شهرين',
    'exploring': 'نستكشف الخيارات',
    'no-budget': 'لا توجد ميزانية حاليًا'
  };
  return map[val] || val || '-';
}
