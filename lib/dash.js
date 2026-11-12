export const L = {
  pending: 'قيد الانتظار', confirmed: 'مؤكد', preparing: 'قيد التجهيز', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي', returned: 'مرتجع',
  picked_up: 'تم الاستلام', in_transit: 'في الطريق', out_for_delivery: 'خرج للتسليم', failed: 'فشل',
  paid: 'مدفوع', refunded: 'مسترد', requested: 'مطلوب', approved: 'موافق عليه', rejected: 'مرفوض', received: 'تم استلامه', closed: 'مغلق',
  open: 'مفتوحة', in_progress: 'قيد المعالجة', resolved: 'تم الحل', needs_inspection: 'يحتاج فحص',
  customer: 'عميل', company: 'شركة', admin: 'أدمن', support: 'دعم', courier: 'شحن',
  active: 'فعال', suspended: 'موقوف', under_review: 'تحت المراجعة',
  paymob: 'Paymob', fawry: 'Fawry', meeza: 'Meeza', vodafone_cash: 'Vodafone Cash', cod: 'عند الاستلام',
  new: 'جديد', used: 'مستعمل', refurbished: 'مجدّد', true: 'فعال', false: 'معطّل', router: 'راوتر', switch: 'سويتش', percent: 'نسبة %', fixed: 'مبلغ ثابت', order: 'الطلبات', payment: 'المدفوعات', shipping: 'الشحن', return: 'المرتجعات', technical: 'دعم فني', other: 'أخرى', system: 'النظام', ready: 'جاهز للشحن',
};
export const GOV = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];
const O = {
  order: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'],
  ship: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
  ret: ['requested', 'approved', 'rejected', 'received', 'refunded', 'closed'],
  tk: ['open', 'in_progress', 'resolved', 'closed'],
  role: ['customer', 'company', 'admin', 'support', 'courier'],
  ust: ['active', 'suspended', 'under_review'],
  apr: ['pending', 'approved', 'rejected'],
  pay: ['pending', 'paid', 'failed', 'refunded'],
  tf: ['true', 'false'],
  sub: ['pending', 'needs_inspection', 'approved', 'rejected'],
  pout: ['requested', 'paid', 'rejected'],
};
// cols: [key,label,fmt?]  edit: [col,opts,roles]  create.fields: [name,label,type|options,optional?]
export const CFG = {
  orders: { t: 'الطلبات', table: 'orders', link: ['order_no', (id) => `/dashboard/orders/${id}`], cols: [['order_no', '#'], ['guest_name', 'العميل'], ['ship_address', 'العنوان'], ['total', 'الإجمالي', 'egp'], ['status', 'الحالة', 'l'], ['created_at', 'التاريخ', 'd']], edit: [['status', O.order, ['admin', 'support']]] },
  products: { t: 'المنتجات', table: 'products', cols: [['name', 'الاسم'], ['brand', 'الماركة'], ['condition', 'الحالة', 'l'], ['price', 'السعر', 'egp'], ['discount_pct', 'خصم %'], ['stock', 'المخزون'], ['is_active', 'الحالة', 'l']], edit: [['name', 'text', ['admin', 'company']], ['price', 'number', ['admin', 'company']], ['discount_pct', 'number', ['admin', 'company']], ['stock', 'number', ['admin', 'company']], ['is_active', O.tf, ['admin', 'company']]], del: ['admin', 'company'], open: (id) => `/dashboard/products/${id}`,
    create: { roles: ['admin', 'company'], fields: [['name', 'اسم المنتج'], ['kind', 'النوع', ['router', 'switch']], ['condition', 'الحالة', ['new', 'used', 'refurbished']], ['brand', 'الماركة', 'text', 1], ['model', 'الموديل', 'text', 1], ['serial_number', 'Serial', 'text', 1], ['sku', 'SKU', 'text', 1], ['price', 'السعر', 'number'], ['wholesale_price', 'سعر الجملة', 'number', 1], ['discount_pct', 'خصم %', 'number', 1], ['stock', 'المخزون', 'number'], ['weight_kg', 'الوزن (كجم)', 'number', 1], ['warehouse_id', 'المخزن', 'whs', 1], ['category_id', 'القسم', 'cats', 1], ['description', 'الوصف', 'text', 1], ['images', 'الصور', 'images', 1]] } },
  users: { t: 'المستخدمون', table: 'profiles', cols: [['email', 'البريد'], ['full_name', 'الاسم'], ['role', 'النوع', 'l'], ['status', 'الحالة', 'l'], ['created_at', 'التسجيل', 'd']], edit: [['role', O.role, ['admin']], ['status', O.ust, ['admin']]] },
  companies: { t: 'الشركات', table: 'companies', cols: [['name', 'الشركة'], ['phone', 'الهاتف'], ['commercial_record', 'السجل التجاري'], ['commercial_record_url', 'ملف السجل', 'doc'], ['tax_number', 'البطاقة الضريبية'], ['tax_card_url', 'ملف البطاقة', 'doc'], ['commission_pct', 'العمولة %'], ['approval', 'الاعتماد', 'l']], edit: [['approval', O.apr, ['admin']], ['commission_pct', 'number', ['admin']]] },
  categories: { t: 'الأقسام', table: 'categories', cols: [['name', 'الاسم'], ['slug', 'الرابط']], del: ['admin'], create: { roles: ['admin'], fields: [['name', 'اسم القسم'], ['slug', 'الرابط (إنجليزي)']] } },
  coupons: { t: 'الكوبونات والعروض', table: 'coupons', cols: [['code', 'الكود'], ['type', 'النوع', 'l'], ['value', 'القيمة'], ['min_order', 'حد أدنى', 'egp'], ['used_count', 'مرات الاستخدام'], ['expires_at', 'ينتهي'], ['is_active', 'الحالة', 'l']], edit: [['is_active', O.tf, ['admin']]], del: ['admin'],
    create: { roles: ['admin'], fields: [['code', 'الكود'], ['type', 'النوع', ['percent', 'fixed']], ['value', 'القيمة', 'number'], ['min_order', 'حد أدنى للطلب', 'number', 1], ['max_uses', 'أقصى استخدام', 'number', 1], ['expires_at', 'تاريخ الانتهاء', 'date', 1]] } },
  payments: { t: 'المدفوعات', table: 'payments', cols: [['method', 'الوسيلة', 'l'], ['amount', 'المبلغ', 'egp'], ['status', 'الحالة', 'l'], ['ref_no', 'المرجع'], ['created_at', 'التاريخ', 'd']], edit: [['status', O.pay, ['admin']]] },
  shipments: { t: 'الشحنات', table: 'shipments', cols: [['ship_name', 'المستلم'], ['ship_phone', 'الهاتف'], ['ship_address', 'العنوان'], ['tracking_no', 'رقم التتبع'], ['expected_at', 'التسليم المتوقع', 'd'], ['status', 'الحالة', 'l']], edit: [['status', O.ship, ['admin', 'support', 'courier']], ['tracking_no', 'text', ['admin', 'support', 'courier']], ['expected_at', 'date', ['admin', 'support']], ['courier_id', 'couriers', ['admin'], 'المندوب']] },
  shipments_new: { t: 'الشحنات الجديدة', table: 'shipments', cols: [['ship_name', 'المستلم'], ['ship_phone', 'الهاتف'], ['ship_address', 'العنوان'], ['tracking_no', 'رقم التتبع'], ['expected_at', 'التسليم المتوقع', 'd'], ['status', 'الحالة', 'l']], edit: [['status', O.ship, ['admin', 'support', 'courier']], ['tracking_no', 'text', ['admin', 'support', 'courier']], ['expected_at', 'date', ['admin', 'support']], ['courier_id', 'couriers', ['admin'], 'المندوب']], filter: ['status', ['pending']] },
  shipments_active: { t: 'قيد التوصيل', table: 'shipments', cols: [['ship_name', 'المستلم'], ['ship_phone', 'الهاتف'], ['ship_address', 'العنوان'], ['tracking_no', 'رقم التتبع'], ['expected_at', 'التسليم المتوقع', 'd'], ['status', 'الحالة', 'l']], edit: [['status', O.ship, ['admin', 'support', 'courier']], ['tracking_no', 'text', ['admin', 'support', 'courier']], ['expected_at', 'date', ['admin', 'support']], ['courier_id', 'couriers', ['admin'], 'المندوب']], filter: ['status', ['picked_up', 'in_transit', 'out_for_delivery']] },
  shipments_done: { t: 'الشحنات المنجزة', table: 'shipments', cols: [['ship_name', 'المستلم'], ['ship_phone', 'الهاتف'], ['ship_address', 'العنوان'], ['tracking_no', 'رقم التتبع'], ['expected_at', 'التسليم المتوقع', 'd'], ['status', 'الحالة', 'l']], edit: [['status', O.ship, ['admin', 'support', 'courier']], ['tracking_no', 'text', ['admin', 'support', 'courier']], ['expected_at', 'date', ['admin', 'support']], ['courier_id', 'couriers', ['admin'], 'المندوب']], filter: ['status', ['delivered', 'failed', 'returned']] },
  returns: { t: 'المرتجعات', table: 'returns', cols: [['reason', 'السبب'], ['status', 'الحالة', 'l'], ['refund_amount', 'الاسترداد', 'egp'], ['inspection_note', 'ملاحظات الفحص'], ['created_at', 'التاريخ', 'd']], edit: [['status', O.ret, ['admin', 'support']], ['status', ['requested', 'approved', 'rejected'], ['company']], ['refund_amount', 'number', ['admin', 'support']], ['inspection_note', 'text', ['admin', 'support']]] },
  tickets: { t: 'التذاكر والدعم', table: 'tickets', link: ['subject', (id) => `/dashboard/tickets/${id}`], cols: [['subject', 'الموضوع'], ['department', 'القسم', 'l'], ['status', 'الحالة', 'l'], ['created_at', 'التاريخ', 'd']], edit: [['status', O.tk, ['admin', 'support']], ['assigned_to', 'staff', ['admin', 'support'], 'المسؤول']], create: { roles: ['customer', 'company'], owner: 1, fields: [['subject', 'موضوع التذكرة'], ['department', 'القسم', ['order', 'payment', 'shipping', 'return', 'technical', 'other']], ['order_id', 'الطلب المرتبط', 'orders', 1]] } },
  addresses: { t: 'عناويني', table: 'addresses', cols: [['governorate', 'المحافظة'], ['city', 'المدينة'], ['address', 'العنوان'], ['phone', 'الهاتف']], del: ['customer', 'company'], create: { roles: ['customer', 'company'], owner: 1, fields: [['governorate', 'المحافظة', GOV], ['city', 'المدينة'], ['address', 'العنوان بالتفصيل'], ['phone', 'هاتف', 'text', 1]] } },
  sell: { t: 'بيع جهاز مستعمل', table: 'device_submissions', cols: [['title', 'الجهاز'], ['serial_number', 'Serial'], ['asking_price', 'السعر المطلوب', 'egp'], ['status', 'الحالة', 'l'], ['created_at', 'التاريخ', 'd']],
    create: { roles: ['customer', 'company'], owner: 1, fields: [['title', 'اسم الجهاز'], ['kind', 'النوع', ['router', 'switch']], ['brand', 'الماركة'], ['model', 'الموديل', 'text', 1], ['serial_number', 'Serial Number'], ['asking_price', 'السعر المطلوب', 'number'], ['notes', 'وصف الحالة', 'text', 1], ['images', 'صور الجهاز', 'images']] } },
  submissions: { t: 'أجهزة مستعملة للمراجعة', table: 'device_submissions', cols: [['title', 'الجهاز'], ['brand', 'الماركة'], ['serial_number', 'Serial'], ['asking_price', 'السعر', 'egp'], ['status', 'الحالة', 'l']], edit: [['status', O.sub, ['admin']]] },
  payouts: { t: 'طلبات السحب', table: 'payouts', cols: [['amount', 'المبلغ', 'egp'], ['status', 'الحالة', 'l'], ['created_at', 'التاريخ', 'd']], edit: [['status', O.pout, ['admin']]] },
  warehouses: { t: 'المخازن', table: 'warehouses', cols: [['name', 'المخزن'], ['city', 'المدينة'], ['address', 'العنوان'], ['manager_name', 'المسؤول'], ['phone', 'الهاتف'], ['is_active', 'الحالة', 'l']], edit: [['is_active', O.tf, ['admin']]], del: ['admin'], create: { roles: ['admin'], fields: [['name', 'اسم المخزن'], ['city', 'المدينة'], ['address', 'العنوان'], ['manager_name', 'المسؤول', 'text', 1], ['phone', 'الهاتف', 'text', 1]] } },
  platform: { t: 'إعدادات المنصة', table: 'platform_settings', cols: [['label', 'الإعداد'], ['value', 'القيمة']], edit: [['value', 'number', ['admin']]] },
  audit: { t: 'سجل العمليات', table: 'audit_logs', select: '*, profiles(full_name,email)', cols: [['action', 'العملية'], ['actor', 'المنفّذ', 'actor'], ['entity', 'الجدول'], ['created_at', 'الوقت', 'd']] },
};
export const TITLES = { home: 'الرئيسية', notifications: 'الإشعارات', settings: 'الإعدادات', reports: 'التقارير', permissions: 'الصلاحيات', broadcast: 'إشعارات وعروض', wallet: 'المحفظة والأرباح', favorites: 'المفضلة', ...Object.fromEntries(Object.entries(CFG).map(([k, v]) => [k, v.t])) };
export const NAV = {
  admin: ['home', 'reports', 'users', 'companies', 'warehouses', 'products', 'categories', 'coupons', 'orders', 'payments', 'shipments', 'returns', 'submissions', 'payouts', 'tickets', 'platform', 'broadcast', 'permissions', 'audit', 'notifications', 'settings'],
  company: ['home', 'reports', 'wallet', 'products', 'orders', 'shipments', 'returns', 'sell', 'tickets', 'notifications', 'settings'],
  support: ['home', 'reports', 'users', 'tickets', 'orders', 'returns', 'shipments', 'notifications', 'settings'],
  courier: ['home', 'shipments_new', 'shipments_active', 'shipments_done', 'reports', 'notifications', 'settings'],
  customer: ['home', 'orders', 'favorites', 'addresses', 'sell', 'returns', 'tickets', 'notifications', 'settings'],
};
export const HOME = {
  admin: [['المستخدمون', 'profiles'], ['الطلبات', 'orders'], ['المنتجات', 'products'], ['شركات بانتظار الاعتماد', 'companies', ['approval', 'pending']], ['تذاكر مفتوحة', 'tickets', ['status', 'open']], ['مرتجعات جديدة', 'returns', ['status', 'requested']], ['أجهزة بانتظار المراجعة', 'device_submissions', ['status', 'pending']], ['طلبات سحب', 'payouts', ['status', 'requested']]],
  company: [['طلبات واردة', 'orders'], ['مرتجعات للمراجعة', 'returns', ['status', 'requested']], ['تذاكري', 'tickets']],
  support: [['تذاكر مفتوحة', 'tickets', ['status', 'open']], ['مرتجعات جديدة', 'returns', ['status', 'requested']], ['طلبات قيد الانتظار', 'orders', ['status', 'pending']]],
  courier: [['شحنات جديدة', 'shipments', ['status', 'pending']], ['قيد التوصيل', 'shipments', ['status', 'in_transit']], ['تم التسليم', 'shipments', ['status', 'delivered']]],
  customer: [['طلباتي', 'orders'], ['المفضلة', 'favorites'], ['مرتجعاتي', 'returns'], ['تذاكري', 'tickets']],
};
export const fmt = (v, f) => f === 'actor' ? (v?.full_name || v?.email || 'النظام') : (v == null || v === '' ? '—' : f === 'egp' ? Number(v).toLocaleString('ar-EG') + ' ج.م' : f === 'd' ? new Date(v).toLocaleDateString('ar-EG') : f === 'l' ? L[String(v)] || String(v) : String(v));
