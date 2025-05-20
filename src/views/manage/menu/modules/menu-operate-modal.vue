<script setup lang="tsx">
import { computed, nextTick, ref, watch } from 'vue';
import { SimpleScrollbar } from '@sa/materials';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { getLocalIcons } from '@/utils/icon';
import { editMenu, fetchGetRoleList } from '@/service/api';
import {
  getLayoutAndPage,
  getPathParamFromRoutePath,
  getRoutePathByRouteName,
  getRoutePathWithParam,
  transformLayoutAndPageToComponent
} from './shared';

defineOptions({
  name: 'MenuOperateModal'
});

export type OperateType = AntDesign.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data or the parent menu data when adding a child menu */
  rowData?: Api.SystemManage.Menu | null;
  /** all pages */
  allPages: string[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, resetFields } = useAntdForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Menu,
  | 'admin_router_menu_type'
  | 'admin_router_menu_name'
  | 'admin_router_route_name'
  | 'admin_router_route_path'
  | 'admin_router_component'
  | 'admin_router_order'
  | 'admin_router_i18n_key'
  | 'admin_router_icon'
  | 'admin_router_icon_type'
  | 'admin_router_status'
  | 'admin_router_pid'
  | 'admin_router_keep_alive'
  | 'admin_router_constant'
  | 'admin_router_href'
  | 'admin_router_hide_in_menu'
  | 'admin_router_active_menu'
  | 'admin_router_multi_tab'
  | 'admin_router_fixed_index_in_tab'
> & {
  query: NonNullable<Api.SystemManage.Menu['query']>;
  admin_router_layout: string;
  admin_router_page: string;
  type: 'add' | 'edit';
  admin_router_pathParam: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    admin_router_menu_type: 1,
    admin_router_menu_name: '',
    admin_router_route_name: '',
    admin_router_route_path: '',
    admin_router_pathParam: '',
    admin_router_component: '',
    admin_router_layout: '',
    admin_router_page: '',
    admin_router_i18n_key: null,
    admin_router_icon: '',
    admin_router_icon_type: 1,
    admin_router_pid: 0,
    admin_router_status: 1,
    admin_router_keep_alive: 1,
    admin_router_constant: 1,
    admin_router_order: 0,
    admin_router_href: null,
    admin_router_hide_in_menu: 1,
    admin_router_active_menu: null,
    admin_router_multi_tab: 1,
    admin_router_fixedIndexInTab: null,
    admin_router_query: [],
    type: 'add'
  };
}

type RuleKey = Extract<keyof Model, 'admin_router_menu_name' | 'admin_router_status' | 'admin_router_route_name' | 'admin_router_route_path' | 'admin_router_i18n_key'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  admin_router_menu_name: defaultRequiredRule,
  admin_router_status: defaultRequiredRule,
  admin_router_route_name: defaultRequiredRule,
  admin_router_route_path: defaultRequiredRule,
  admin_router_i18n_key: defaultRequiredRule
};

const disabledMenuType = computed(() => props.operateType === 'edit');

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon localIcon={item} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: item
}));

const showLayout = computed(() => model.value.admin_router_pid === 0);

const showPage = computed(() => model.value.admin_router_menu_type === 2);

const showButtonInput = computed(() => model.value.admin_router_menu_type === 3);

const pageOptions = computed(() => {
  const allPages = [...props.allPages];

  if (model.value.admin_router_route_name && !allPages.includes(model.value.admin_router_route_name)) {
    allPages.unshift(model.value.admin_router_route_name);
  }

  const opts: CommonType.Option[] = allPages.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

const layoutOptions: CommonType.Option[] = [
  {
    label: 'base',
    value: 'base'
  },
  {
    label: 'blank',
    value: 'blank'
  }
];

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetRoleList({
    current: 1,
    page_size: 1000
  });

  if (!error) {
    const options = data.map(item => ({
      label: item.admin_role_name,
      value: item.id
    }));

    roleOptions.value = [...options];
  }
}

async function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  await nextTick();

  // 添加子菜单
  if (props.operateType === 'addChild') {
    const { id } = props.rowData;
    Object.assign(model.value, { admin_router_pid: id });
  }

  if (props.operateType === 'edit') {
    const { admin_router_component, ...rest } = props.rowData;
    const { layout, page } = getLayoutAndPage(admin_router_component);
    const { path, param } = getPathParamFromRoutePath(rest.admin_router_route_path);

    Object.assign(model.value, rest, {
      admin_router_layout: layout,
      admin_router_page: page,
      admin_router_route_path: path,
      admin_router_pathParam: param
    });

    // 按钮key，用于后端鉴权
    Object.assign(model.value, { buttonKey: 'sys:menu:edit' });
  }

  if (!model.value.query) {
    model.value.query = [];
  }
}

function closeDrawer() {
  visible.value = false;
}

function handleUpdateRoutePathByRouteName() {
  if (model.value.admin_router_route_name) {
    model.value.admin_router_route_path = getRoutePathByRouteName(model.value.admin_router_route_name);
  } else {
    model.value.admin_router_route_path = '';
  }
}

function handleUpdateI18nKeyByRouteName() {
  if (model.value.admin_router_route_name) {
    model.value.admin_router_i18n_key = `route.${model.value.admin_router_route_name}` as App.I18n.I18nKey;
  } else {
    model.value.admin_router_i18n_key = null;
  }
}

function getSubmitParams() {
  const { admin_router_layout, admin_router_page, admin_router_pathParam, ...params } = model.value;

  let component: string;

  component = transformLayoutAndPageToComponent(admin_router_layout, admin_router_page);

  const routePath = getRoutePathWithParam(model.value.admin_router_route_path, admin_router_pathParam);

  params.admin_router_component = component;
  params.admin_router_route_path = routePath;

  return params;
}

async function handleSubmit() {
  await validate();

  const params = getSubmitParams();

  if (props.operateType === 'edit') {
    params.type = 'edit';
  } else {
    if (params.admin_router_menu_type === 3) {
      // 按钮key，用于后端鉴权
      Object.assign(model.value, { buttonKey: 'sys:menu:addButton' });
    } else if(params.admin_router_menu_type === 2){
      // 按钮key，用于后端鉴权
      Object.assign(model.value, { buttonKey: 'sys:menu:addChild' });
    } else {
      Object.assign(model.value, { buttonKey: 'sys:menu:add' });
    }
    params.type = 'add';
  }
  // request
  await editMenu(params);

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    getRoleOptions();
  }
});

watch(
  () => model.value.admin_router_route_name,
  () => {
    handleUpdateRoutePathByRouteName();
    handleUpdateI18nKeyByRouteName();
  }
);
</script>

<template>
  <AModal v-model:open="visible" :title="title" width="800px">
    <div class="h-540px">
      <SimpleScrollbar>
        <AForm ref="formRef" :model="model" :rules="rules" :label-col="{ lg: 8, xs: 4 }" label-wrap class="pr-20px">
          <ARow>
            <ACol :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.menuType')" name="admin_router_menu_type">
                <ARadioGroup v-model:value="model.admin_router_menu_type" :disabled="disabledMenuType">
                  <ARadio v-for="item in menuTypeOptions" :key="Number(item.value)" :value="Number(item.value)">
                    {{ $t(item.label) }}
                  </ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>
            <ACol :lg="12" :xs="24">
              <AFormItem v-if="!showButtonInput" :label="$t('page.manage.menu.menuName')" name="admin_router_menu_name">
                <AInput v-model:value="model.admin_router_menu_name" :placeholder="$t('page.manage.menu.form.menuName')" />
              </AFormItem>
              <AFormItem v-else label="按钮名称" name="admin_router_menu_name">
                <AInput v-model:value="model.admin_router_menu_name" placeholder="请输入按钮名称" />
              </AFormItem>
            </ACol>
            <ACol :lg="12" :xs="24">
              <AFormItem v-if="!showButtonInput" :label="$t('page.manage.menu.routeName')" name="admin_router_route_name">
                <AInput v-model:value="model.admin_router_route_name" :placeholder="$t('page.manage.menu.form.routeName')" />
              </AFormItem>
              <AFormItem v-else label="按钮码" name="admin_router_route_name">
                <AInput v-model:value="model.admin_router_route_name" placeholder="请输入按钮编码" />
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.routePath')" name="admin_router_route_path">
                <AInput
                  v-model:value="model.admin_router_route_path"
                  disabled
                  :placeholder="$t('page.manage.menu.form.routePath')"
                />
              </AFormItem>
            </ACol>
            <!--            <ACol  v-if="!showButtonInput" :lg="12" :xs="24">-->
            <!--              <AFormItem :label="$t('page.manage.menu.pathParam')" name="pathParam">-->
            <!--                <AInput v-model:value="model.pathParam" :placeholder="$t('page.manage.menu.form.pathParam')" />-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem v-if="showLayout" :label="$t('page.manage.menu.layout')" name="admin_router_layout">
                <ASelect
                  v-model:value="model.admin_router_layout"
                  :options="layoutOptions"
                  :placeholder="$t('page.manage.menu.form.layout')"
                />
              </AFormItem>
            </ACol>
            <ACol v-if="showPage" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.page')" name="admin_router_page">
                <ASelect
                  v-model:value="model.admin_router_page"
                  :options="pageOptions"
                  :placeholder="$t('page.manage.menu.form.page')"
                />
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem label="i18key/菜单名" name="admin_router_i18n_key">
                <AInput v-model:value="model.admin_router_i18n_key as string" placeholder="请输入菜单名" />
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.order')" name="admin_router_order">
                <AInputNumber
                  v-model:value="model.admin_router_order as number"
                  class="w-full"
                  :placeholder="$t('page.manage.menu.form.order')"
                />
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.iconTypeTitle')" name="admin_router_icon_type">
                <ARadioGroup v-model:value="model.admin_router_icon_type">
                  <ARadio v-for="item in menuIconTypeOptions" :key="Number(item.value)" :value="Number(item.value)">
                    {{ $t(item.label) }}
                  </ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>

            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.icon')" name="admin_router_icon">
                <template v-if="model.admin_router_icon_type === 2">
                  <AInput v-model:value="model.admin_router_icon" :placeholder="$t('page.manage.menu.form.icon')" class="flex-1">
                    <template #suffix>
                      <SvgIcon v-if="model.admin_router_icon" :icon="model.admin_router_icon" class="text-icon" />
                    </template>
                  </AInput>
                </template>
                <template v-if="model.admin_router_icon_type === 1">
                  <ASelect
                    v-model:value="model.admin_router_icon"
                    :placeholder="$t('page.manage.menu.form.localIcon')"
                    :options="localIconOptions"
                  />
                </template>
              </AFormItem>
            </ACol>
            <ACol :lg="12" :xs="24">
              <AFormItem label="状态" name="admin_router_status">
                <ARadioGroup v-model:value="model.admin_router_status">
                  <ARadio v-for="item in enableStatusOptions" :key="Number(item.value)" :value="Number(item.value)">
                    {{ $t(item.label) }}
                  </ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.keepAlive')" name="admin_router_keep_alive">
                <ARadioGroup v-model:value="model.admin_router_keep_alive">
                  <ARadio :value="2">{{ $t('common.yesOrNo.yes') }}</ARadio>
                  <ARadio :value="1">{{ $t('common.yesOrNo.no') }}</ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.constant')" name="admin_router_constant">
                <ARadioGroup v-model:value="model.admin_router_constant">
                  <ARadio :value="2">
                    {{ $t('common.yesOrNo.yes') }}
                  </ARadio>
                  <ARadio :value="1">
                    {{ $t('common.yesOrNo.no') }}
                  </ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.href')" name="admin_router_href">
                <AInput v-model:value="model.admin_router_href as string" :placeholder="$t('page.manage.menu.form.href')" />
              </AFormItem>
            </ACol>
            <ACol v-if="!showButtonInput" :lg="12" :xs="24">
              <AFormItem :label="$t('page.manage.menu.hideInMenu')" name="admin_router_hide_in_menu">
                <ARadioGroup v-model:value="model.admin_router_hide_in_menu">
                  <ARadio :value="2">{{ $t('common.yesOrNo.yes') }}</ARadio>
                  <ARadio :value="1">{{ $t('common.yesOrNo.no') }}</ARadio>
                </ARadioGroup>
              </AFormItem>
            </ACol>
            <!--            <ACol v-if="model.hide_in_menu && !showButtonInput" :lg="12" :xs="24">-->
            <!--              <AFormItem :label="$t('page.manage.menu.activeMenu')" name="active_menu">-->
            <!--                <ASelect-->
            <!--                  v-model:value="model.active_menu as string"-->
            <!--                  :options="pageOptions"-->
            <!--                  clearable-->
            <!--                  :placeholder="$t('page.manage.menu.form.activeMenu')"-->
            <!--                />-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
            <!--            <ACol showButtonInput :lg="12" :xs="24">-->
            <!--              <AFormItem :label="$t('page.manage.menu.multiTab')" name="multi_tab">-->
            <!--                <ARadioGroup v-model:value="model.multi_tab">-->
            <!--                  <ARadio :value="2" label="是" >是</ARadio>-->
            <!--                  <ARadio :value="1" label="否" >否</ARadio>-->
            <!--                </ARadioGroup>-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
            <!--            <ACol showButtonInput :lg="12" :xs="24">-->
            <!--              <AFormItem :label="$t('page.manage.menu.fixedIndexInTab')" name="fixed_index_in_tab">-->
            <!--                <AInputNumber-->
            <!--                  v-model:value="model.fixed_index_in_tab as number"-->
            <!--                  class="w-full"-->
            <!--                  clearable-->
            <!--                  :placeholder="$t('page.manage.menu.form.fixedIndexInTab')"-->
            <!--                />-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
            <!--            <ACol :span="24">-->
            <!--              <AFormItem :label-col="{ span: 4 }" :label="$t('page.manage.menu.query')" name="query">-->
            <!--                <AButton v-if="model.query.length === 0" type="dashed" block @click="addQuery(-1)">-->
            <!--                  <template #icon>-->
            <!--                    <icon-carbon-add class="align-sub text-icon" />-->
            <!--                  </template>-->
            <!--                  <span class="ml-8px">{{ $t('common.add') }}</span>-->
            <!--                </AButton>-->
            <!--                <template v-else>-->
            <!--                  <div v-for="(item, index) in model.query" :key="index" class="flex gap-3">-->
            <!--                    <ACol :span="9">-->
            <!--                      <AFormItem :name="['query', index, 'key']">-->
            <!--                        <AInput-->
            <!--                          v-model:value="item.key"-->
            <!--                          :placeholder="$t('page.manage.menu.form.queryKey')"-->
            <!--                          class="flex-1"-->
            <!--                        />-->
            <!--                      </AFormItem>-->
            <!--                    </ACol>-->
            <!--                    <ACol :span="9">-->
            <!--                      <AFormItem :name="['query', index, 'value']">-->
            <!--                        <AInput-->
            <!--                          v-model:value="item.value"-->
            <!--                          :placeholder="$t('page.manage.menu.form.queryValue')"-->
            <!--                          class="flex-1"-->
            <!--                        />-->
            <!--                      </AFormItem>-->
            <!--                    </ACol>-->
            <!--                    <ACol :span="5">-->
            <!--                      <ASpace class="ml-12px">-->
            <!--                        <AButton size="middle" @click="addQuery(index)">-->
            <!--                          <template #icon>-->
            <!--                            <icon-ic:round-plus class="align-sub text-icon" />-->
            <!--                          </template>-->
            <!--                        </AButton>-->
            <!--                        <AButton size="middle" @click="removeQuery(index)">-->
            <!--                          <template #icon>-->
            <!--                            <icon-ic-round-remove class="align-sub text-icon" />-->
            <!--                          </template>-->
            <!--                        </AButton>-->
            <!--                      </ASpace>-->
            <!--                    </ACol>-->
            <!--                  </div>-->
            <!--                </template>-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
            <!--            <ACol :span="24">-->
            <!--              <AFormItem :label-col="{ span: 4 }" :label="$t('page.manage.menu.button')" name="buttons">-->
            <!--                <AButton v-if="model.buttons.length === 0" type="dashed" block @click="addButton(-1)">-->
            <!--                  <template #icon>-->
            <!--                    <icon-carbon-add class="align-sub text-icon" />-->
            <!--                  </template>-->
            <!--                  <span class="ml-8px">{{ $t('common.add') }}</span>-->
            <!--                </AButton>-->
            <!--                <template v-else>-->
            <!--                  <div v-for="(item, index) in model.buttons" :key="index" class="flex gap-3">-->
            <!--                    <ACol :span="9">-->
            <!--                      <AFormItem :name="['buttons', index, 'code']">-->
            <!--                        <AInput-->
            <!--                          v-model:value="item.key"-->
            <!--                          :placeholder="$t('page.manage.menu.form.buttonCode')"-->
            <!--                          class="flex-1"-->
            <!--                        ></AInput>-->
            <!--                      </AFormItem>-->
            <!--                    </ACol>-->
            <!--                    <ACol :span="9">-->
            <!--                      <AFormItem :name="['buttons', index, 'desc']">-->
            <!--                        <AInput-->
            <!--                          v-model:value="item.title"-->
            <!--                          :placeholder="$t('page.manage.menu.form.buttonDesc')"-->
            <!--                          class="flex-1"-->
            <!--                        ></AInput>-->
            <!--                      </AFormItem>-->
            <!--                    </ACol>-->
            <!--                    <ACol :span="5">-->
            <!--                      <ASpace class="ml-12px">-->
            <!--                        <AButton size="middle" @click="addButton(index)">-->
            <!--                          <template #icon>-->
            <!--                            <icon-ic:round-plus class="align-sub text-icon" />-->
            <!--                          </template>-->
            <!--                        </AButton>-->
            <!--                        <AButton size="middle" @click="removeButton(index)">-->
            <!--                          <template #icon>-->
            <!--                            <icon-ic-round-remove class="align-sub text-icon" />-->
            <!--                          </template>-->
            <!--                        </AButton>-->
            <!--                      </ASpace>-->
            <!--                    </ACol>-->
            <!--                  </div>-->
            <!--                </template>-->
            <!--              </AFormItem>-->
            <!--            </ACol>-->
          </ARow>
        </AForm>
      </SimpleScrollbar>
    </div>
    <template #footer>
      <ASpace justify="end" :size="16">
        <AButton @click="closeDrawer">{{ $t('common.cancel') }}</AButton>
        <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
      </ASpace>
    </template>
  </AModal>
</template>

<style scoped></style>
