<template>
    <div class="sdk-web-modal"></div>
</template>

<script>
    import "../basis/normalize-css.js";
    import "../basis/element-ui.js";
    import { Message, MessageBox } from "element-ui";
    import types from "../utils/types.js";
    const { isNumber, string, int, array } = types;
    export default {
        name: "sdk-web-modal",
        props: {},
        data: () => ({
            acting: false,
        }),
        methods: {
            toast(content, icon, duration) {
                return new Promise((resolve) => {
                    if (!string(content)) return resolve();
                    Message.closeAll();
                    Message({
                        customClass: this.$options.name,
                        message: string(content),
                        type: string(icon) || "info",
                        dangerouslyUseHTMLString: true,
                        duration: Math.max(isNumber(duration) ? int(duration) : 2000, 500),
                        showClose: true,
                        onClose: () => resolve(),
                    });
                });
            },
            alert(title, content, icon, btns) {
                return new Promise((resolve) => {
                    if (this.acting || !string(content)) return resolve();
                    this.acting = true;
                    MessageBox.alert(string(content), string(title), {
                        customClass: this.$options.name,
                        dangerouslyUseHTMLString: true,
                        type: string(icon) || "info",
                        callback: (action) => setTimeout(() => {
                            this.acting = false;
                            resolve(action === "confirm");
                        }, 350),
                        showClose: !["warning", "error"].includes(string(icon)),
                        distinguishCancelAndClose: true,
                        showConfirmButton: true,
                        showCancelButton: array(btns).length > 1,
                        confirmButtonText: string(array(btns)[0]) || "确定",
                        cancelButtonText: string(array(btns)[1]) || "取消",
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        closeOnHashChange: false,
                    });
                });
            },
            prompt(title, content, placeholder, value, btns) {
                return new Promise((resolve) => {
                    if (this.acting) return resolve();
                    this.acting = true;
                    MessageBox.prompt(string(content), string(title), {
                        customClass: this.$options.name,
                        dangerouslyUseHTMLString: true,
                        callback: (action, instance) => setTimeout(() => {
                            this.acting = false;
                            resolve(action === "confirm" ? instance.inputValue : null);
                        }, 350),
                        showClose: true,
                        distinguishCancelAndClose: true,
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: string(array(btns)[0]) || "确定",
                        cancelButtonText: string(array(btns)[1]) || "取消",
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        closeOnHashChange: false,
                        inputPlaceholder: string(placeholder) || "请在此输入",
                        inputType: "text",
                        inputValue: string(value),
                    });
                });
            },
        },
    };
</script>

<style lang="scss">
    .sdk-web-modal {
        &.el-message-box {
            margin-bottom: 20px;
            padding-bottom: 0;
        }

        .el-message-box__header {
            padding: 10px;
            background-color: #f0f0f0;
        }

        .el-message-box__title {
            margin-right: 50px;
            font-size: 16px;
            line-height: 20px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .el-message-box__headerbtn {
            box-sizing: border-box;
            top: 0;
            right: 0;
            padding: 10px;
            width: 40px;
            height: 40px;
            font-size: 20px;
            line-height: 20px;

            .el-message-box__close {
                vertical-align: middle;
            }
        }

        .el-message-box__content {
            margin: 15px;
            padding: 0;
        }

        .el-message-box__btns {
            margin: 30px 15px 15px;
            padding: 0;
        }
    }
</style>