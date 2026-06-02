<script setup lang="ts">
import { ref, computed } from 'vue';
import { Image as ImageIcon, CheckCircle2, XCircle, Download, Loader2, UploadCloud, FileImage, RefreshCw, AlertTriangle } from 'lucide-vue-next';

const file = ref<File | null>(null);
const previewUrl = ref<string>('');
const resizedPreviewUrl = ref<string>('');
const targetWidth = ref<number | null>(null);
const targetHeight = ref<number | null>(null);
const maintainRatio = ref(true);
const isConverting = ref(false);
const errorMsg = ref('');
const resultBlobUrl = ref<string | null>(null);
const resultFilename = ref<string>('');
const fileStats = ref({ originalSize: 0, newSize: 0 });

const aspectRatio = ref<number | null>(null);
const quality = ref(90);

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const handleFileChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files && t.files.length) {
        const f = t.files[0];
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)) {
            errorMsg.value = 'Pilih PNG/JPG/WebP.';
            return;
        }
        file.value = f;
        errorMsg.value = '';
        resultBlobUrl.value = null;
        fileStats.value.originalSize = f.size;
        if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = URL.createObjectURL(f);
        // get intrinsic dimensions to set defaults
        const img = new Image();
        img.onload = () => {
            aspectRatio.value = img.width / img.height || null;
            targetWidth.value = img.width;
            targetHeight.value = img.height;
            URL.revokeObjectURL(img.src);
        };
        img.src = previewUrl.value;
    } else {
        reset();
    }
};

const reset = () => {
    file.value = null;
    errorMsg.value = '';
    resultFilename.value = '';
    resultBlobUrl.value = null;
    targetWidth.value = null;
    targetHeight.value = null;
    aspectRatio.value = null;
    if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = ''; }
    if (resizedPreviewUrl.value) { URL.revokeObjectURL(resizedPreviewUrl.value); resizedPreviewUrl.value = ''; }
};

const resizeBlobFromFile = (inputFile: File, w: number, h: number, mime = 'image/jpeg', q = 0.92): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(inputFile);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available'));
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            // draw with aspect fit
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('Failed to create blob'));
            }, mime, q);
            URL.revokeObjectURL(url);
        };
        img.onerror = (ev) => { URL.revokeObjectURL(url); reject(new Error('Invalid image')); };
        img.src = url;
    });
};

const createResizedPreview = async () => {
    if (!file.value || !targetWidth.value || !targetHeight.value) return;
    try {
        const blob = await resizeBlobFromFile(file.value, targetWidth.value, targetHeight.value, file.value.type);
        if (resizedPreviewUrl.value) URL.revokeObjectURL(resizedPreviewUrl.value);
        resizedPreviewUrl.value = URL.createObjectURL(blob);
    } catch (e: any) {
        errorMsg.value = e.message || 'Preview resize gagal';
    }
};

const blobToImageBitmap = async (input: File | Blob) => {
    if ('createImageBitmap' in window) {
        return await createImageBitmap(input);
    }

    return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(input);
        img.onload = () => resolve(img);
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Invalid image'));
        };
        img.src = url;
    });
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, q: number) => {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error(`Browser tidak support ${type} encode`));
                return;
            }
            resolve(blob);
        }, type, q);
    });
};

const resizeAndEncodeWebp = async (inputFile: File, width: number, height: number) => {
    const source = await blobToImageBitmap(inputFile);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(source, 0, 0, width, height);

    const avifBlob = await canvasToBlob(canvas, 'image/webp', quality.value / 100);

    return {
        blob: avifBlob,
        width: width,
        height: height,
    };
};

const handleConvert = async () => {
    if (!file.value || !targetWidth.value || !targetHeight.value) return;

    isConverting.value = true;
    errorMsg.value = '';
    resultBlobUrl.value = null;

    try {
        const { blob, width, height } = await resizeAndEncodeWebp(
            file.value,
            targetWidth.value,
            targetHeight.value
        );

        const originalName = file.value.name.replace(/\.[^/.]+$/, '');
        resultFilename.value = `${originalName}.webp`;
        resultBlobUrl.value = URL.createObjectURL(blob);
        fileStats.value.newSize = blob.size;
    } catch (err: any) {
        errorMsg.value = err?.message || 'Gagal convert ke webp.';
    } finally {
        isConverting.value = false;
    }
};

const maintainRatioToggle = () => {
    if (maintainRatio.value && aspectRatio.value && targetWidth.value) {
        targetHeight.value = Math.round(targetWidth.value / aspectRatio.value);
    }
};

const widthChanged = () => {
    if (maintainRatio.value && aspectRatio.value && targetWidth.value) {
        targetHeight.value = Math.round(targetWidth.value / aspectRatio.value);
    }
};

const heightChanged = () => {
    if (maintainRatio.value && aspectRatio.value && targetHeight.value) {
        targetWidth.value = Math.round(targetHeight.value * aspectRatio.value);
    }
};


</script>

<template>
    <div class="w-full max-w-xl mx-auto mt-6" v-cloak>
        <div
            class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-8 pt-10 relative overflow-hidden">
            <div
                class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none">
            </div>

            <div class="mb-8 text-center relative z-10">
                <div
                    class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5 shadow-inner">
                    <ImageIcon class="w-7 h-7" stroke-width="1.5" />
                </div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Resize to WEBP</h2>
                <p class="text-gray-500 text-[15px] leading-relaxed max-w-sm mx-auto">
                    Resize client-side, then convert to WEBP directly in the browser.
                </p>
            </div>

            <form v-if="!resultBlobUrl" @submit.prevent="handleConvert" class="flex flex-col gap-6 relative z-10">
                <div class="relative group">
                    <label
                        class="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all duration-300 overflow-hidden relative">
                        <div v-if="!previewUrl"
                            class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 w-full h-full relative z-10">
                            <UploadCloud
                                class="w-12 h-12 mb-4 text-gray-400 group-hover:text-emerald-500 transition-colors"
                                stroke-width="1.5" />
                            <p class="mb-1 text-sm text-gray-700 font-medium">Click to upload an image</p>
                            <p class="text-xs text-gray-400 mt-1">PNG, JPG or WebP (Max 10MB)</p>
                        </div>

                        <div v-else class="absolute inset-0 w-full h-full">
                            <img :src="previewUrl" class="w-full h-full object-contain p-2 blur-sm opacity-20" />
                            <img :src="previewUrl"
                                class="absolute inset-0 w-full h-full object-contain p-6 scale-95 group-hover:scale-100 transition-transform duration-500" />

                            <div
                                class="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-sm mx-auto max-w-[90%]">
                                <div class="flex items-center gap-2 overflow-hidden">
                                    <FileImage class="w-4 h-4 shrink-0 text-emerald-400" />
                                    <span class="truncate font-medium">{{ file?.name }}</span>
                                </div>
                                <span class="shrink-0 text-gray-300 text-xs font-mono ml-2">{{ formatBytes(file?.size ||
                                    0) }}</span>
                            </div>
                        </div>

                        <input type="file" accept="image/png, image/jpeg, image/webp" class="hidden"
                            @change="handleFileChange" />
                    </label>

                    <button v-if="previewUrl" @click.prevent="reset"
                        class="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-200 shadow-md text-gray-500 hover:text-red-500 hover:border-red-200 rounded-full flex items-center justify-center transition-colors z-20"
                        title="Remove image">
                        <XCircle class="w-5 h-5" />
                    </button>
                </div>

                <div v-if="errorMsg"
                    class="text-sm font-medium flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                    <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
                    <span class="leading-relaxed">{{ errorMsg }}</span>
                </div>

                <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-medium text-gray-700">Width</span>
                            <span class="font-mono text-gray-500">{{ targetWidth ?? '-' }} px</span>
                        </div>
                        <input type="number" min="1"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-gray-200"
                            v-model.number="targetWidth" @input="widthChanged" placeholder="Width" />
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-medium text-gray-700">Height</span>
                            <span class="font-mono text-gray-500">{{ targetHeight ?? '-' }} px</span>
                        </div>
                        <input type="number" min="1"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-gray-200"
                            v-model.number="targetHeight" @input="heightChanged" placeholder="Height" />
                    </div>

                    <label class="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" v-model="maintainRatio" @change="maintainRatioToggle" />
                        Keep ratio
                    </label>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-medium text-gray-700">Quality</span>
                            <span class="font-mono text-gray-500">{{ quality }}</span>
                        </div>
                        <input v-model.number="quality" type="range" min="0" max="100" step="1"
                            class="w-full h-2 rounded-lg accent-emerald-600" />
                        <div class="flex justify-between text-xs text-gray-400 font-mono">
                            <span>0</span>
                            <span>100</span>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button type="button"
                            class="flex-1 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            @click.prevent="createResizedPreview">
                            Create Preview
                        </button>
                        <button type="submit"
                            class="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            :disabled="isConverting || !file">
                            <span v-if="!isConverting">Resize & Convert</span>
                            <span v-else>Processing...</span>
                            <Loader2 v-if="isConverting" class="w-4 h-4 animate-spin" />
                        </button>
                    </div>

                    <div v-if="resizedPreviewUrl">
                        <div class="text-xs font-medium text-gray-600 mb-2">Resized Preview</div>
                        <div class="rounded-lg border border-gray-100 bg-white overflow-hidden mx-auto" :style="{
                            width: targetWidth ? `${targetWidth}px` : '100%',
                            aspectRatio: targetWidth && targetHeight ? `${targetWidth} / ${targetHeight}` : 'auto',
                            maxWidth: '100%'
                        }">
                            <img :src="resizedPreviewUrl" class="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>
            </form>

            <div v-else
                class="flex flex-col items-center justify-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div
                    class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                    <CheckCircle2 class="w-10 h-10" stroke-width="1.5" />
                </div>

                <h3 class="text-2xl font-bold text-gray-900 mb-1">Conversion Complete!</h3>
                <p class="text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">{{
                    resultFilename }}</p>
                <p class="text-gray-500 text-sm mb-6 text-center max-w-xs">
                    Your image has been resized and converted into next-gen WEBP format.
                </p>

                <div class="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
                    <div
                        class="flex items-center justify-between text-sm mb-3 text-gray-600 border-b border-gray-200 pb-3">
                        <span>Original Size</span>
                        <span class="font-mono font-medium text-gray-900">{{ formatBytes(fileStats.originalSize)
                        }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm text-emerald-700 font-medium">
                        <span>WEBP Size</span>
                        <div class="flex items-center gap-2">
                            <span v-if="fileStats.newSize <= fileStats.originalSize">
                                -{{ Math.round((1 - fileStats.newSize / fileStats.originalSize) * 100) }}%
                            </span>
                            <span v-else class="text-red-700">
                                +{{ Math.round((fileStats.newSize / fileStats.originalSize - 1) * 100) }}%
                            </span>
                            <span class="font-mono">{{ formatBytes(fileStats.newSize) }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row w-full gap-3">
                    <a :href="resultBlobUrl" :download="resultFilename"
                        class="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg shadow-emerald-600/20">
                        <Download class="w-5 h-5" /> Download WEBP
                    </a>
                    <button @click="reset"
                        class="flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all">
                        <RefreshCw class="w-4 h-4 text-gray-400" /> New
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
[v-cloak] {
    display: none;
}
</style>