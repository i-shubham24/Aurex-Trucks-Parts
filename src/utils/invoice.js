/**
 * Aurex Truck Parts Australia - Official Tax Invoice & Warehouse Packing Slip Generator
 * Formatted for standard Australian A4 printing / PDF download.
 */

/* Every customer- or product-supplied value goes through this before it is put in the
   invoice HTML, which is written into a window on our own origin (staff open these too). */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const money = (n) => (Number.isFinite(n) ? n : 0).toFixed(2);

export function generateInvoiceHtml(order) {
  const orderId = escapeHtml(order.id || order.ref || order.orderNumber || "ATP-ORDER");
  const dateStr = new Date(order.placedAt || order.createdAt || Date.now()).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  
  const rawStatus = String(order.status || order.orderStatus || "Confirmed");
  const statusRaw = rawStatus === "Packed in Campbellfield VIC" ? "Confirmed" : rawStatus;

  const isPaid = /paid/i.test(order.paymentStatus || "") || order.paymentStatus === "PAID";
  const paymentMethod = String(order.payment || order.paymentMethod || "Card");

  const address = order.address || order.shippingAddress || {};
  const shippingInfo = order.shipping && typeof order.shipping === "object" ? order.shipping : {};
  const freightRaw = (typeof order.shipping === "string" ? order.shipping : shippingInfo.shippingMethod) || order.shippingMethod || "Standard road freight";
  const isPickupOrder = freightRaw === "Click and Collect VIC" || /pickup|collect/i.test(String(freightRaw || ""));
  const customerName = escapeHtml(address.name || address.fullName || "Customer");
  const company = escapeHtml(address.company || address.companyName || "");
  const freight = escapeHtml(freightRaw);
  // The API returns trackingNumber / carrier at the top level; older payloads nested them under shipping.
  const carrier = escapeHtml(order.carrier || shippingInfo.carrier || "Standard Road");
  const trackingNumber = escapeHtml(order.trackingNumber || shippingInfo.trackingNumber || "Assigned at dispatch");
  const street = escapeHtml(address.address || address.addressLine1 || (isPickupOrder ? "Aurex Campbellfield Depot - Customer Collection" : "Warehouse Pickup"));
  const street2 = escapeHtml(address.addressLine2 || "");
  const suburb = escapeHtml(address.suburb || address.suburbOrCity || (isPickupOrder ? "Campbellfield" : ""));
  const state = escapeHtml(address.state || "VIC");
  const postcode = escapeHtml(address.postcode || address.postalCode || (isPickupOrder ? "3061" : ""));
  const phone = escapeHtml(address.phone || order.phone || "");
  const email = escapeHtml(address.email || order.email || order.guestEmail || "");
  const notes = escapeHtml(address.notes || address.deliveryInstructions || order.customerNotes || "");

  const items = order.items || order.lines || [];

  // Use the server's own figures (order.pricing) when we have them; only fall back to the
  // flattened fields for old locally cached orders.
  const pricing = order.pricing || {};
  const num = (...values) => {
    for (const v of values) {
      if (v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))) return Number(v);
    }
    return 0;
  };
  const grandTotal = num(pricing.grandTotal, order.total, order.grandTotal);
  const subtotal = num(pricing.subtotal, order.subtotal, grandTotal);
  const discount = num(pricing.totalDiscount, order.discount);
  const coreDeposit = num(pricing.totalCoreDeposit, order.totalCoreDeposit);
  const shippingFee = num(
    pricing.shippingFee,
    order.shippingFee,
    Math.max(0, grandTotal - coreDeposit - (subtotal - discount))
  );
  // GST is 1/11th of the taxable amount (goods after discount + freight); core deposits carry none.
  const gstPortion = num(pricing.tax, order.tax, (grandTotal - coreDeposit) / 11);

  const itemsRows = items.map((l, idx) => {
    const qty = Number(l.qty || l.quantity || 1);
    const price = Number(l.price ?? l.unitPrice ?? 0);
    const lineTotal = Number(l.total ?? (price * qty));
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; color: #1e293b;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; color: #0284c7;">${escapeHtml(l.sku || "ATP-PART")}</td>
        <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #0f172a;">
          ${escapeHtml(l.name || "Truck Replacement Component")}
        </td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: center; font-weight: 700; color: #0f172a;">${escapeHtml(qty)}</td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: right; color: #334155;">$${money(price)}</td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: right; font-weight: 700; color: #0f172a;">$${money(lineTotal)}</td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${orderId} - Aurex Truck Parts</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }
    .invoice-card {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
    }
    .top-actions {
      max-width: 840px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #002049;
      color: #ffffff;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #002049;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #002049;
      text-transform: uppercase;
    }
    .logo-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .company-details {
      font-size: 11px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.45;
    }
    .invoice-title-block {
      text-align: right;
    }
    .doc-type {
      font-size: 18px;
      font-weight: 800;
      color: #002049;
      letter-spacing: 0.5px;
    }
    .order-number {
      font-family: ui-monospace, monospace;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .status-packed { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .status-dispatched { background: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }
    .status-delivered { background: #dcfce7; color: #166534; border-color: #bbf7d0; }

    .grid-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .detail-text {
      font-size: 12px;
      color: #1e293b;
      line-height: 1.5;
    }
    .detail-bold {
      font-weight: 700;
      color: #0f172a;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    table.items-table th {
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
      padding: 10px 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      text-align: left;
    }

    .totals-block {
      margin-left: auto;
      width: 320px;
      margin-bottom: 28px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
      color: #475569;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
      font-weight: 800;
      color: #002049;
      border-top: 2px solid #002049;
      margin-top: 6px;
    }

    .warehouse-box {
      border: 1.5px dashed #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      padding: 14px 18px;
      margin-top: 20px;
      font-size: 11px;
      color: #475569;
    }
    .warehouse-box-title {
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #002049;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .sign-row {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-weight: 600;
    }

    .footer-note {
      text-align: center;
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>

  <div class="top-actions no-print">
    <div>
      <span style="font-size: 12px; font-weight: 700; color: #475569;">Aurex Order Attachment Invoice (${orderId})</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
      <button class="btn" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="logo-text">Aurex Trucks Parts</div>
          <div class="logo-sub">Commercial Vehicle Body & Chassis Equipment</div>
          <div class="company-details">
            <strong>Aurex Panels Pty Limited</strong><br>
            ABN: 47 670 781 254 · ACN: 670 781 254<br>
            77 Capital Link Drive, Campbellfield VIC 3061 Australia<br>
            Phone: +61 414 730 467 · Email: info@aurextruckparts.com.au
          </div>
        </td>
        <td style="vertical-align: top;" class="invoice-title-block">
          <div class="doc-type">TAX INVOICE & PACKING SLIP</div>
          <div class="order-number">${orderId}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${dateStr}</div>
          <div>
            <span class="status-badge ${statusRaw === 'Packed' ? 'status-packed' : statusRaw === 'Dispatched' ? 'status-dispatched' : statusRaw === 'Delivered' ? 'status-delivered' : ''}">
              CURRENT STATUS: ${escapeHtml(statusRaw.toUpperCase())}
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${isPaid ? '#15803d' : '#b45309'}; margin-top: 4px;">
            ${isPaid ? 'PAYMENT VERIFIED (PAID)' : 'PAYMENT PENDING'} · ${escapeHtml(paymentMethod.toUpperCase())}
          </div>
        </td>
      </tr>
    </table>

    <div class="grid-details">
      <div>
        <div class="section-title">Sold / Deliver To</div>
        <div class="detail-text">
          <div class="detail-bold">${customerName}</div>
          ${company ? `<div>${company}</div>` : ''}
          <div>${street}</div>
          ${street2 ? `<div>${street2}</div>` : ''}
          <div>${suburb} ${state} ${postcode} Australia</div>
          ${phone ? `<div>Phone: <strong>${phone}</strong></div>` : ''}
          ${email ? `<div>Email: ${email}</div>` : ''}
          ${notes ? `<div style="margin-top: 4px; font-style: italic; color: #b45309;">Notes: ${notes}</div>` : ''}
        </div>
      </div>

      <div>
        <div class="section-title">Freight & Dispatch Information</div>
        <div class="detail-text">
          <div>Service: <span class="detail-bold">${freight}</span></div>
          <div>Carrier: <span class="detail-bold">${carrier}</span></div>
          <div>Consignment / Tracking: <span class="detail-bold" style="font-family: ui-monospace, monospace;">${trackingNumber}</span></div>
          <div style="margin-top: 6px; font-size: 11px; color: #64748b;">
            Warehouse Dispatch Hub: Campbellfield VIC (Daily National Runs)
          </div>
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 35px;">#</th>
          <th style="width: 120px;">Part SKU</th>
          <th>Description</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="width: 90px; text-align: right;">Unit (AUD)</th>
          <th style="width: 100px; text-align: right;">Total (AUD)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-block">
      <div class="totals-row">
        <span>Subtotal (inc. GST):</span>
        <span style="font-weight: 600;">$${money(subtotal)}</span>
      </div>
      ${discount > 0 ? `<div class="totals-row">
        <span>Discount:</span>
        <span style="font-weight: 600; color: #15803d;">-$${money(discount)}</span>
      </div>` : ''}
      <div class="totals-row">
        <span>Freight & Handling:</span>
        <span style="font-weight: 600;">${shippingFee === 0 ? "FREE" : "$" + money(shippingFee)}</span>
      </div>
      ${coreDeposit > 0 ? `<div class="totals-row">
        <span>Core Deposit (refundable, no GST):</span>
        <span style="font-weight: 600;">$${money(coreDeposit)}</span>
      </div>` : ''}
      <div class="totals-row">
        <span>GST Included (10%):</span>
        <span style="font-weight: 600;">$${money(gstPortion)}</span>
      </div>
      <div class="totals-grand">
        <span>Total Amount (AUD):</span>
        <span>$${money(grandTotal)}</span>
      </div>
    </div>

    <div class="warehouse-box">
      <div class="warehouse-box-title">
        <span>Physical Order Packing & Dispatch Checklist</span>
        <span>ATTACH TO CONSIGNMENT</span>
      </div>
      <div style="display: flex; gap: 24px; font-size: 11px; margin-top: 6px;">
        <span>[ ✓ ] Part numbers & quantities verified</span>
        <span>[ ✓ ] Packaging inspection passed</span>
        <span>[ ✓ ] Weight checked</span>
      </div>
      <div class="sign-row">
        <span>Packed By: __________________________</span>
        <span>Date: _______________</span>
        <span>Consignment #: ${orderId}</span>
      </div>
    </div>

    <div class="footer-note">
      Thank you for your business. Aurex Panels Pty Limited · 77 Capital Link Drive, Campbellfield VIC 3061 · +61 414 730 467 · info@aurextruckparts.com.au
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto-prompt print dialog for seamless warehouse flow
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
}

/**
 * Opens a print-ready window to print or save the Tax Invoice as PDF.
 */
export function downloadInvoice(order) {
  if (!order) return;
  const html = generateInvoiceHtml(order);
  const printWindow = window.open("", "_blank", "width=900,height=960,menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=yes");

  if (printWindow) {
    // noopener semantics: we still need the handle to write the page, but the page gets
    // no reference back to this tab.
    try { printWindow.opener = null; } catch { /* ignore */ }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // If popups blocked, download as file directly
    downloadInvoiceFile(order);
  }
}

/**
 * Downloads the Tax Invoice directly as an HTML file.
 */
export function downloadInvoiceFile(order) {
  if (!order) return;
  const orderId = String(order.id || order.ref || order.orderNumber || "ATP-ORDER").replace(/[^A-Za-z0-9_-]/g, "");
  const html = generateInvoiceHtml(order);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Tax_Invoice_${orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
