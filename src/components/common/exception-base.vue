<script lang="ts" setup>
import {computed, onMounted} from 'vue';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import {fetchGetUserRoutes} from "@/service/api";

defineOptions({ name: 'ExceptionBase' });

type ExceptionType = '403' | '404' | '500';

interface Props {
  /**
   * Exception type
   *
   * - 403: no permission
   * - 404: not found
   * - 500: service error
   */
  type: ExceptionType;
}

const props = defineProps<Props>();

const { routerPushByKey } = useRouterPush();

const iconMap: Record<ExceptionType, string> = {
  '403': 'no-permission',
  '404': 'not-found',
  '500': 'service-error'
};

const icon = computed(() => iconMap[props.type]);

async function getRoutes() {
  const res = await fetchGetUserRoutes();
  if(res.data?.routes.length) {
    await routerPushByKey(res.data?.routes[0].name);
  }
}

onMounted(() => {
  getRoutes();
});
</script>

<template>
  <div class="size-full min-h-520px flex-col-center gap-24px overflow-hidden">
    <div class="flex text-400px text-primary">
      <SvgIcon :local-icon="icon" />
    </div>
    <AButton type="primary" @click="routerPushByKey('root')">{{ $t('common.backToHome') }}</AButton>
  </div>
</template>

<style scoped></style>
