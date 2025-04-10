<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import { useAntdForm, useFormRules } from '@/hooks/common/form';
import {fetchGetCaptcha, fetchRegister} from "@/service/api";

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useAntdForm();
const captchaImage = ref(''); // 存储Base64图片
const loading = ref(false); // 加载状态

interface FormModel {
  username: string;
  code: string;
  password: string;
  check_password: string;
  id: number;
}

const model: FormModel = reactive({
  username: '',
  code: '',
  password: '',
  check_password: '',
  id: null
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    username: formRules.username,
    code: formRules.code,
    password: formRules.password,
    check_password: createConfirmPwdRule(model.password)
  };
});

// 获取验证码
const getCaptcha = async () => {
  try {
    loading.value = true;
    const res = await fetchGetCaptcha();
    if(res.code === 200) {
      captchaImage.value = res.data.image;
      model.id = res.data.id;
    }
  } catch (err) {
    console.error('获取验证码失败', err);
  } finally {
    loading.value = false;
  }
};

// 防抖相关状态
const debounceTimer = ref<number | null>(null)

// 防抖函数（TS实现）
const debounceGetCaptcha = () => {
  // 清除已有定时器
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  // 立即进入加载状态
  loading.value = true

  // 设置新定时器
  debounceTimer.value = setTimeout(async () => {
    try {
      await getCaptcha() // 实际获取验证码的方法
    } finally {
      loading.value = false
      debounceTimer.value = null
    }
  }, 500) //
}
// 初始化时获取验证码
getCaptcha();

async function handleSubmit() {
  await validate();
  // request to register
  const res = await fetchRegister(model.username, model.password, model.check_password, model.code, model.id);

  window.$message?.success($t('page.login.common.validateSuccess'));
  if(res.code === 200) {
    toggleLoginModule('pwd-login');
  }
}
</script>

<template>
  <AForm ref="formRef" :model="model" :rules="rules" @keyup.enter="handleSubmit">
    <AFormItem name="username">
      <AInput v-model:value="model.username" size="large" placeholder="请输入用户名" />
    </AFormItem>
    <AFormItem name="password">
      <AInputPassword
        v-model:value="model.password"
        size="large"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </AFormItem>
    <AFormItem name="check_password">
      <AInputPassword
        v-model:value="model.check_password"
        size="large"
        :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      />
    </AFormItem>
    <AFormItem name="code">
      <div class="w-full flex-y-center gap-16px">
        <AInput v-model:value="model.code" size="large" :placeholder="$t('page.login.common.codePlaceholder')" />
        <!-- 替换为验证码图片展示 -->
        <div
          v-if="captchaImage"
          class="captcha-image-wrapper  cursor-pointer"
          @click="debounceGetCaptcha"
        >
          <img
            :src="captchaImage"
            alt="验证码"
            class="h-40px w-170px border-1 border-gray-300"
          />
          <div v-if="loading" class="loading-overlay">
            <ASpin size="small" />
          </div>
        </div>
        <ASkeleton v-else active :paragraph="{ rows: 1 }" class="h-40px w-120px" />
      </div>
    </AFormItem>
    <ASpace direction="vertical" size="large" class="w-full">
      <AButton type="primary" block size="large" shape="round" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </AButton>
      <AButton block size="large" shape="round" @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </AButton>
    </ASpace>
  </AForm>
</template>

<style scoped></style>
