export function flattenSettlement(data) {
  return [
    ...(data.streams || []).map(row => ({ key: 'STREAM:' + row.id, id: row.id, type: 'STREAM', typeLabel: '开播', businessDate: row.streamDate, postingDate: row.streamDate, accountLabel: row.accountLabel, description: `${row.durationHours} 小时 × ${row.hourlyRate}；特殊金额 ${row.specialAmount}`, status: row.settlementStatus, amount: row.totalAmount })),
    ...(data.commissions || []).map(row => ({ key: 'COMMISSION:' + row.id, id: row.id, type: 'COMMISSION', typeLabel: '佣金', businessDate: row.orderDate, postingDate: row.orderDate, accountLabel: row.accountLabel, description: (row.status === 'REFUNDED' ? '已退款 · ' : '') + row.orderNo, status: row.settlementStatus, amount: row.status === 'NORMAL' ? row.commissionAmount : 0 })),
    ...(data.adjustments || []).map(row => ({ key: 'ADJUSTMENT:' + row.id, id: row.id, type: 'ADJUSTMENT', typeLabel: '调整', businessDate: row.streamDate, postingDate: row.postingDate, accountLabel: row.accountLabel, description: row.reason, status: row.status, amount: row.amount }))
  ]
}
export function selectedSettlementIds(rows) {
  return {
    streamIds: rows.filter(row => row.type === 'STREAM').map(row => row.id),
    commissionIds: rows.filter(row => row.type === 'COMMISSION').map(row => row.id),
    adjustmentIds: rows.filter(row => row.type === 'ADJUSTMENT').map(row => row.id)
  }
}
