<script setup lang="ts">
import {computed, ref, shallowRef, watch} from 'vue';
import type { DataNode } from 'ant-design-vue/es/tree';
import { $t } from '@/locales';
import {editRole, fetchGetButtonList, fetchGetMenuList} from "@/service/api";

defineOptions({
  name: 'ButtonAuthModal'
});

interface Props {
  /** the roleId */
  roleId: number;
  rowData?: Api.SystemManage.Role | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

const tree = shallowRef<DataNode[]>([]);

async function getAllButtons() {
  // request
  const {data} = await fetchGetButtonList({
    current: 1,
    page_size: 10
  });
  console.log('data',data)
  tree.value = data.list.map(item => ({
    key: item.id,
    title: item.title,
  }));
  // tree.value = [
  //   { key: 1, title: 'button1', code: 'code1' },
  //   { key: 2, title: 'button2', code: 'code2' },
  // ];
}

const checks = shallowRef<number[]>([]);

async function getChecks() {
  console.log(props.roleId);
  // request
  const res = await fetchGetButtonList({
    current: 1,
    page_size: 1000,
    role_id: props.roleId,
  })

  checks.value = res.data.list.map(item => item.id);
}

function handleSubmit() {
  console.log(checks.value, props.roleId);
  // request
  const requestData = {
    ...props.rowData,
    button_ids: checks.value,
    type: 'edit'
  }
  editRole({
    ...requestData
  })
  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllButtons();
  getChecks();
}

// init
init();
</script>

<template>
  <AModal v-model:open="visible" :title="title" class="w-480px">
    <ATree v-model:checked-keys="checks" :tree-data="tree" checkable :height="280" class="h-280px" />
    <template #footer>
      <AButton size="small" class="mt-16px" @click="closeModal">
        {{ $t('common.cancel') }}
      </AButton>
      <AButton type="primary" size="small" class="mt-16px" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </AButton>
    </template>
  </AModal>
</template>

<style scoped></style>
