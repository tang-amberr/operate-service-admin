<script setup lang="tsx">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { Tag } from 'ant-design-vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { useTable, useTableScroll } from '@/hooks/common/table';
import { companyAdd, companyTags, enterpriseMemberList, memberManage } from '@/service/api/wechatfans';

// 远程搜索
const { tableWrapperRef, scrollConfig } = useTableScroll();

defineOptions({
  name: 'WechatEnterpriseChildDrawer'
});

interface Props {
  /** the type of operation */
  operateType: AntDesign.TableOperateType;
  /** the edit row data */
  rowData?: any | null;
  company: any;
}

const props = defineProps<Props>();
console.log('rowdata', props.rowData);
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
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: '新增企业',
    edit: '编辑成员'
  };
  return titles[props.operateType];
});

interface CompanyApiParams {
  company_name: string;
  company_type: number;
  company_status: number;
  company_remarks: string;
  company_seats_numbers: number;
  company_corp_id: string;
  company_agent_id: string;
}

type CompanyModel = Pick<
  CompanyApiParams,
  Extract<
    keyof CompanyApiParams,
    | 'company_name'
    | 'company_type'
    | 'company_status'
    | 'company_remarks'
    | 'company_seats_numbers'
    | 'company_corp_id'
    | 'company_agent_id'
  >
>;

const companyModel: CompanyModel = reactive(createDefaultCompanyModel());

function createDefaultCompanyModel(): CompanyModel {
  return {
    company_name: '',
    company_type: null,
    company_status: null,
    company_remarks: '',
    company_seats_numbers: null,
    company_corp_id: '',
    company_agent_id: ''
  };
}

interface ApiParams {
  company_id: number;
  type: string;
  user_account: string;
  user_name: string;
  account_type: number;
  authorization_label: string;
}

const childrenDrawer = ref<boolean>(false);
const addSuper = ref<boolean>(false);
const operateTypeNew = ref<string>('edit');

type Model = Pick<
  ApiParams,
  Extract<
    keyof ApiParams,
    'company_id' | 'type' | 'user_account' | 'user_name' | 'account_type' | 'authorization_label'
  >
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    company_id: 0,
    type: '',
    user_account: '',
    user_name: '',
    account_type: null,
    authorization_label: '',
    company_corp_id: ''
  };
}

type RuleKey = Extract<keyof Model, string>;
type CompanyRuleKey = Extract<keyof CompanyModel, string>;

const companyRules: Record<CompanyRuleKey, App.Global.FormRule> = {
  company_name: defaultRequiredRule,
  company_type: defaultRequiredRule,
  company_status: defaultRequiredRule,
  company_corp_id: defaultRequiredRule,
  company_remarks: defaultRequiredRule,
  company_seats_numbers: defaultRequiredRule,
  company_agent_id: defaultRequiredRule
};
const rules: Record<RuleKey, App.Global.FormRule> = {
  user_account: [
    {
      required: true,
      message: '不能为空',
      trigger: 'blur'
    },
    {
      //   判断是否是手机号
      validator: (rule: any, value: string, callback: (arg0: Error | undefined) => void) => {
        if (!/^1[3-9]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的手机号'));
        } else {
          callback();
        }
      }
    }
  ],
  account_type: defaultRequiredRule
};

async function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData && operateTypeNew.value === 'editAdd') {
    const data = props.rowData;
    await nextTick();
    Object.assign(model, data);
  }
}

// const value = ref();
const { columns, columnChecks, data, loading, getData, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: enterpriseMemberList,
  apiParams: {
    company_id: props.rowData?.id ? props.rowData.id : 0,
    current: 1,
    page_size: 10
  },
  columns: () => [
    {
      key: 'company_member_user_account',
      dataIndex: 'company_member_user_account',
      title: '用户账户',
      align: 'center',
      width: 150
    },
    {
      key: 'company_member_user_name',
      dataIndex: 'company_member_user_name',
      title: '用户名',
      align: 'center',
      width: 150
    },
    {
      key: 'company_member_account_type',
      dataIndex: 'company_member_account_type',
      title: '身份',
      align: 'center',
      customRender: ({ record }) => {
        const label =
          record.company_member_account_type === 1
            ? '企业超管'
            : record.company_member_account_type === 2
              ? '企业管理员'
              : '企业员工';
        return (
          <Tag
            color={
              record.company_member_account_type === 1
                ? 'blue'
                : record.company_member_account_type === 2
                  ? '#87d068'
                  : 'default'
            }
          >
            {label}
          </Tag>
        );
      }
    },
    {
      key: 'company_member_scope_of_authority',
      dataIndex: 'company_member_scope_of_authority',
      title: '授权标签',
      align: 'center',
      customRender: ({ record }) => {
        const label = record.company_member_scope_of_authority
          ? JSON.parse(record.company_member_scope_of_authority)
          : [];
        return label.length > 0 ? label.map((item: any) => item.fans_name).join(',') : '';
      }
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      minWidth: 200,
      customRender: ({ record }) => {
        return (
          <div class="flex-center gap-8px">
            <a-button color="primary" type="primary" onClick={() => editMember(record)}>
              修改
            </a-button>
          </div>
        );
      }
    }
  ]
});

function editMember(record: any) {
  childrenDrawer.value = true;
  const row = { ...record };
  row.account_type = record.company_member_account_type;
  row.company_corp_id = props.rowData.id;
  row.id = record.id;
  row.authorization_label = record.company_member_scope_of_authority;
  row.user_name = record.company_member_user_name;
  row.user_account = record.company_member_user_account;
  row.company_id = props.rowData.id;
  row.type = 'edit';
  Object.assign(model, row);
  selectTags.value = model.authorization_label
    ? JSON.parse(model.authorization_label).map((item: any) => item.fans_tags_id)
    : [];
  addSuper.value = record.company_member_account_type === 1;
}

const fans_tags_info = ref<any>([]);
const selectTags = ref<any>([]);
const getcompanyTags = () => {
  companyTags({ company_id: `${searchParams.company_id}` }).then(res => {
    fans_tags_info.value = res.data.fans_tags_info;
  });
};

watch(visible, () => {
  console.log('row', props.rowData);
  if (visible.value) {
    handleInitModel();
    resetFields();
    searchParams.company_id = props.rowData?.id ? props.rowData.id : 0;
    getData();
    getcompanyTags();
  }
});

watch(childrenDrawer, () => {
  if (!childrenDrawer.value) {
    handleInitModel();
    addSuper.value = false;
  }
});

async function handleSubmit() {
  console.log('model', model.type);
  await validate();

  console.log('opernew', model);
  // request
  if (props.operateType === 'edit') {
    let requestData = {
      ...model,
      company_id: props.rowData.id ? props.rowData.id : 0
    };
    if (operateTypeNew.value !== 'editAdd') {
      const selectTagsData = selectTags.value.map((item: any) => {
        return fans_tags_info.value.find((i: { fans_tags_id: any }) => i.fans_tags_id === item);
      });

      requestData = {
        ...model,
        authorization_label: JSON.stringify(selectTagsData),
        company_id: props.rowData.id ? props.rowData.id : 0
      };
    }
    if (addSuper.value) {
      requestData = {
        ...model,
        company_id: props.rowData.id ? props.rowData.id : 0,
        account_type: 1
      };
    }
    console.log(requestData);

    await memberManage(requestData);
    closeChildDrawer();
    if (requestData.type === 'add') {
      window.$message?.success($t('common.addSuccess'));
    } else {
      window.$message?.success($t('common.updateSuccess'));
    }
    getData();
  } else {
    const res = await companyAdd(companyModel);
    console.log('res', res);
    closeDrawer();
    window.$message?.success($t('common.addSuccess'));
  }
  emit('submitted');
}
function closeDrawer() {
  resetFields();
  visible.value = false;
  addSuper.value = false;
}
function closeChildDrawer() {
  resetFields();
  childrenDrawer.value = false;
  operateTypeNew.value = '';
}
const showChildrenDrawer = () => {
  addSuper.value = false;
  childrenDrawer.value = true;
  model.type = 'add';
};
const showChildrenDrawerAddSuper = () => {
  addSuper.value = true;
  childrenDrawer.value = true;
  model.type = 'add';
};
</script>

<template>
  <ADrawer v-if="operateType === 'add'" v-model:open="visible" :title="title" :width="600">
    <AForm ref="formRef" :model="companyModel" :rules="companyRules">
      <AFormItem label="企业名称" name="company_name">
        <AInput v-model:value="companyModel.company_name" />
      </AFormItem>
      <AFormItem label="企业标识" name="company_corp_id">
        <AInput v-model:value="companyModel.company_corp_id" />
      </AFormItem>
      <AFormItem label="企业类型" name="company_type">
        <ASelect
          v-model:value="companyModel.company_type"
          :options="[
            { label: '私有', value: 1 },
            { label: '外部', value: 2 }
          ]"
        />
      </AFormItem>
      <AFormItem label="企业状态" name="company_status">
        <ASelect
          v-model:value="companyModel.company_status"
          :options="[
            { label: '禁用', value: 1 },
            { label: '启用', value: 2 }
          ]"
        />
      </AFormItem>
      <AFormItem label="备注">
        <AInput v-model:value="companyModel.company_remarks" />
      </AFormItem>
      <AFormItem label="坐席数" name="company_seats_numbers">
        <AInputNumber v-model:value="companyModel.company_seats_numbers" class="w-full" min="0" />
      </AFormItem>
      <AFormItem label="应用id" name="company_agent_id">
        <AInput v-model:value="companyModel.company_agent_id" />
      </AFormItem>
    </AForm>
    <template #footer>
      <ASpace :size="16">
        <AButton @click="closeDrawer">{{ $t('common.cancel') }}</AButton>
        <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
      </ASpace>
    </template>
  </ADrawer>
  <ADrawer v-else v-model:open="visible" :title="title" :width="1000">
    <AForm layout="vertical">
      <AButton type="primary" @click="showChildrenDrawerAddSuper">添加超管</AButton>
      <AButton style="margin-left: 10px" type="primary" @click="showChildrenDrawer">添加成员</AButton>
    </AForm>
    <Br />
    <ATable
      ref="tableWrapperRef"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="mobilePagination"
      :scroll="scrollConfig"
      class="h-full"
    />
    <ADrawer v-model:open="childrenDrawer" title="添加/修改 成员" :width="600" :closable="false">
      <AForm ref="formRef" :model="model" :rules="rules">
        <AFormItem label="企业名称">
          <AInput :value="props.company.company_name" disabled />
        </AFormItem>
        <AFormItem v-if="addSuper" label="账号类型">
          <AInput value="企业超管" disabled />
        </AFormItem>
        <AFormItem v-if="!addSuper" label="账号类型" name="account_type">
          <ASelect
            v-model:value="model.account_type"
            :options="[
              { label: '企业管理员', value: 2 },
              { label: '企业员工', value: 3 }
            ]"
          />
        </AFormItem>
        <AFormItem label="慧赚生活用户账号" name="user_account">
          <AInput v-model:value="model.user_account" :maxlength="11" />
        </AFormItem>
        <AFormItem v-if="!addSuper" label="授权标签" name="authorization_label">
          <ASelect
            v-model:value="selectTags"
            :options="fans_tags_info"
            mode="tags"
            placeholder="请选择标签"
            class="w-full"
            :field-names="{ label: 'fans_name', value: 'fans_tags_id' }"
          ></ASelect>
        </AFormItem>
        <AFormItem label="用户名称 (选填)">
          <AInput v-model:value="model.user_name" />
        </AFormItem>
      </AForm>
      <template #footer>
        <ASpace :size="16">
          <AButton @click="closeChildDrawer">{{ $t('common.cancel') }}</AButton>
          <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
        </ASpace>
      </template>
    </ADrawer>
  </ADrawer>
</template>

<style lang="scss" scoped>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
