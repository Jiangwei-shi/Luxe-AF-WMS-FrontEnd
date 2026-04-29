import request from '@/utils/request'

// 未入库 SKU 分页列表（任意仓库均无 wms_inventory 行；Query 与 UnstockedSkuVo 以后端为准）
export function listUnstockedSkus(query) {
  return request({
    url: '/wms/inventory/unstocked-skus',
    method: 'get',
    params: query
  })
}

// 未入库 SKU 总金额（按当前筛选条件汇总，不受分页影响）
export function getUnstockedSkusTotalAmount(query) {
  return request({
    url: '/wms/inventory/unstocked-skus/total-amount',
    method: 'get',
    params: query
  })
}

// 未入库 SKU 总件数（按当前筛选条件汇总，不受分页影响）
export function getUnstockedSkusTotalCount(query) {
  return request({
    url: '/wms/inventory/unstocked-skus/total-count',
    method: 'get',
    params: query
  })
}

// 查询库存列表
export function listInventory(query) {
  return request({
    url: '/wms/inventory/boardList/warehouse',
    method: 'get',
    params: query
  })
}

export function listInventoryNoPage(query) {
  return request({
    url: '/wms/inventory/listNoPage',
    method: 'get',
    params: query
  })
}

// 查询库存看板仓库维度列表（仓库维度和商品维度）
export function listInventoryBoard(query,type) {
  return request({
    url: '/wms/inventory/boardList/'+type,
    method: 'get',
    params: query
  })
}

// 查询库存详细
export function getInventory(id) {
  return request({
    url: '/wms/inventory/' + id,
    method: 'get'
  })
}

// 新增库存
export function addInventory(data) {
  return request({
    url: '/wms/inventory',
    method: 'post',
    data: data
  })
}

// 修改库存
export function updateInventory(data) {
  return request({
    url: '/wms/inventory',
    method: 'put',
    data: data
  })
}

// 删除库存
export function delInventory(id) {
  return request({
    url: '/wms/inventory/' + id,
    method: 'delete'
  })
}
