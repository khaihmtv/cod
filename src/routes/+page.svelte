<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'

  import {
    db
  } from '$lib/firebase'

  import {
    collection,
    query,
    orderBy,
    onSnapshot
  } from 'firebase/firestore'

  let shippers = $state<any[]>([])

  let transactions = $state<any[]>([])

  let search = $state('')

  onMount(() => {

    // shippers

    const shipperQuery = query(
      collection(db, 'shippers'),
      orderBy('name')
    )

    const unsubShippers = onSnapshot(
      shipperQuery,
      (snapshot) => {

        shippers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    // transactions

    const transactionQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    )

    const unsubTransactions = onSnapshot(
      transactionQuery,
      (snapshot) => {

        transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    return () => {

      unsubShippers()
      unsubTransactions()

    }

  })

  // today

  function isToday(timestamp: number) {

    return (
      dayjs(timestamp).format(
        'DD/MM/YYYY'
      ) === dayjs().format(
        'DD/MM/YYYY'
      )
    )

  }

  // fee

  function todayFeeTransactions() {

    return transactions.filter(t => {

      return (
        t.type === 'deposit' &&
        t.hasFee === true &&
        isToday(t.createdAt)
      )

    })

  }

  function todayFeeTotal() {

    return (
      todayFeeTransactions().length
      * 10000
    )

  }

  // search

  function filteredShippers() {

    if (!search.trim())
      return []

    return shippers.filter(shipper => {

      return shipper.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

    })

  }

  // active today

  function todayActiveShippers() {

    const activeIds = new Set()

    transactions.forEach(t => {

      if (isToday(t.createdAt)) {

        activeIds.add(t.shipperId)

      }

    })

    return shippers.filter(
      s => activeIds.has(s.id)
    )

  }

  // recent transactions

  function recentTransactions() {

    return transactions.slice(0, 10)

  }

  function shipperName(id: string) {

    return (
      shippers.find(
        s => s.id === id
      )?.name || 'Không rõ'
    )

  }

  function totalSystemBalance() {

  let deposit = 0
  let transfer = 0

  transactions.forEach(t => {

    if (t.type === 'deposit') {

      deposit += t.amount

    }

    if (t.type === 'bank_transfer') {

      transfer += t.amount

    }

  })

  return deposit - transfer

}

function imbalanceCount() {

  const balances:any = {}

  transactions.forEach(t => {

    if (!balances[t.shipperId]) {

      balances[t.shipperId] = {
        deposit: 0,
        transfer: 0
      }

    }

    if (t.type === 'deposit') {

      balances[t.shipperId].deposit += t.amount

    }

    if (t.type === 'bank_transfer') {

      balances[t.shipperId].transfer += t.amount

    }

  })

  return Object.values(balances)
    .filter((b:any) => {

      return b.deposit !== b.transfer

    }).length

}
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-6xl mx-auto">

    <!-- header -->

    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
    >

      <div>

        <h1
          class="text-4xl font-bold"
        >
          Quản lý Shipper
        </h1>

        <div
          class="text-slate-500 mt-2"
        >
          Hệ thống quản lý giao dịch realtime
        </div>

      </div>

      <div class="flex gap-3">


        <a
          href="/shippers"
          class="bg-white rounded-2xl px-5 py-3 shadow font-semibold"
        >
          Tất cả
        </a>

        <a
          href="/shippers/add"
          class="bg-blue-600 text-white rounded-2xl px-5 py-3 shadow font-semibold"
        >
          + Thêm
        </a>
<a
  href="/balances"
  class="relative"
>

  <div
    class="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl font-bold text-xl"
  >
    !
  </div>

  {#if imbalanceCount() > 0}

    <div
      class="absolute -top-2 -right-2 bg-white text-red-600 border-2 border-red-600 min-w-7 h-7 px-1 rounded-full flex items-center justify-center text-sm font-bold"
    >
      {imbalanceCount()}
    </div>

  {/if}

</a>
      </div>

    </div>

    <!-- fee -->

    <a
      href="/fees"
      class="block bg-green-600 text-white rounded-3xl shadow p-6 mb-8"
    >

      <div class="text-lg opacity-90">
        Phí đã thu hôm nay
      </div>

      <div
        class="text-5xl font-bold mt-3"
      >
        {todayFeeTotal().toLocaleString()} đ
      </div>

      <div class="mt-3 opacity-90">

        {todayFeeTransactions().length}
        giao dịch có phí

      </div>

    </a>

    <!-- search -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div
        class="text-2xl font-bold mb-5"
      >
        Tìm shipper
      </div>

      <input
        bind:value={search}
        type="text"
        placeholder="Nhập tên shipper..."
        class="w-full border rounded-2xl p-4"
      />

      {#if search.trim()}

        <div class="mt-5 space-y-3">

          {#if filteredShippers().length > 0}

            {#each filteredShippers() as shipper}

              <a
                href={`/shippers/${shipper.id}`}
                class="block border rounded-2xl p-4 hover:bg-slate-50"
              >

                <div
                  class="font-bold text-lg"
                >
                  {shipper.name}
                </div>

                <div
                  class="text-slate-500 mt-1"
                >
                  {shipper.bankName}
                </div>

              </a>

            {/each}

          {:else}

            <div
              class="text-slate-500"
            >
              Không tìm thấy shipper
            </div>

          {/if}

        </div>

      {/if}

    </div>

    <!-- active today -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div
        class="flex items-center justify-between mb-6"
      >

        <h2
          class="text-2xl font-bold"
        >
          Shipper hoạt động hôm nay
        </h2>

        <div
          class="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl font-bold"
        >
          {todayActiveShippers().length}
        </div>

      </div>

      <div class="space-y-3">

        {#each todayActiveShippers() as shipper}

          <a
            href={`/shippers/${shipper.id}`}
            class="block border rounded-2xl p-4 hover:bg-slate-50"
          >

            <div
              class="font-bold text-lg"
            >
              {shipper.name}
            </div>

            <div
              class="text-slate-500 mt-1"
            >
              {shipper.bankName}
            </div>

          </a>

        {/each}

      </div>

    </div>

    <!-- history -->

    <div
      class="bg-white rounded-3xl shadow p-6"
    >

      <h2
        class="text-2xl font-bold mb-6"
      >
        Giao dịch gần đây
      </h2>

      <div class="space-y-4">

        {#each recentTransactions() as t}

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
                  {shipperName(t.shipperId)}
                </div>

                <div
                  class="text-slate-500 mt-1"
                >

                  {t.type === 'deposit'
                    ? 'Nộp tiền mặt'
                    : 'Chuyển khoản'}

                </div>

                <div
                  class="text-slate-500 text-sm mt-1"
                >
                  {dayjs(
                    t.createdAt
                  ).format(
                    'DD/MM/YYYY HH:mm'
                  )}
                </div>

              </div>

              <div
                class={`text-2xl font-bold ${
                  t.type === 'deposit'
                    ? 'text-blue-600'
                    : 'text-green-600'
                }`}
              >
                {t.amount.toLocaleString()} đ
              </div>

            </div>

            <!-- tags -->

            <div
              class="flex gap-2 mt-3 flex-wrap"
            >

              {#if t.hasFee === false}

                <div
                  class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-sm"
                >
                  Không phí
                </div>

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