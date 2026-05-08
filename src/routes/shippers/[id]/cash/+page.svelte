<script lang="ts">
  import { page } from '$app/state'

  import {
    collection,
    addDoc
  } from 'firebase/firestore'

  import { db } from '$lib/firebase'

  const shipperId = page.params.id

  let count500 = $state(0)
  let count200 = $state(0)
  let count100 = $state(0)
  let count50 = $state(0)
  let count20 = $state(0)
  let count10 = $state(0)

  function total() {

    return (
      count500 * 500000 +
      count200 * 200000 +
      count100 * 100000 +
      count50 * 50000 +
      count20 * 20000 +
      count10 * 10000
    )

  }

  async function save() {

    if (total() <= 0)
      return

    await addDoc(
      collection(db, 'transactions'),
      {
        shipperId,
        type: 'deposit',
        amount: total(),
        createdAt: Date.now(),
        note: 'Nộp tiền mặt'
      }
    )

    alert('Đã lưu')

    window.history.back()

  }

  const bills = [
    {
      label: '500,000đ',
      value: 500000,
      count: () => count500,
      add: (v:number) => count500 += v,
      reset: () => count500 = 0
    },
    {
      label: '200,000đ',
      value: 200000,
      count: () => count200,
      add: (v:number) => count200 += v,
      reset: () => count200 = 0
    },
    {
      label: '100,000đ',
      value: 100000,
      count: () => count100,
      add: (v:number) => count100 += v,
      reset: () => count100 = 0
    },
    {
      label: '50,000đ',
      value: 50000,
      count: () => count50,
      add: (v:number) => count50 += v,
      reset: () => count50 = 0
    },
    {
      label: '20,000đ',
      value: 20000,
      count: () => count20,
      add: (v:number) => count20 += v,
      reset: () => count20 = 0
    },
    {
      label: '10,000đ',
      value: 10000,
      count: () => count10,
      add: (v:number) => count10 += v,
      reset: () => count10 = 0
    }
  ]
</script>

<div class="min-h-screen bg-slate-100 p-4">

  <div class="max-w-3xl mx-auto">

    <a
      href={`/shippers/${shipperId}`}
      class="text-blue-600 font-semibold"
    >
      ← Quay lại
    </a>

    <h1
      class="text-4xl font-bold mt-4 mb-8"
    >
      Nhận tiền mặt
    </h1>

    <div class="space-y-4">

      {#each bills as bill}

        <div
          class="bg-white rounded-3xl shadow p-5"
        >

          <div
            class="flex items-center justify-between"
          >

            <div>

              <div
                class="text-2xl font-bold"
              >
                {bill.label}
              </div>

              <div
                class="text-slate-500 mt-1"
              >
                {bill.count()} tờ
              </div>

            </div>

            <div
              class="text-2xl font-bold text-blue-600"
            >
              {(bill.count() * bill.value).toLocaleString()} đ
            </div>

          </div>

          <div
            class="flex gap-2 mt-5 flex-wrap"
          >

            <button
              on:click={() => bill.add(1)}
              class="bg-slate-100 px-5 py-3 rounded-2xl font-bold"
            >
              +1
            </button>

            <button
              on:click={() => bill.add(2)}
              class="bg-slate-100 px-5 py-3 rounded-2xl font-bold"
            >
              +2
            </button>

            <button
              on:click={() => bill.add(5)}
              class="bg-slate-100 px-5 py-3 rounded-2xl font-bold"
            >
              +5
            </button>

            <button
              on:click={() => bill.add(10)}
              class="bg-slate-100 px-5 py-3 rounded-2xl font-bold"
            >
              +10
            </button>

            <button
              on:click={() => bill.reset()}
              class="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold"
            >
              Reset
            </button>

          </div>

        </div>

      {/each}

    </div>

    <div
      class="bg-blue-600 text-white rounded-3xl p-6 mt-8"
    >

      <div class="text-lg">
        Tổng tiền
      </div>

      <div
        class="text-5xl font-bold mt-3"
      >
        {total().toLocaleString()} đ
      </div>

    </div>

    <button
      on:click={save}
      class="w-full bg-blue-600 text-white rounded-3xl p-5 text-2xl font-bold mt-6"
    >
      Lưu tiền mặt
    </button>

  </div>

</div>