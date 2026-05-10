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
    doc,
    updateDoc
  } from 'firebase/firestore'

  const shipperId = page.params.id

  let shipper = $state<any>(null)

  let transactions = $state<any[]>([])

  let transferAmount = $state(0)

  let receivedTransferAmount = $state(0)

  let expandedFees = $state<string[]>([])

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

  // date

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

  // totals

  function totalTodayCash() {

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

  function totalTodayReceivedTransfer() {

    return transactions
      .filter(
        t =>
          t.type === 'received_transfer' &&
          isToday(t.createdAt)
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  function totalTodayBankTransfer() {

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

      totalTodayCash()

      +

      totalTodayReceivedTransfer()

      -

      totalTodayBankTransfer()

    )

  }

  // monthly days

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

  // save transfer

  async function saveTransfer() {

    if (!transferAmount)
      return

    const newTransaction = {

      shipperId,

      type: 'bank_transfer',

      amount: Number(transferAmount),

      note: 'Đã chuyển khoản',

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

  // received transfer

  async function saveReceivedTransfer() {

    if (!receivedTransferAmount)
      return

    const newTransaction = {

      shipperId,

      type: 'received_transfer',

      amount: Number(
        receivedTransferAmount
      ),

      note: 'Đã nhận chuyển khoản',

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

    receivedTransferAmount = 0

  }

  // toggle fee

  async function toggleFee(transaction:any) {

    if (!transaction.hasFee) {

      const exists = transactions.some(t => {

        return (

          t.id !== transaction.id &&

          t.type === 'deposit' &&

          t.hasFee === true &&

          isToday(t.createdAt)

        )

      })

      if (exists) {

        alert(
          'Hôm nay đã có giao dịch tính phí'
        )

        return

      }

    }

    await updateDoc(
      doc(db, 'transactions', transaction.id),
      {
        hasFee: !transaction.hasFee
      }
    )

  }

  // fees

  function feeTransactions() {

    return transactions.filter(t => {

      return (
        t.type === 'deposit' &&
        t.hasFee === true
      )

    })

  }

  function groupedFees() {

    const grouped:any = {}

    feeTransactions().forEach(t => {

      const day = dayjs(
        t.createdAt
      ).format(
        'DD/MM/YYYY'
      )

      if (!grouped[day]) {

        grouped[day] = []

      }

      grouped[day].push(t)

    })

    return grouped

  }

  function feeTotal(day:string) {

    return (
      groupedFees()[day].length
      * 10000
    )

  }

  function toggleExpand(day:string) {

    if (
      expandedFees.includes(day)
    ) {

      expandedFees = expandedFees.filter(
        d => d !== day
      )

    } else {

      expandedFees = [
        ...expandedFees,
        day
      ]

    }

  }
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-5xl mx-auto">

    <!-- header -->

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

    <!-- stats -->
<!-- finance card -->

<div
  class="bg-white rounded-3xl shadow p-6 mb-8"
>

  <!-- title -->

  <div
    class="flex items-center justify-between mb-6"
  >

    <div>

      <div
        class="text-3xl font-bold"
      >
        Tổng quan hôm nay
      </div>

      <div
        class="text-slate-500 mt-1"
      >
        Theo dõi dòng tiền realtime
      </div>

    </div>

    <div
      class={`text-3xl font-bold ${
        balanceToday() >= 0
          ? 'text-green-600'
          : 'text-red-600'
      }`}
    >
      {balanceToday().toLocaleString()} đ
    </div>

  </div>

  <!-- stats -->

  <div
    class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
  >

    <!-- cash -->

    <div
      class="bg-blue-50 rounded-2xl p-4"
    >

      <div
        class="text-sm text-slate-500"
      >
        Tiền mặt
      </div>

      <div
        class="text-2xl font-bold text-blue-600 mt-2"
      >
        {totalTodayCash().toLocaleString()} đ
      </div>

    </div>

    <!-- received transfer -->

    <div
      class="bg-purple-50 rounded-2xl p-4"
    >

      <div
        class="text-sm text-slate-500"
      >
        Đã nhận CK
      </div>

      <div
        class="text-2xl font-bold text-purple-600 mt-2"
      >
        {totalTodayReceivedTransfer().toLocaleString()} đ
      </div>

    </div>

    <!-- transfer -->

    <div
      class="bg-green-50 rounded-2xl p-4"
    >

      <div
        class="text-sm text-slate-500"
      >
        Đã chuyển
      </div>

      <div
        class="text-2xl font-bold text-green-600 mt-2"
      >
        {totalTodayBankTransfer().toLocaleString()} đ
      </div>

    </div>

    <!-- monthly -->

    <div
      class="bg-orange-50 rounded-2xl p-4"
    >

      <div
        class="text-sm text-slate-500"
      >
        Ngày nộp tháng
      </div>

      <div
        class="text-2xl font-bold text-orange-600 mt-2"
      >
        {monthlyDepositCount()}
      </div>

    </div>

  </div>

  <!-- actions -->

  <div
    class="grid grid-cols-1 lg:grid-cols-3 gap-4"
  >

    <!-- cash -->

    <a
      href={`/shippers/${shipperId}/cash`}
      class="bg-blue-600 text-white rounded-2xl p-6 text-center hover:scale-[1.02] transition"
    >

      <div class="text-4xl">
        💵
      </div>

      <div
        class="text-xl font-bold mt-3"
      >
        Nhận tiền mặt
      </div>

    </a>

    <!-- receive transfer -->

    <div
      class="border rounded-2xl p-5"
    >

      <div
        class="font-bold text-lg mb-4 text-purple-600"
      >
        Nhận chuyển khoản
      </div>

      <input
        bind:value={receivedTransferAmount}
        type="number"
        placeholder="Số tiền"
        class="w-full border rounded-xl p-3"
      />

      <button
        on:click={saveReceivedTransfer}
        class="w-full bg-purple-600 text-white rounded-xl p-3 mt-3 font-bold"
      >
        Lưu
      </button>

    </div>

    <!-- transfer -->

    <div
      class="border rounded-2xl p-5"
    >

      <div
        class="font-bold text-lg mb-4 text-green-600"
      >
        Chuyển khoản
      </div>

      <input
        bind:value={transferAmount}
        type="number"
        placeholder="Số tiền"
        class="w-full border rounded-xl p-3"
      />

      <button
        on:click={saveTransfer}
        class="w-full bg-green-600 text-white rounded-xl p-3 mt-3 font-bold"
      >
        Lưu
      </button>

    </div>

  </div>

</div>

    <!-- fee history -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div
        class="flex items-center justify-between mb-6"
      >

        <div>

          <div
            class="text-2xl font-bold"
          >
            Lịch sử phí
          </div>

          <div
            class="text-slate-500 mt-1"
          >
            Mỗi ngày chỉ tính tối đa 1 phí
          </div>

        </div>

        <div
          class="text-3xl font-bold text-green-600"
        >

          {(feeTransactions().length * 10000)
            .toLocaleString()} đ

        </div>

      </div>

      <div class="space-y-4">

        {#each Object.keys(groupedFees()) as day}

          <div
            class="border rounded-2xl overflow-hidden"
          >

            <!-- header -->

            <button
              on:click={() => toggleExpand(day)}
              class="w-full p-5 flex items-center justify-between bg-slate-50"
            >

              <div class="text-left">

                <div
                  class="font-bold text-lg"
                >
                  {day}
                </div>

                <div
                  class="text-slate-500 text-sm mt-1"
                >

                  {groupedFees()[day].length}
                  giao dịch có phí

                </div>

              </div>

              <div
                class="text-green-600 font-bold text-2xl"
              >
                {feeTotal(day).toLocaleString()} đ
              </div>

            </button>

            <!-- detail -->

            {#if expandedFees.includes(day)}

              <div class="p-4 space-y-3">

                {#each groupedFees()[day] as t}

                  <div
                    class="border rounded-2xl p-4 flex items-center justify-between"
                  >

                    <div>

                      <div
                        class="font-bold"
                      >
                        {shipper?.name}
                      </div>

                      <div
                        class="text-slate-500 text-sm mt-1"
                      >
                        {dayjs(
                          t.createdAt
                        ).format(
                          'HH:mm'
                        )}
                      </div>

                    </div>

                    <div
                      class="text-green-600 font-bold"
                    >
                      +10,000 đ
                    </div>

                  </div>

                {/each}

              </div>

            {/if}

          </div>

        {/each}

      </div>

    </div>

    <!-- monthly -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div class="text-slate-500">
        Số ngày nộp trong tháng
      </div>

      <div
        class="text-5xl font-bold mt-3"
      >
        {monthlyDepositCount()}
      </div>

    </div>

    <!-- history -->

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
                      : t.type === 'received_transfer'
                      ? 'text-purple-600'
                      : 'text-green-600'
                  }`}
                >

                  {#if t.type === 'deposit'}

                    Nộp tiền mặt

                  {:else if t.type === 'received_transfer'}

                    Đã nhận chuyển khoản

                  {:else}

                    Đã chuyển khoản

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

            <!-- tags -->

            <div
              class="flex gap-2 mt-3 flex-wrap items-center"
            >

              <div
                class="bg-slate-100 px-3 py-1 rounded-xl text-sm"
              >
                {t.note}
              </div>

              {#if t.type === 'deposit'}

                <button
                  on:click={() => toggleFee(t)}
                  class={`px-3 py-1 rounded-xl text-sm font-bold ${
                    t.hasFee
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >

                  {t.hasFee
                    ? 'Có phí'
                    : 'Không phí'}

                </button>

              {/if}

              {#if t.isBorrow}

                <div
                  class="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-sm"
                >
                  Mượn tiền
                </div>

              {/if}

            </div>

          </div>

        {/each}

      </div>

    </div>

  </div>

</div>