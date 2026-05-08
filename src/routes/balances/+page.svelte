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

  function totalDeposit(shipperId: string) {

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

  function totalTransfer(shipperId: string) {

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

  function balance(shipperId: string) {

    return (
      totalDeposit(shipperId)
      - totalTransfer(shipperId)
    )

  }

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
        class="flex items-center justify-between"
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
            Chênh lệch tiền
          </h1>

          <p
            class="text-slate-500 mt-2"
          >
            Các shipper chưa cân bằng tiền
          </p>

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

            </div>

            <div class="text-right">

              <div
                class="text-slate-500"
              >
                Chênh lệch
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

          <div
            class="grid grid-cols-2 gap-4 mt-6"
          >

            <div
              class="bg-slate-50 rounded-2xl p-4"
            >

              <div
                class="text-slate-500"
              >
                Tiền mặt đã nộp
              </div>

              <div
                class="text-2xl font-bold mt-2"
              >
                {totalDeposit(
                  shipper.id
                ).toLocaleString()} đ
              </div>

            </div>

            <div
              class="bg-slate-50 rounded-2xl p-4"
            >

              <div
                class="text-slate-500"
              >
                Đã chuyển khoản
              </div>

              <div
                class="text-2xl font-bold mt-2"
              >
                {totalTransfer(
                  shipper.id
                ).toLocaleString()} đ
              </div>

            </div>

          </div>

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