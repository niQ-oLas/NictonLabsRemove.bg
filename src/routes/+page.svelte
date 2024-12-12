<script lang="ts">
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';

  const processedImage = writable<Blob | null>(null);
  const responseMessage = writable<string>('');
  const selectedImage = writable<string | null>(null);
  const isProcessed = writable<boolean>(false);
  const isLoading = writable<boolean>(false);

  const API_KEY = 'KDDyEPzu2iC81Fhmg1b3yGUb';

  function handleDownload() {
    if ($processedImage) {
      const url = URL.createObjectURL($processedImage);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'processed-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage.set(e.target?.result as string);
        isProcessed.set(false);
        isLoading.set(false);
        processedImage.set(null);
        responseMessage.set('');
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      responseMessage.set('No valid file uploaded');
      return;
    }
    try {
      isLoading.set(true);
      formData.append('image_file', file);
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove background: ${errorText}`);
      }
      const blob = await response.blob();
      processedImage.set(blob);
      responseMessage.set("Background removed successfully! Want to try again? It's Free!");
      isProcessed.set(true);
      isLoading.set(false);
    } catch (error) {
      console.error('Error:', error);
      responseMessage.set(`An error occurred while processing the image: ${error.message}`);
      processedImage.set(null);
      isLoading.set(false);
    }
  }

  function getImageUrl(blob: Blob | null): string {
    return blob ? URL.createObjectURL(blob) : '';
  }

  let imageUrl = '';

  $: {
    if ($processedImage) {
      imageUrl = getImageUrl($processedImage);
    } else {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        imageUrl = '';
      }
    }
  }

  import { onDestroy } from 'svelte';

  onDestroy(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  });
</script>

<div class="min-h-screen bg-neutral-900 px-4 py-12 text-gray-100 sm:px-6 lg:px-8"> 
  <div class="mx-auto max-w-3xl"> 
    <h1 class="text-6xl text-center font-bold tracking-tighter">
      <span class="text-yellow-400">NicTon</span><span class="text-green-500">Labs</span><span class="text-white-700">™</span>
      <br>
      <span class="text-white">Background Remover</span>
    </h1>
    <br> 

    <form on:submit={handleSubmit} class="mb-8">
      <div class="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <label
          for="image-upload"
          class="inline-flex items-center rounded-md border border-transparent bg-green-700 px-4 py-.5 text-base font-bold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/50 transition-shadow duration-300
"
        >
          <span class="block px-4 py-2">Choose Image</span>
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/*"
            required
            class="sr-only"
            on:change={handleFileSelect}
            on:click={(event: MouseEvent) => {
              (event.target as HTMLInputElement).value = '';
            }}
          />
        </label>
        <button
          type="submit"
          class="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-bold text-white shadow-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:shadow-yellow-500/50 transition-shadow duration-300"
          disabled={$isLoading || !$selectedImage}
        >
          {#if $isLoading}
            <span class="spinner mr-0.5"></span>
            Removing background...
          {:else}
            Remove Background
          {/if}
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-bold text-white shadow-sm hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/50 transition-shadow duration-300"
          disabled={!$processedImage}
          on:click={handleDownload}
        >
          Download
        </button>
      </div>
    </form>

    <div class="mb-8">
      <h2 class="mb-4 text-center text-xl font-semibold">
        {!$isProcessed && $selectedImage ? 'Selected Image' : ''}
        {$isProcessed && $selectedImage ? 'Processed Image' : ''}
        {!$selectedImage ? "Remove the background of your photos. It's easy, simple and free!!" : ''}
      </h2>
      <div class="relative flex justify-center">
        {#if $selectedImage && !$isProcessed}
          <img
            src={$selectedImage}
            alt="Selected"
            class="absolute h-auto max-w-full rounded-lg shadow-lg"
            transition:fade={{ duration: 300 }}
          />
        {:else if imageUrl && $isProcessed}
          <img
            src={imageUrl}
            alt="Processed"
            class="absolute h-auto max-w-full rounded-lg shadow-lg"
            transition:fade={{ duration: 300 }}
          />
        {/if}
        {#if $selectedImage && !$isProcessed}
          <img
            src={$selectedImage}
            alt="Selected"
            class="invisible h-auto max-w-full rounded-lg shadow-lg"
            transition:fade={{ duration: 300 }}
          />
        {:else if imageUrl && $isProcessed}
          <img
            src={imageUrl}
            alt="Processed"
            class="invisible h-auto max-w-full rounded-lg shadow-lg"
            transition:fade={{ duration: 300 }}
          />
        {/if}
      </div>
    </div>

    {#if $responseMessage}
      <p class="mb-6 rounded-md bg-gray-800 p-4 text-center" transition:fade={{ duration: 300 }}>
        {$responseMessage}
      </p>
    {/if}
    <footer class="w-full pt-3">
      <div class="my-10">
        <ul class="flex justify-around items-center text-white text-xl">
          <li>
            <span class="text-white font-mono"></span>
          </li>
          <li>
            <span>
              Built by:
              <a class="text-2xl font-mono underline udnerline-offset-4" href="https://github.com/niQ-oLas" target="_blank" rel="noreferrer">NicTon</a>
            </span>
          </li>
        </ul>
      </div>

    </footer>
  </div>
</div>

<style>
  .spinner {
    border: 10px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 10px solid #ffffff;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
