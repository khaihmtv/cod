<script lang="ts">
  import { page } from '$app/state'

  import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    addDoc
  } from 'firebase/firestore'

  import { db } from '$lib/firebase'

  import { onMount } from 'svelte'

  import dayjs from 'dayjs'

  let shipper = $state<any>(null)

  let transactions = $state<any[]>([])

  const shipperId = page.params.id

  // transfer

  let transferAmount = $state(0)

  // cash counter

  let count500 = $state(0)
  let count200 = $state(0)
  let count100 = $state(0)
  let count50 = $state(0)
  let count20 = $state(0)
  let count10 = $state(0)

  onMount(async () => {

    const shipperDoc = await getDoc(
      doc(db, 'shippers', shipperId)
    )

    if (shipperDoc.exists()) {

      shipper = {
        id: shipperDoc.id,
        ...shipperDoc.data()
      }

    }

    const q = query(
      collection(db, 'transactions'),
      where('shipperId', '==', shipperId),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {

        transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    return () => unsub()

  })

  function isToday(timestamp: number) {

    return (
      dayjs(timestamp).format(
        'DD/MM/YYYY'
      ) === dayjs().format(
        'DD/MM/YYYY'
      )
    )

  }

  function isThisMonth(timestamp: number) {

    return (
      dayjs(timestamp).format(
        'MM/YYYY'
      ) === dayjs().format(
        'MM/YYYY'
      )
    )

  }

  function totalTodayDeposit() {

    return transactions
      .filter(
        t =>
          t.type === 'deposit' &&
          isToday(t.createdAt)
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  function totalTodayTransfer() {

    return transactions
      .filter(
        t =>
          t.type === 'bank_transfer' &&
          isToday(t.createdAt)
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  function monthlyDepositCount() {

    return transactions.filter(
      t =>
        t.type === 'deposit' &&
        isThisMonth(t.createdAt)
    ).length

  }

  function totalCashInput() {

    return (
      count500 * 500000 +
      count200 * 200000 +
      count100 * 100000 +
      count50 * 50000 +
      count20 * 20000 +
      count10 * 10000
    )

  }

  async function saveDeposit() {

    if (totalCashInput() <= 0)
      return

    await addDoc(
      collection(db, 'transactions'),
      {
        shipperId,
        type: 'deposit',
        amount: totalCashInput(),
        createdAt: Date.now(),
        note: 'Nộp tiền mặt'
      }
    )

    count500 = 0
    count200 = 0
    count100 = 0
    count50 = 0
    count20 = 0
    count10 = 0

  }

  async function saveTransfer() {

    if (!transferAmount)
      return

    await addDoc(
      collection(db, 'transactions'),
      {
        shipperId,
        type: 'bank_transfer',
        amount: Number(transferAmount),
        createdAt: Date.now(),
        note: 'Chuyển khoản'
      }
    )

    transferAmount = 0

  }
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-5xl mx-auto">

    <!-- Header -->

    <div class="mb-8">

      <a
        href="/"
        class="text-blue-600 font-semibold"
      >
        ← Về trang chủ
      </a>

      {#if shipper}

        <h1
          class="text-4xl font-bold mt-4"
        >
          {shipper.name}
        </h1>

        <div
          class="text-slate-500 mt-3"
        >
          {shipper.bankName}
        </div>

        <div class="text-slate-500">
          {shipper.bankNumber}
        </div>

      {/if}

    </div>

    <!-- Stats -->

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
    >

      <!-- Deposit -->

      <div
        class="bg-white rounded-3xl shadow p-6"
      >

        <div class="text-slate-500">
          Tiền mặt đã nộp hôm nay
        </div>

        <div
          class="text-4xl font-bold text-blue-600 mt-3"
        >
          {totalTodayDeposit().toLocaleString()} đ
        </div>

        <div class="mt-6 space-y-3">

          <div
            class="grid grid-cols-2 gap-3"
          >

            <input
              bind:value={count500}
              type="number"
              placeholder="500k"
              class="border rounded-2xl p-3"
            />

            <input
              bind:value={count200}
              type="number"
              placeholder="200k"
              class="border rounded-2xl p-3"
            />

            <input
              bind:value={count100}
              type="number"
              placeholder="100k"
              class="border rounded-2xl p-3"
            />

            <input
              bind:value={count50}
              type="number"
              placeholder="50k"
              class="border rounded-2xl p-3"
            />

            <input
              bind:value={count20}
              type="number"
              placeholder="20k"
              class="border rounded-2xl p-3"
            />

            <input
              bind:value={count10}
              type="number"
              placeholder="10k"
              class="border rounded-2xl p-3"
            />

          </div>

          <div
            class="text-2xl font-bold"
          >
            Tổng:
            {totalCashInput().toLocaleString()} đ
          </div>

          <button
            on:click={saveDeposit}
            class="w-full bg-blue-600 text-white rounded-2xl p-4 font-bold"
          >
            Lưu tiền mặt
          </button>

        </div>

      </div>

      <!-- Transfer -->

      <div
        class="bg-white rounded-3xl shadow p-6"
      >

        <div class="text-slate-500">
          Đã chuyển khoản hôm nay
        </div>

        <div
          class="text-4xl font-bold text-green-600 mt-3"
        >
          {totalTodayTransfer().toLocaleString()} đ
        </div>

        <div class="mt-6 space-y-3">

          <input
            bind:value={transferAmount}
            type="number"
            placeholder="Nhập số tiền chuyển khoản"
            class="w-full border rounded-2xl p-4"
          />

          <button
            on:click={saveTransfer}
            class="w-full bg-green-600 text-white rounded-2xl p-4 font-bold"
          >
            Lưu chuyển khoản
          </button>

        </div>

      </div>

    </div>

    <!-- Monthly -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div class="text-slate-500">
        Số lần nộp tháng này
      </div>

      <div
        class="text-5xl font-bold mt-3"
      >
        {monthlyDepositCount()}
      </div>

    </div>

    <!-- Transactions -->

    <div
      class="bg-white rounded-3xl shadow p-6"
    >

      <h2 class="text-2xl font-bold mb-6">
        Lịch sử giao dịch
      </h2>

      <div class="space-y-4">

        {#each transactions as t}

          <div
            class="border rounded-2xl p-4"
          >

            <div
              class="flex items-center justify-between"
            >

              <div>

                <div
                  class="font-bold text-lg"
                >
                  {t.type}
                </div>

                <div
                  class="text-slate-500 mt-1"
                >
                  {dayjs(
                    t.createdAt
                  ).format(
                    'DD/MM/YYYY HH:mm'
                  )}
                </div>

              </div>

              <div
                class="text-right"
              >

                <div
                  class="text-2xl font-bold"
                >
                  {t.amount.toLocaleString()} đ
                </div>

              </div>

            </div>

            {#if t.note}

              <div
                class="mt-3 text-slate-600"
              >
                {t.note}
              </div>

            {/if}

          </div>

        {/each}

      </div>

    </div>

  </div>

</div>