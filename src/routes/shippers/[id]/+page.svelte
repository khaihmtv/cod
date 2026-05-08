<script lang="ts">
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'

  import {
    db
  } from '$lib/firebase'

  import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    getDoc,
    doc
  } from 'firebase/firestore'

  const shipperId = page.params.id

  let shipper = $state<any>(null)

  let transactions = $state<any[]>([])

  let transferAmount = $state(0)

  onMount(async () => {

    // shipper

    const shipperSnap = await getDoc(
      doc(db, 'shippers', shipperId)
    )

    if (shipperSnap.exists()) {

      shipper = {
        id: shipperSnap.id,
        ...shipperSnap.data()
      }

    }

    // realtime transactions

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

  function balanceToday() {

    return (
      totalTodayDeposit()
      - totalTodayTransfer()
    )

  }

  function monthlyDepositCount() {

  const uniqueDays = new Set()

  transactions.forEach(t => {

    if (
      t.type === 'deposit' &&
      isThisMonth(t.createdAt)
    ) {

      uniqueDays.add(
        dayjs(t.createdAt).format(
          'DD/MM/YYYY'
        )
      )

    }

  })

  return uniqueDays.size

}

  async function saveTransfer() {

    if (!transferAmount)
      return

    const newTransaction = {
      shipperId,
      type: 'bank_transfer',
      amount: Number(transferAmount),
      note: 'Chuyển khoản',
      createdAt: Date.now()
    }

    await addDoc(
      collection(db, 'transactions'),
      newTransaction
    )

    transactions = [
      newTransaction,
      ...transactions
    ]

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
          class="text-slate-500 mt-2"
        >
          {shipper.bankName}
        </div>

        <div
          class="text-slate-500"
        >
          {shipper.bankNumber}
        </div>

      {/if}

    </div>

    <!-- Stats -->

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >

      <!-- Deposit -->

      <div
        class="bg-white rounded-3xl shadow p-6"
      >

        <div class="text-slate-500">
          Tiền mặt hôm nay
        </div>

        <div
          class="text-4xl font-bold text-blue-600 mt-3"
        >
          {totalTodayDeposit().toLocaleString()} đ
        </div>

      </div>

      <!-- Transfer -->

      <div
        class="bg-white rounded-3xl shadow p-6"
      >

        <div class="text-slate-500">
          Chuyển khoản hôm nay
        </div>

        <div
          class="text-4xl font-bold text-green-600 mt-3"
        >
          {totalTodayTransfer().toLocaleString()} đ
        </div>

      </div>

      <!-- Balance -->

      <div
        class="bg-white rounded-3xl shadow p-6"
      >

        <div class="text-slate-500">
          Chênh lệch
        </div>

        <div
          class={`text-4xl font-bold mt-3 ${
            balanceToday() >= 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {balanceToday().toLocaleString()} đ
        </div>

      </div>

    </div>

    <!-- Actions -->

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
    >

      <!-- Cash -->

      <a
        href={`/shippers/${shipperId}/cash`}
        class="bg-blue-600 text-white rounded-3xl shadow p-8 text-center hover:scale-[1.02] transition"
      >

        <div class="text-5xl">
          💵
        </div>

        <div
          class="text-3xl font-bold mt-4"
        >
          Nhận tiền mặt
        </div>

      </a>

      <!-- Transfer -->

      <div
        class="bg-white rounded-3xl shadow p-8"
      >

        <div
          class="text-2xl font-bold mb-6"
        >
          Chuyển khoản
        </div>

        <input
          bind:value={transferAmount}
          type="number"
          placeholder="Nhập số tiền"
          class="w-full border rounded-2xl p-4 text-lg"
        />

        <button
          on:click={saveTransfer}
          class="w-full bg-green-600 text-white rounded-2xl p-4 font-bold text-lg mt-4"
        >
          Lưu chuyển khoản
        </button>

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

    <!-- History -->

    <div
      class="bg-white rounded-3xl shadow p-6"
    >

      <h2
        class="text-2xl font-bold mb-6"
      >
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
                  class={`font-bold text-lg ${
                    t.type === 'deposit'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}
                >

                  {#if t.type === 'deposit'}

                    Nộp tiền mặt

                  {:else}

                    Chuyển khoản

                  {/if}

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
                class="text-2xl font-bold"
              >
                {t.amount.toLocaleString()} đ
              </div>

            </div>

            {#if t.note}

              <div
                class="text-slate-500 mt-3"
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