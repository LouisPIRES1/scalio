import { NETWORK_META } from '@/types'
import type { NetworkGroup, Plan, Project } from '@/types'

export function exportMetrePdf(
  networks: NetworkGroup[],
  plan: Pick<Plan, 'name' | 'floor'>,
  project: Pick<Project, 'name' | 'client'>
) {
  const selected = networks.filter((n) => n.isSelected && n.items.length > 0)

  const date = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const networkRows = selected
    .map((n) => {
      const meta = NETWORK_META[n.type]
      const totalLinear = n.items
        .filter((i) => i.unit === 'ml')
        .reduce((s, i) => s + i.quantity, 0)
      const totalElbows = n.items
        .filter((i) => i.unit === 'ml')
        .reduce((s, i) => s + (i.elbows ?? 0), 0)
      const totalUnits = n.items
        .filter((i) => i.unit === 'u')
        .reduce((s, i) => s + i.quantity, 0)

      const itemRows = n.items
        .map(
          (item) => `
          <tr>
            <td>${item.label}</td>
            <td class="num">${item.unit === 'ml' ? item.quantity.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' ml' : '—'}</td>
            <td class="num">${item.elbows != null ? item.elbows : item.unit === 'u' ? item.quantity + ' u' : '—'}</td>
          </tr>`
        )
        .join('')

      const totalRow =
        n.items.length > 1
          ? `<tr class="total-row">
              <td>Sous-total</td>
              <td class="num">${totalLinear > 0 ? totalLinear.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' ml' : '—'}</td>
              <td class="num">${totalElbows > 0 ? totalElbows : totalUnits > 0 ? totalUnits + ' u' : '—'}</td>
            </tr>`
          : ''

      return `
        <div class="network">
          <div class="network-header">
            <div class="network-dot" style="background:${meta.color}"></div>
            <span class="network-title">${meta.label}</span>
            <span class="confidence">Fiabilité ${Math.round(n.confidence * 100)}%</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th class="num">Linéaires</th>
                <th class="num">Coudes / Qté</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${totalRow}
            </tbody>
          </table>
        </div>`
    })
    .join('')

  const grandTotalLinear = selected
    .flatMap((n) => n.items.filter((i) => i.unit === 'ml'))
    .reduce((s, i) => s + i.quantity, 0)

  const grandTotalElbows = selected
    .flatMap((n) => n.items.filter((i) => i.unit === 'ml'))
    .reduce((s, i) => s + (i.elbows ?? 0), 0)

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Métré — ${plan.name} — ${project.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      color: #0F172A;
      padding: 40px;
      font-size: 13px;
      line-height: 1.5;
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      margin-bottom: 28px;
      border-bottom: 2px solid #0F172A;
    }
    .logo {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #3B82F6;
    }
    .title { font-size: 18px; font-weight: 700; margin-top: 6px; }
    .subtitle { font-size: 12px; color: #64748B; margin-top: 3px; }
    .meta { text-align: right; font-size: 12px; color: #64748B; line-height: 1.8; }
    .meta strong { color: #0F172A; }
    /* Networks */
    .network { margin-bottom: 28px; page-break-inside: avoid; }
    .network-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .network-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .network-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0F172A;
    }
    .confidence {
      font-size: 10px;
      color: #94A3B8;
      margin-left: 4px;
    }
    /* Table */
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #F8FAFC;
      padding: 7px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
      border-bottom: 1px solid #E2E8F0;
    }
    td {
      padding: 7px 12px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 13px;
    }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row td {
      font-weight: 600;
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
    }
    /* Grand total */
    .grand-total {
      margin-top: 32px;
      padding: 16px 20px;
      background: #0F172A;
      color: white;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grand-total-label { font-size: 12px; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; }
    .grand-total-value { font-size: 20px; font-weight: 700; }
    .grand-total-sub { font-size: 12px; opacity: 0.6; margin-top: 2px; }
    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      font-size: 10px;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 24px; }
      .no-print { display: none !important; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Constor</div>
      <div class="title">Fiche de métré</div>
      <div class="subtitle">${project.name} — Plan ${plan.name}</div>
    </div>
    <div class="meta">
      <div><strong>Client</strong> ${project.client}</div>
      <div><strong>Plan</strong> ${plan.floor} / ${plan.name}</div>
      <div><strong>Généré le</strong> ${date}</div>
    </div>
  </div>

  ${selected.length === 0
    ? '<p style="color:#94A3B8;text-align:center;padding:40px 0">Aucun réseau sélectionné</p>'
    : networkRows
  }

  ${grandTotalLinear > 0 ? `
  <div class="grand-total">
    <div>
      <div class="grand-total-label">Total général</div>
      <div class="grand-total-sub">${selected.length} réseau${selected.length > 1 ? 'x' : ''} · ${grandTotalElbows} coudes</div>
    </div>
    <div class="grand-total-value">${grandTotalLinear.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ml</div>
  </div>` : ''}

  <div class="footer">
    <span>Document généré par Constor · Usage interne</span>
    <span>${date}</span>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=800,height=900')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}
