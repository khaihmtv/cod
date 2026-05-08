<script lang="ts">
  import { addDoc, collection } from 'firebase/firestore'
  import { goto } from '$app/navigation'

  import { db } from '$lib/firebase'

  let name = $state('')
  let bankName = $state('')
  let bankNumber = $state('')

  let loading = $state(false)

  async function createShipper() {

    if (
      !name ||
      !bankName ||
      !bankNumber
    ) {
      alert('Vui lòng nhập đầy đủ')
      return
    }

    try {

      loading = true

      await addDoc(
        collection(db, 'shippers'),
        {
          name,
          bankName,
          bankNumber,
          createdAt: Date.now()
        }
      )

      alert('Thêm shipper thành công')

      goto('/')

    } catch (err) {

      console.error(err)

      alert('Có lỗi xảy ra')

    } finally {

      loading = false

    }

  }
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-2xl mx-auto">

    <div class="mb-8">

      <a
        href="/"
        class="text-blue-600 font-semibold"
      >
        ← Về trang chủ
      </a>

      <h1 class="text-4xl font-bold mt-4">
        Thêm mới
      </h1>

      <p class="text-slate-500 mt-2">
        Tạo thông tin shipper mới
      </p>

    </div>

    <div class="bg-white rounded-3xl shadow p-6">

      <div class="space-y-4">

        <!-- Name -->

        <div>

          <label class="block mb-2 font-semibold">
            Tên shipper
          </label>

          <input
            bind:value={name}
            placeholder="Nguyễn Văn A"
            class="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <!-- Bank -->

        <div>

          <label class="block mb-2 font-semibold">
            Ngân hàng
          </label>

          <input
            bind:value={bankName}
            placeholder="MB Bank"
            class="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <!-- Bank Number -->

        <div>

          <label class="block mb-2 font-semibold">
            Số tài khoản
          </label>

          <input
            bind:value={bankNumber}
            placeholder="123456789"
            class="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <!-- Button -->

        <button
          on:click={createShipper}
          disabled={loading}
          class="w-full bg-black text-white rounded-2xl p-4 font-bold disabled:opacity-50"
        >

          {#if loading}
            Đang tạo...
          {:else}
            Thêm shipper
          {/if}

        </button>

      </div>

    </div>

  </div>

</div>