<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import {editCouponLink, fetchGetAllCategorys, uploadFile} from "@/service/api";
import {message, Upload, UploadChangeParam, UploadProps} from "ant-design-vue";

defineOptions({
  name: 'CategoryOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: AntDesign.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
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
const { defaultRequiredRule , notZeroRequiredRule} = useFormRules();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: '新增领券链接',
    edit: '编辑领券链接'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.CouponManage.CouponLinkEditParams,
  |'type'
  | 'op_cps_link_category_id'
  | 'op_cps_link_name'
  | 'op_cps_link_app_id'
  | 'op_cps_link_original_id'
  | 'op_cps_link_path'
  | 'op_cps_link_icon_url'
  | 'op_cps_link_desc'
  | 'op_cps_link_sort'
  | 'op_cps_link_status'
  | 'op_cps_link_type'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    type: 'add',
    op_cps_link_category_id: null,
    op_cps_link_name: '',
    op_cps_link_app_id: '',
    op_cps_link_original_id: '',
    op_cps_link_path: '',
    op_cps_link_icon_url: '',
    op_cps_link_desc: '',
    op_cps_link_sort: 10,
    op_cps_link_status: 1,
    op_cps_link_type: 1
  };
}

type RuleKey = Extract<keyof Model, 'op_cps_link_category_id' | 'op_cps_link_path' | 'op_cps_link_icon_url' | 'op_cps_link_name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  op_cps_link_category_id: notZeroRequiredRule,
  op_cps_link_path: defaultRequiredRule,
  op_cps_link_name: defaultRequiredRule
};

/** the enabled role options */
const categoryOptions = ref<CommonType.Option<number>[]>([]);

async function getCategoryOptions() {
  const { error, data } = await fetchGetAllCategorys(
    {
      current: 1,
      page_size: 10,
      type: 'list'
    }
  );

  if (!error) {
    const options = data?.list.map(item => ({
      label: item.op_cps_category_name,
      value: item.id
    }));

    categoryOptions.value = [...options];
  }
}

function handleInitModel() {
  model.value = createDefaultModel();
  imageUrl.value = '';
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
  model.value.type = props.operateType
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const res = await editCouponLink(model.value)
  console.log('res: ', res)
  if (res.response.data.code !== 200) {
    window.$message?.error(res.response.data.msg);
    return;
  }
  closeDrawer();
  emit('submitted');
}

const loading = ref<boolean>(false);
const imageUrl = ref<string>('');
function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

const handleChange = async (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    // Get this url from response in real world.
    getBase64(info.file.originFileObj, (base64Url: string) => {
      imageUrl.value = base64Url;
      loading.value = false;
    });
  }
  if (info.file.status === 'error') {
    loading.value = false;
    message.error('upload error');
  }
};

const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error(`${file.name} is not an image file`);
    return Upload.LIST_IGNORE;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error(`${file.name} must smaller than 2MB`);
    return Upload.LIST_IGNORE;
  }

  return true;
};

const customUpload= (e) => {
  console.log(e);
  const formdata = new FormData();
  formdata.append('file', e.file);
  formdata.append('type','2');

  uploadFile(formdata)
    .then((res) => {
      console.log('上传成功', res.data);
      // 调用实例的成功方法通知组件该文件上传成功
      model.value.op_cps_link_icon_url = res.data?.url;
      e.onSuccess(res.data, e);
    })
    .catch((err) => {
      // 调用实例的失败方法通知组件该文件上传失败
      e.onError(err);
    });
}

const file = ref([]);
// const headers = {
//   authorization: 'authorization-text',
// };

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    // getRoleOptions();
    getCategoryOptions();
  }
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="360">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem label="排序值" name="op_cps_link_sort">
        <a-input-number id="inputNumber" v-model:value="model.op_cps_link_sort" :min="1" :max="1000" placeholder="排序值-越小越靠前"/>

      </AFormItem>
      <AFormItem label="名称" name="op_cps_link_name">
        <AInput v-model:value="model.op_cps_link_name" placeholder="请输入领券链接名称" />
      </AFormItem>
      <AFormItem label="分类id" name="op_cps_link_category_id">
        <ASelect
          v-model:value="model.op_cps_link_category_id"
          multiple
          @click="getCategoryOptions"
          :options="categoryOptions"
          placeholder="请选择分类id"
        />
      </AFormItem>
      <AFormItem label="" name="op_cps_link_status">
        <ARadioGroup v-model:value="model.op_cps_link_status">
          <a-radio  :value="1">启用</a-radio>
          <a-radio  :value="2">禁用</a-radio>
        </ARadioGroup>
      </AFormItem>
      <AFormItem label="链接类型" name="op_cps_link_type">
        <ARadioGroup v-model:value="model.op_cps_link_type">
          <ARadioGroup v-model:value="model.op_cps_link_type">
            <a-radio  :value="1">普通链接</a-radio>
            <a-radio  :value="2">小程序</a-radio>
            <a-radio  :value="3">APP链接</a-radio>
          </ARadioGroup>
        </ARadioGroup>
      </AFormItem>
      <AFormItem label="APPID" name="op_cps_link_app_id">
        <AInput v-model:value="model.op_cps_link_app_id" placeholder="请输入小程序APPID" />
      </AFormItem>
      <AFormItem label="小程序原始id" name="op_cps_link_original_id">
        <AInput v-model:value="model.op_cps_link_original_id" placeholder="请输入小程序原始id" />
      </AFormItem>
      <AFormItem label="跳转链接" name="op_cps_link_path">
        <AInput v-model:value="model.op_cps_link_path" placeholder="请输入跳转链接" />
      </AFormItem>
      <AFormItem label="图标地址" name="op_cps_link_icon_url">
        <a-upload
          v-model:file="file"
          name="file"
          class="avatar-uploader"
          :before-upload="beforeUpload"
          :customRequest="customUpload"
          :show-upload-list="false"
          @change="handleChange"
        >
          <img v-if="imageUrl" :src="imageUrl" alt="icon" />
          <div v-else>
            <loading-outlllined v-if="loading"></loading-outlllined>
            <plus-outlined v-else></plus-outlined>
            <AButton class="bg-gray-300">上传图标</AButton>
          </div>
        </a-upload>
      </AFormItem>
      <AFormItem label="描述" name="op_cps_link_desc">
        <ATextarea v-model:value="model.op_cps_link_desc" placeholder="输入描述" />
      </AFormItem>
    </AForm>
    <template #footer>
      <ASpace :size="16">
        <AButton @click="closeDrawer">{{ $t('common.cancel') }}</AButton>
        <AButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</AButton>
      </ASpace>
    </template>
  </ADrawer>
</template>

<style scoped></style>
