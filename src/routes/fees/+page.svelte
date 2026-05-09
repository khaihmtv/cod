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

  let transactions = $state<any[]>([])

  let shippers = $state<any[]>([])

  onMount(() => {

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

    return () => {

      unsubTransactions()
      unsubShippers()

    }

  })

  function feeTransactions() {

    return transactions.filter(
      t =>
        t.type === 'deposit' &&
        t.hasFee === true
    )

  }

  function groupedByDay() {

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

  function dayTotal(day: string) {

    return (
      groupedByDay()[day].length
      * 10000
    )

  }

  function grandTotal() {

    return (
      feeTransactions().length
      * 10000
    )

  }

  function shipperName(id: string) {

    return (
      shippers.find(
        s => s.id === id
      )?.name || 'Không rõ'
    )

  }
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-5xl mx-auto">

    <!-- header -->

    <a
      href="/"
      class="text-blue-600 font-semibold"
    >
      ← Trang chủ
    </a>

    <h1
      class="text-4xl font-bold mt-4"
    >
      Lịch sử phí giao dịch
    </h1>

    <!-- total -->

    <div
      class="bg-green-600 text-white rounded-3xl p-6 mt-8 mb-8"
    >

      <div class="text-lg">
        Tổng phí
      </div>

      <div
        class="text-5xl font-bold mt-3"
      >
        {grandTotal().toLocaleString()} đ
      </div>

    </div>

    <!-- grouped -->

    <div class="space-y-8">

      {#each Object.keys(groupedByDay()) as day}

        <div
          class="bg-white rounded-3xl shadow p-6"
        >

          <!-- day header -->

          <div
            class="flex items-center justify-between mb-6"
          >

            <div>

              <div
                class="text-2xl font-bold"
              >
                {day}
              </div>

              <div
                class="text-slate-500 mt-1"
              >

                {groupedByDay()[day].length}
                giao dịch có phí

              </div>

            </div>

            <div
              class="text-3xl font-bold text-green-600"
            >
              {dayTotal(day).toLocaleString()} đ
            </div>

          </div>

          <!-- transactions -->

          <div class="space-y-3">

            {#each groupedByDay()[day] as t}

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
                      {dayjs(
                        t.createdAt
                      ).format(
                        'HH:mm'
                      )}
                    </div>

                  </div>

                  <div
                    class="text-green-600 font-bold text-xl"
                  >
                    +10,000 đ
                  </div>

                </div>

              </div>

            {/each}

          </div>

        </div>

      {/each}

    </div>

  </div>

</div>