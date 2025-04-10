<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import {editCategory, editCouponLink, fetchGetAllCategorys, uploadFile} from "@/service/api";
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
const { defaultRequiredRule} = useFormRules();

const title = computed(() => {
  const titles: Record<AntDesign.TableOperateType, string> = {
    add: '新增分类',
    edit: '编辑分类'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.CouponManage.CouponLinkCategoryEditParams,
  |'type'
 | 'cps_category_name'
  | 'cps_category_status'
  | 'cps_category_icon_url'
  | 'cps_category_desc'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    type: 'add',
    cps_category_name: '',
    cps_category_icon_url: '',
    cps_category_desc: '',
    cps_category_status: 1,
  };
}

type RuleKey = Extract<keyof Model, 'cps_category_name' | 'cps_category_status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  cps_category_name: defaultRequiredRule,
  cps_category_status: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();

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
  const res = await editCategory(model.value)
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
  if (info.file.status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj, (base64Url: string) => {
      imageUrl.value = base64Url;
      loading.value = false;
    });
    message.success(`${info.file.name} 上传成功`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 上传失败`);
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
  formdata.append('type','1');

  uploadFile(formdata)
    .then((res) => {
      console.log('上传成功', res.data);
      // 调用实例的成功方法通知组件该文件上传成功
      model.value.cps_category_icon_url = res.data?.url;
      e.onSuccess(res.data, e);
    })
    .catch((err) => {
      // 调用实例的失败方法通知组件该文件上传失败
      e.onError(err);
    });
}

const file = ref({});
// const headers = {
//   authorization: 'authorization-text',
// };

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    resetFields();
    }
});
</script>

<template>
  <ADrawer v-model:open="visible" :title="title" :width="360">
    <AForm ref="formRef" layout="vertical" :model="model" :rules="rules">
      <AFormItem label="名称" name="cps_category_name">
        <AInput v-model:value="model.cps_category_name" placeholder="请输入分类名称" />
      </AFormItem>
      <AFormItem label="" name="cps_category_status">
        <ARadioGroup v-model:value="model.cps_category_status">
          <a-radio  :value="1">启用</a-radio>
          <a-radio  :value="2">禁用</a-radio>
        </ARadioGroup>
      </AFormItem>
      <AFormItem label="图标地址" name="cps_category_icon_url">
        <a-upload
          v-model:file="file"
          name="file"
          :before-upload="beforeUpload"
          :customRequest="customUpload"
          :show-upload-list="false"
          @change="handleChange"
        >
          <img v-if="imageUrl" :src="imageUrl" alt="icon" />
          <a-button>
            <upload-outlined></upload-outlined>
            上传图标
          </a-button>
        </a-upload>
      </AFormItem>
      <AFormItem label="描述" name="cps_category_desc">
        <ATextarea v-model:value="model.cps_category_desc" placeholder="输入描述" />
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
