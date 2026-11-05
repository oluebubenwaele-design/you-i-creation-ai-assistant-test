const crypto = require('crypto');
const { findPublicByTracking, listAdminOrders, updateStatus } = require('./_orders-store');

function sign(payload) { return crypto.createHmac('sha256', String(process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || '')).update(payload).digest('base64url'); }
function validToken(token) {
  if (!token || !(process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SECRET_KEY)) return false;
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      // Public order lookup is POST-only so customer verification details are not
      // placed in URL/query strings (which may be retained in access logs).
      const auth = String(req.headers.authorization || '');
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!validToken(token)) return res.status(401).json({ error: 'Admin session expired. Please sign in again.' });
      return res.status(200).json({ orders: await listAdminOrders() });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (body.action === 'track-order') {
      const tracking = String(body.tracking_id || '').trim().toUpperCase();
      const email = String(body.email || '').trim();
      const phone = String(body.phone || '').trim();
      if (!tracking || !email || !phone) return res.status(400).json({ error: 'Enter your tracking ID, checkout email, and checkout phone number.' });
      const order = await findPublicByTracking(tracking, email, phone);
      if (!order) return res.status(404).json({ error: 'We could not verify an order with those details. Please check them and try again.' });
      return res.status(200).json({ order });
    }
    if (!validToken(body.token)) return res.status(401).json({ error: 'Admin session expired. Please sign in again.' });
    if (body.action !== 'update-status') return res.status(400).json({ error: 'Unsupported order action.' });
    const order = await updateStatus(String(body.tracking_id || '').trim().toUpperCase(), String(body.status || '').trim());
    return res.status(200).json({ order: { tracking_id: order.tracking_number, status: order.order_status } });
  } catch (error) {
    console.error('orders error:', error);
    return res.status(500).json({ error: error.message || 'Unable to process order request.' });
  }
};
