<script lang="ts">
  import { onMount } from 'svelte'

  import {
    collection,
    onSnapshot,
    query,
    orderBy
  } from 'firebase/firestore'

  import { db } from '$lib/firebase'

  import dayjs from 'dayjs'

  let shippers = $state<any[]>([])
  let transactions = $state<any[]>([])

  let keyword = $state('')

  const shippersRef = collection(
    db,
    'shippers'
  )

  const transactionsRef = collection(
    db,
    'transactions'
  )

  onMount(() => {

    const unsub1 = onSnapshot(
      query(
        shippersRef,
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
        transactionsRef,
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

  function getTodayShipperCount() {

    const today = dayjs().format(
      'DD/MM/YYYY'
    )

    const ids = new Set()

    transactions.forEach(t => {

      const date = dayjs(
        t.createdAt
      ).format('DD/MM/YYYY')

      if (date === today) {
        ids.add(t.shipperId)
      }

    })

    return ids.size

  }

  function getTodayIncome() {

    return (
      getTodayShipperCount() * 10000
    )

  }

  function filteredShippers() {

    if (!keyword)
      return []

    return shippers.filter(shipper =>
      shipper.name
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    )

  }

  function todayActiveShippers() {

    const today = dayjs().format(
      'DD/MM/YYYY'
    )

    const todayIds = new Set()

    transactions.forEach(t => {

      const date = dayjs(
        t.createdAt
      ).format('DD/MM/YYYY')

      if (date === today) {
        todayIds.add(t.shipperId)
      }

    })

    return shippers.filter(
      s => todayIds.has(s.id)
    )

  }

  function getShipperName(id: string) {

    return shippers.find(
      s => s.id === id
    )?.name || 'Unknown'

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

          <h1 class="text-4xl font-bold">
            Dashboard
          </h1>

          <p
            class="text-slate-500 mt-2"
          >
            Quản lý giao dịch 
          </p>

        

      </div>

    </div>

    <!-- Today income -->

        </div>
<div><a
          href="/shippers/create"
          class="bg-black text-white px-5 py-3 rounded-2xl font-bold"
        >
          + Thêm 
        </a>
        <a
  href="/shippers"
  class="bg-white border px-5 py-3 rounded-2xl font-bold"
>
  Danh sách
</a>
        <a
  href="/balances"
  class="bg-pinkrder px-5 py-3 rounded-2xl font-bold"
>
  Chênh lệch
</a>
</div>
    <div
      class="bg-white rounded-3xl shadow p-8 mb-8"
    >

      <div class="text-slate-500">
        Thu nhập hôm nay
      </div>

      <div
        class="text-5xl font-bold text-green-600 mt-3"
      >
        {getTodayIncome().toLocaleString()} đ
      </div>

      <div
        class="mt-3 text-slate-500"
      >

        {getTodayShipperCount()}
        giao dịch hôm nay

      </div>

    </div>

    <!-- Search shipper -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <h2
        class="text-2xl font-bold mb-4"
      >
        Tìm kiếm shipper
      </h2>

      <input
        bind:value={keyword}
        placeholder="Nhập tên shipper..."
        class="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {#if keyword.trim().length > 0}

        <div class="mt-5 space-y-3">

          {#each filteredShippers() as shipper}

            <a
              href={`/shippers/${shipper.id}`}
              class="block bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 transition"
            >

              <div
                class="flex items-center justify-between"
              >

                <div>

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

                  <div
                    class="text-slate-500"
                  >
                    {shipper.bankNumber}
                  </div>

                </div>

                <div
                  class="text-blue-600 font-bold"
                >
                  Xem →
                </div>

              </div>

            </a>

          {/each}

          {#if filteredShippers().length === 0}

            <div
              class="text-center text-slate-500 py-6"
            >
              Không tìm thấy shipper
            </div>

          {/if}

        </div>

      {/if}

    </div>

    <!-- Today active shippers -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <div
        class="flex items-center justify-between mb-5"
      >

        <h2
          class="text-2xl font-bold"
        >
          Shipper hoạt động hôm nay
        </h2>

        <div class="text-slate-500">
          {getTodayShipperCount()} shipper
        </div>

      </div>

      <div class="space-y-3">

        {#each todayActiveShippers() as shipper}

          <a
            href={`/shippers/${shipper.id}`}
            class="block bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 transition"
          >

            <div
              class="flex items-center justify-between"
            >

              <div>

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

              </div>

              <div
                class="text-green-600 font-bold"
              >
                Hoạt động
              </div>

            </div>

          </a>

        {/each}

        {#if todayActiveShippers().length === 0}

          <div
            class="text-center text-slate-500 py-6"
          >
            Chưa có giao dịch hôm nay
          </div>

        {/if}

      </div>

    </div>

    <!-- Recent transactions -->

    <div
      class="bg-white rounded-3xl shadow p-6"
    >

      <h2
        class="text-2xl font-bold mb-6"
      >
        Giao dịch gần đây
      </h2>

      <div class="space-y-4">

        {#each transactions.slice(0, 20) as t}

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
                  {getShipperName(
                    t.shipperId
                  )}
                </div>

                <div
                  class="text-slate-500 mt-1"
                >
                  {t.type}
                </div>

              </div>

              <div
                class="text-right"
              >

                <div
                  class="font-bold text-xl"
                >
                  {t.amount.toLocaleString()} đ
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