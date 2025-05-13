<script setup lang="ts">
import dayjs from 'dayjs';
import { watch } from 'vue';
defineOptions({
  name: 'CpsOrderSearch'
});

const orderPlatformArray = [
  { label: '美团', value: 1 },
  { label: '饿了么', value: 2 },
  { label: '滴滴', value: 3 },
  { label: '淘宝', value: 4 },
  { label: '京东', value: 5 },
  { label: '拼多多', value: 6 }
];

const statusArray = [
  { label: '付款', value: 1 },
  { label: '完成', value: 2 },
  { label: '取消', value: 3 },
  { label: '风控', value: 4 },
  { label: '结算', value: 5 }
];

const orderCommissionRate = [
  { label: '>0%', value: 1 },
  { label: '>=2%', value: 2 },
  { label: '>=5%', value: 5 },
  { label: '>=10%', value: 10 },
  { label: '>=15%', value: 15 },
  { label: '>=20%', value: 20 },
  { label: '>=30%', value: 30 },
  { label: '>=50%', value: 50 },
  { label: '>=80%', value: 80 }
];

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.CpsOrder.CpsOrderSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}

watch(
  model,
  () => {
    if (model.value) {
      if (model.value.pay_date) {
        // 转为秒时间戳
        model.value.pay_start_time = `${(dayjs(dayjs(model.value.pay_date[0]).format('YYYY-MM-DD 00:00:00')).valueOf() / 1000).toFixed(0)}`;
        model.value.pay_end_time = `${(dayjs(dayjs(model.value.pay_date[1]).format('YYYY-MM-DD 23:59:59')).valueOf() / 1000).toFixed(0)}`;
      } else {
        model.value.pay_start_time = '';
        model.value.pay_end_time = '';
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <ACard :title="$t('common.search')" :bordered="false" class="card-wrapper">
    <AForm :model="model" :label-width="80">
      <ARow :gutter="[16, 16]" wrap>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="活动平台" name="order_platform" class="m-0">
            <ASelect v-model:value="model.order_platform" placeholder="全部" allow-clear>
              <ASelectOption v-for="option in orderPlatformArray" :key="option.value" :value="option.value">
                {{ option.label }}
              </ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="购买人" name="order_channel_account" class="m-0">
            <AInput v-model:value="model.order_channel_account" placeholder="请输入购买人渠道账号" allow-clear />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="7">
          <AFormItem label="付款时间" name="pay_date" class="m-0">
            <ARangePicker v-model:value="model.pay_date" allow-clear class="w100%" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="订单编号" name="order_id" class="m-0">
            <AInput v-model:value="model.order_id" placeholder="请输入订单编号" allow-clear />
          </AFormItem>
        </ACol>

        <ACol :span="24" :md="12" :lg="6">
          <AFormItem label="佣金比例" name="order_commission_rate" class="m-0">
            <ASelect v-model:value="model.order_commission_rate" placeholder=">0%" allow-clear>
              <ASelectOption v-for="option in orderCommissionRate" :key="option.value" :value="option.value">
                {{ option.label }}
              </ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="7">
          <AFormItem label="订单状态" name="order_status" class="m-0">
            <ASelect v-model:value="model.order_status" placeholder="全部" allow-clear>
              <ASelectOption v-for="option in statusArray" :key="option.value" :value="option.value">
                {{ option.label }}
              </ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="4">
          <AFormItem class="m-0">
            <div class="w-full flex-y-center justify-end gap-12px">
              <AButton @click="reset">
                <template #icon>
                  <icon-ic-round-refresh class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.reset') }}</span>
              </AButton>
              <AButton type="primary" ghost @click="search">
                <template #icon>
                  <icon-ic-round-search class="align-sub text-icon" />
                </template>
                <span class="ml-8px">{{ $t('common.search') }}</span>
              </AButton>
            </div>
          </AFormItem>
        </ACol>
      </ARow>
    </AForm>
  </ACard>
</template>

<style scoped></style>
