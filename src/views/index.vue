<template>
  <div class="app-container home">
    <el-row class="pl20 pr20 pb20 pt20" :gutter="10">
      <el-col :span="12">
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">商品字段结构说明（Item 10.26更新）</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:16px;line-height: 32px;">
              基础信息：<br/>
              · 商品名称（itemName）：String，必填，用于展示和搜索。<br/>
              · 商品分类（itemCategory）：Long，必填，分类 ID。<br/>
              · 商品品牌（itemBrand）：Long，必填，品牌 ID。<br/>
              · 成色（itemCondition）：String，必填，如“全新”“九成新”。<br/>
              · 年份（year）：Number，可选，四位年份。<br/>
              · 是否已护理（cared）：可选 Boolean，true/false。<br/>
              · 数量（defaultQty）：可选 Number，默认 1。<br/>
              · 鉴定机构（authAgency）：String，可选。<br/>
              · 寄售信息（consignInfo）：String，可选，文本描述。<br/>
              · 备注（remark）：String，可选，文本备注。<br/>
              · 商品图片（imageList）：List&lt;Image&gt;，包含 id、url、isMain、sort 等字段。<br/>
              SKU信息（挂在 sku 列表上）：<br/>
              · skuCode：String，必填，一个商品仅对应一个 SKU。。<br/>
              · costPrice：Number，成本价，保留两位小数。<br/>
              · sellingPrice：Number，销售价，保留两位小数。<br/>
              时间信息（由后端维护）：<br/>
              · createTime：DateTime，创建时间。<br/>
              · updateTime：DateTime，最后更新时间。
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">商品过滤结构说明（Item Filter 10.26更新）</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:16px;line-height: 30px;">
              基础筛选字段：<br/>
              · 商品名称（itemName）：String，模糊匹配名称。<br/>
              · SKU 编码（skuCode）：String，精确匹配 SKU。<br/>
              · 商品分类（itemCategory）：Long，分类 ID，左侧分类框选择。<br/>
              · 商品品牌（itemBrand）：Long，品牌 ID，下拉选择。<br/>
              · 成色（itemCondition）：String，文本匹配，如“全新”“九成新”。<br/>
              · 年份（year）：Number，按年份精确筛选。<br/>
              · 鉴定机构（authAgency）：String，文本匹配。<br/>
              · 默认数量（defaultQty）：Number，按数量精确筛选。<br/>
              · 已护理（cared）：Boolean，是/否 开关。<br/>
              · 寄售信息（consignInfo）：String，关键字模糊匹配。<br/>
              时间与价格筛选：<br/>
              · 创建时间区间（createTimeRange → startTime/endTime）：DateTime，按创建时间段筛选。<br/>
              · 销售价下限（sellingPriceMin）：Number，筛选不低于此价格的商品。<br/>
              · 销售价上限（sellingPriceMax）：Number，筛选不高于此价格的商品。
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('5.2.0')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

