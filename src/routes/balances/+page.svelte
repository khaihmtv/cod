<script lang="ts">
  import { onMount } from 'svelte'

  import {
    collection,
    onSnapshot,
    query,
    orderBy
  } from 'firebase/firestore'

  import { db } from '$lib/firebase'

  let shippers = $state<any[]>([])
  let transactions = $state<any[]>([])

  onMount(() => {

    // shippers

    const unsub1 = onSnapshot(
      query(
        collection(db, 'shippers'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {

        shippers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    // transactions

    const unsub2 = onSnapshot(
      query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {

        transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    return () => {

      unsub1()

      unsub2()

    }

  })

  // tổng tiền mặt

  function totalDeposit(
    shipperId: string
  ) {

    return transactions
      .filter(
        t =>
          t.shipperId === shipperId &&
          t.type === 'deposit'
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  // tổng nhận chuyển khoản

  function totalReceivedTransfer(
    shipperId: string
  ) {

    return transactions
      .filter(
        t =>
          t.shipperId === shipperId &&
          t.type === 'received_transfer'
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  // tổng đã chuyển khoản

  function totalTransfer(
    shipperId: string
  ) {

    return transactions
      .filter(
        t =>
          t.shipperId === shipperId &&
          t.type === 'bank_transfer'
      )
      .reduce(
        (a, b) => a + b.amount,
        0
      )

  }

  // chênh lệch toàn bộ

  function balance(
    shipperId: string
  ) {

    return (

      totalDeposit(shipperId)

      +

      totalReceivedTransfer(
        shipperId
      )

      -

      totalTransfer(shipperId)

    )

  }

  // tổng lệch toàn hệ thống

  function totalSystemBalance() {

    return shippers.reduce(
      (total, shipper) => {

        return (
          total +
          balance(shipper.id)
        )

      },
      0
    )

  }

  // chỉ hiện shipper lệch tiền

  function unbalancedShippers() {

    return shippers.filter(
      shipper =>
        balance(shipper.id) !== 0
    )

  }
</script>

<div class="min-h-screen bg-slate-100 p-4 md:p-8">

  <div class="max-w-6xl mx-auto">

    <!-- Header -->

    <div class="mb-8">

      <div
        class="flex items-center justify-between flex-wrap gap-4"
      >

        <div>

          <a
            href="/"
            class="text-blue-600 font-semibold"
          >
            ← Về trang chủ
          </a>

          <h1
            class="text-4xl font-bold mt-4"
          >
            Lệch tiền toàn bộ
          </h1>

          <div
            class="text-slate-500 mt-2"
          >
            Thống kê toàn bộ hệ thống
          </div>

        </div>

        <!-- total system -->

        <div
          class="bg-white rounded-3xl shadow px-6 py-5 min-w-[260px]"
        >

          <div
            class="text-slate-500 text-sm"
          >
            Tổng chênh lệch hệ thống
          </div>

          <div
            class={`text-4xl font-bold mt-2 ${
              totalSystemBalance() > 0
                ? 'text-blue-600'
                : totalSystemBalance() < 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >

            {totalSystemBalance()
              .toLocaleString()} đ

          </div>

        </div>

      </div>

    </div>

    <!-- List -->

    <div class="space-y-4">

      {#each unbalancedShippers() as shipper}

        <a
          href={`/shippers/${shipper.id}`}
          class="block bg-white rounded-3xl shadow p-6 hover:shadow-lg transition"
        >

          <div
            class="flex items-center justify-between"
          >

            <div>

              <div
                class="text-2xl font-bold"
              >
                {shipper.name}
              </div>

            </div>

            <div class="text-right">

              <div
                class="text-slate-500"
              >
              {balance(shipper.id) > 0 ? 'thừa' : 'thiếu'}
              </div>

              <div
                class={`text-3xl font-bold ${
                  balance(shipper.id) > 0
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >

                {balance(
                  shipper.id
                ).toLocaleString()} đ

              </div>

            </div>

          </div>

          <!-- stats -->


        </a>

      {/each}

      {#if unbalancedShippers().length === 0}

        <div
          class="bg-white rounded-3xl shadow p-10 text-center"
        >

          <div
            class="text-4xl mb-4"
          >
            ✅
          </div>

          <div
            class="text-2xl font-bold"
          >
            Tất cả đã cân bằng
          </div>

        </div>

      {/if}

    </div>

  </div>

</div>