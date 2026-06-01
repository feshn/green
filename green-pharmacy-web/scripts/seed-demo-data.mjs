#!/usr/bin/env node
/**
 * Заполнение демо-каталога, если данных нет или не хватает Card 01.
 * npm run seed:demo
 *
 * Требует .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (insert через RLS admin)
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

const IMG = {
  big01: "/images/products/big-01.jpg",
  big02: "/images/products/big-02.jpg",
  big03: "/images/products/big-03.jpg",
  prev01: "/images/products/prev-01.jpg",
}

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

const env = {
  ...loadEnvFile(resolve(root, ".env.local")),
  ...process.env,
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local\n" +
      "Либо выполните docs/seed-card-demo.sql в Supabase SQL Editor."
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function ensureRow(table, match, insert) {
  const q = supabase.from(table).select("*").match(match).maybeSingle()
  const { data: existing } = await q
  if (existing) return existing

  const { data, error } = await supabase.from(table).insert(insert).select().single()
  if (error) throw new Error(`${table} insert: ${error.message}`)
  return data
}

async function ensureByName(table, nameCol, name, insert) {
  const { data: existing } = await supabase
    .from(table)
    .select("*")
    .eq(nameCol, name)
    .maybeSingle()
  if (existing) return existing

  const { data, error } = await supabase.from(table).insert(insert).select().single()
  if (error) throw new Error(`${table} "${name}": ${error.message}`)
  return data
}

async function main() {
  console.log("Проверка каталога…")

  const { count, error: countErr } = await supabase
    .from("vw_client_catalog")
    .select("*", { count: "exact", head: true })

  if (countErr) throw new Error(countErr.message)

  const { data: tirzettaRow } = await supabase
    .from("products")
    .select("id")
    .eq("name", "Тирзетта 5мг №30")
    .maybeSingle()

  const needsFullSeed = (count ?? 0) === 0 || !tirzettaRow

  if (!needsFullSeed) {
    console.log(`Каталог уже содержит ${count} товар(ов). Дозаполняю Card 01…`)
  } else {
    console.log("Каталог пуст или нет демо-товара — полный seed…")
  }

  // Справочники
  await ensureByName("categories", "name", "От простуды", { name: "От простуды" })
  await ensureByName("categories", "name", "Витамины", { name: "Витамины" })
  await ensureByName("categories", "name", "Антибиотики", { name: "Антибиотики" })
  await ensureByName("categories", "name", "Уход", { name: "Уход" })
  await ensureByName("manufacturers", "name", "ФармСтандарт", { name: "ФармСтандарт" })
  await ensureByName("manufacturers", "name", "Тева", { name: "Тева" })
  await ensureByName("dosage_form", "name", "Таблетки", { name: "Таблетки" })
  await ensureByName("dosage_form", "name", "Капсулы", { name: "Капсулы" })

  const catCold = (
    await supabase.from("categories").select("id").eq("name", "От простуды").single()
  ).data
  const catVit = (
    await supabase.from("categories").select("id").eq("name", "Витамины").single()
  ).data
  const dfTab = (
    await supabase.from("dosage_form").select("id").eq("name", "Таблетки").single()
  ).data
  const dfCap = (
    await supabase.from("dosage_form").select("id").eq("name", "Капсулы").single()
  ).data
  const mFarm = (
    await supabase.from("manufacturers").select("id").eq("name", "ФармСтандарт").single()
  ).data

  const productDefs = [
    { name: "Тирзетта 5мг №30", price: 1200, old: 1400, catId: catCold?.id },
    { name: "Витамин D3 2000", price: 450, old: null, catId: catVit?.id },
    { name: "Нурофен 200мг", price: 320, old: 380, catId: null },
    { name: "Амоксициллин 500мг №10", price: 120, old: 150, catId: catCold?.id },
    { name: "Ибупрофен 200мг №15", price: 130, old: 160, catId: catCold?.id },
    { name: "Парацетамол 500мг №20", price: 90, old: 110, catId: catCold?.id },
    { name: "Цефтриаксон 1г №2", price: 450, old: 520, catId: catCold?.id },
    { name: "Аспирин-С 400мг №10", price: 180, old: 220, catId: catCold?.id },
  ]

  for (const p of productDefs) {
    const product = await ensureByName("products", "name", p.name, { name: p.name })

    const { data: priceExists } = await supabase
      .from("product_prices")
      .select("id")
      .eq("product_id", product.id)
      .maybeSingle()

    if (!priceExists) {
      const { error } = await supabase.from("product_prices").insert({
        product_id: product.id,
        price: p.price,
        old_price: p.old,
        is_available: true,
      })
      if (error) throw new Error(`price ${p.name}: ${error.message}`)
    }

    if (p.catId) {
      const { data: link } = await supabase
        .from("product_categories")
        .select("id")
        .eq("product_id", product.id)
        .eq("category_id", p.catId)
        .maybeSingle()
      if (!link) {
        await supabase.from("product_categories").insert({
          product_id: product.id,
          category_id: p.catId,
        })
      }
    }
  }

  const { data: tirzetta } = await supabase
    .from("products")
    .select("id")
    .eq("name", "Тирзетта 5мг №30")
    .single()

  const { data: vitd } = await supabase
    .from("products")
    .select("id")
    .eq("name", "Витамин D3 2000")
    .single()

  // product_details
  await supabase.from("product_details").upsert(
    {
      product_id: tirzetta.id,
      dosage_form_id: dfTab?.id,
      manufacturer_id: mFarm?.id,
      composition:
        "Активные вещества: тирзепатид — 5 мг.\nВспомогательные вещества: натрия цитрат, маннитол, полисорбат 80.",
      usage_instructions:
        "Подкожно 1 раз в неделю, в одно и то же время суток.\nПеред первым использованием проконсультируйтесь с врачом.",
    },
    { onConflict: "product_id" }
  )

  await supabase.from("product_details").upsert(
    {
      product_id: vitd.id,
      dosage_form_id: dfCap?.id,
      composition: "Холекальциферол 2000 МЕ",
    },
    { onConflict: "product_id" }
  )

  // Галерея Тирзетта (локальные JPG)
  const gallery = [
    { url: IMG.big01, is_main: true },
    { url: IMG.big02, is_main: false },
    { url: IMG.big03, is_main: false },
  ]

  for (const g of gallery) {
    const { data: exists } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", tirzetta.id)
      .eq("image_url", g.url)
      .maybeSingle()
    if (!exists) {
      await supabase.from("product_images").insert({
        product_id: tirzetta.id,
        image_url: g.url,
        is_main: g.is_main,
      })
    }
  }

  // Preview для каталога / похожих
  const previewProducts = [
    { id: tirzetta.id, url: IMG.prev01 },
    ...(await supabase.from("products").select("id, name").in("name", [
      "Амоксициллин 500мг №10",
      "Ибупрофен 200мг №15",
      "Парацетамол 500мг №20",
      "Цефтриаксон 1г №2",
      "Аспирин-С 400мг №10",
      "Витамин D3 2000",
      "Нурофен 200мг",
    ])).data?.map((p) => ({ id: p.id, url: IMG.prev01 })) ?? [],
  ]

  for (const { id, url: imageUrl } of previewProducts) {
    const { data: hasMain } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", id)
      .eq("is_main", true)
      .maybeSingle()

    if (!hasMain) {
      await supabase.from("product_images").insert({
        product_id: id,
        image_url: imageUrl,
        is_main: true,
      })
    }
  }

  const { count: finalCount } = await supabase
    .from("vw_client_catalog")
    .select("*", { count: "exact", head: true })

  console.log(`Готово. vw_client_catalog: ${finalCount ?? 0} строк.`)
  console.log(`Откройте /products/${tirzetta.id} для Card 01.`)
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
