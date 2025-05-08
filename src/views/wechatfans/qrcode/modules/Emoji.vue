<script setup>
import { ref } from 'vue';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

defineOptions({
  name: 'Emoji'
});

const text_1 = ref('');

const onVue3EmojiPicker = emoji => {
  text_1.value += emoji.i;
  /* 结果示例
  {
      i: "ernes", // 表情图标
      n: ["kissing face"],
      r: "1f61a", // 包含肤色
      t: "neutral", // 肤色
      u: "1f61a" // 不带肤色
  }
  */
};
</script>

<template>
  <div class="Com_view">
    <div class="emoje_1 box_emoje">
      <span>选择表情</span>
      <EmojiPicker :native="true" @select="onVue3EmojiPicker" />
      <span>输出：{{ text_1 }}</span>
    </div>
  </div>
</template>
