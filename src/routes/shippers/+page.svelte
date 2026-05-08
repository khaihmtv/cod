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

  let keyword = $state('')

  onMount(() => {

    const q = query(
      collection(db, 'shippers'),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {

        shippers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      }
    )

    return () => unsub()

  })

  function filteredShippers() {

    if (!keyword)
      return shippers

    return shippers.filter(shipper =>
      shipper.name
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
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
            Tất cả shipper
          </h1>

          <p
            class="text-slate-500 mt-2"
          >
            Danh sách toàn bộ shipper
          </p>

        </div>

        <a
          href="/shippers/create"
          class="bg-black text-white px-5 py-3 rounded-2xl font-bold"
        >
          + Thêm shipper
        </a>

      </div>

    </div>

    <!-- Search -->

    <div
      class="bg-white rounded-3xl shadow p-6 mb-8"
    >

      <input
        bind:value={keyword}
        placeholder="Tìm shipper..."
        class="w-full border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>

    <!-- List -->

    <div class="space-y-4">

      {#each filteredShippers() as shipper}

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

            <div
              class="text-blue-600 font-bold"
            >
              Xem chi tiết →
            </div>

          </div>

        </a>

      {/each}

      {#if filteredShippers().length === 0}

        <div
          class="bg-white rounded-3xl shadow p-10 text-center text-slate-500"
        >
          Không có shipper
        </div>

      {/if}

    </div>

  </div>

</div>