<script setup lang="ts">
import dayjs from 'dayjs';
import { ref } from 'vue';

defineOptions({
  name: 'PrivatefanSearch'
});
// 好友状态
const friendStatusOptions = [
  { label: '单向/流失', value: 1 }
];

// 小店绑定状态
const bindStatusOptions = [
  { label: '已绑定', value: 1 },
  { label: '空闲', value: 2 }
];

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.PrivateFans.SearchParams>('model', { required: true });

const create_time = ref();
const bind_time = ref();

function reset() {
  create_time.value = [];
  bind_time.value = [];
  emit('reset');
}

function search() {
  emit('search');
}

const createTimeChange = (value: (string | number | Date | dayjs.Dayjs | null | undefined)[]) => {
  if (value) {
    create_time.value = value;
    model.value.create_time_start = dayjs(value[0]).format('YYYY-MM-DD');
    model.value.create_time_end = dayjs(value[1]).format('YYYY-MM-DD');
  } else {
    create_time.value = [];
    model.value.create_time_start = '';
    model.value.create_time_end = '';
  }
};

const bindTimeChange = (value: (string | number | Date | dayjs.Dayjs | null | undefined)[]) => {
  if (value) {
    bind_time.value = value;
    model.value.bind_time_start = dayjs(value[0]).format('YYYY-MM-DD');
    model.value.bind_time_end = dayjs(value[1]).format('YYYY-MM-DD');
  } else {
    bind_time.value = [];
    model.value.bind_time_start = '';
    model.value.bind_time_end = '';
  }
};
</script>

<template>
  <ACard :title="$t('common.search')" :bordered="false" class="card-wrapper">
    <AForm :model="model" :label-width="80">
      <ARow :gutter="[16, 16]" wrap>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="好友状态" name="fans_status" class="m-0">
            <ASelect v-model:value="model.fans_status" placeholder="不限" allow-clear>
              <ASelectOption v-for="option in friendStatusOptions" :key="option.value" :value="option.value">
                {{ $t(option.label) }}
              </ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="小店绑定状态" name="bind_status" class="m-0">
            <ASelect v-model:value="model.bind_status" placeholder="不限" allow-clear>
              <ASelectOption v-for="option in bindStatusOptions" :key="option.value" :value="option.value">
                {{ $t(option.label) }}
              </ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="添加时间" name="addTime" class="m-0">
            <ARangePicker v-model:value="create_time" allow-clear class="w100%" @change="createTimeChange" />
          </AFormItem>
        </ACol>
        <ACol :span="24" :md="12" :lg="5">
          <AFormItem label="绑定时间" name="bindTime" class="m-0">
            <ARangePicker v-model:value="bind_time" allow-clear class="w100%" @change="bindTimeChange" />
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
