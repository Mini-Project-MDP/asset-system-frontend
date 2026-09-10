# Plan Pengerjaan — `asset-system-frontend`

Disusun setelah integrasi `asset-system-service` (main backend) selesai sampai Milestone 7
([lihat asset-system-service/docs/backend-milestones.md](../../asset-system-service/docs/backend-milestones.md)).
Backend sekarang benar-benar terhubung ke Approval Engine — approval chain, status, dan
keputusan approve/reject/revision tidak lagi bisa dihitung sendiri di frontend seperti mock
yang ada sekarang.

## Gap konkret yang sudah diketahui (bukan dugaan)

Dari kode backend yang sudah selesai (`internal/pkg/delivery/http/handler/request_mapper.go`):

1. **`chain` dan `hist` di response API selalu array kosong** (`[]fiber.Map{}`) — backend
   sengaja belum mengisi ini, karena FE saat ini menghitungnya sendiri dari
   `CATEGORY_HIERARCHY` (mock). Begitu FE berhenti pakai mock, **backend harus diminta**
   mengisi `chain`/`hist` dari data engine (`EngineApprovalRequest.Steps`/`Assignments`) —
   ini pekerjaan tambahan di sisi backend yang **belum ada** di 7 milestone yang sudah
   selesai (scope-nya backend-to-backend, bukan bentuk response ke FE).
2. **`statusTag` di response API cuma bisa 2 nilai**: `"Completed"` kalau `status=COMPLETED`,
   selain itu selalu `"Waiting — Approval"` — walau status sesungguhnya sudah `APPROVED`,
   `REJECTED`, atau `FULFILLMENT`. Field `approval_status`/`current_step_name` yang sekarang
   sudah benar tersimpan di database **belum diekspos sama sekali** di response API.
3. `ROLE_LABELS`/`CATEGORY_HIERARCHY`/`computeChain()` di `requestService.ts` mem-hardcode
   hierarki approval yang **sekarang sumber kebenarannya ada di 2 `WorkflowDefinition`** di
   Approval Engine (`asset_request_barcode`, `asset_request_field_device` — lihat Fase 0 plan
   integrasi). Kalau workflow diedit lewat `Approval-Engine-Client`, mock FE ini **tidak akan
   tahu** dan akan salah menampilkan chain.
4. Action `revision` di `approvalService.ts` saat ini mengizinkan approve/reject/revision
   tanpa comment wajib — backend sekarang menolak `revision` tanpa comment
   (`400 "Comment is required when requesting revision"`).
5. Backend `revision` **tidak lagi berarti "edit request yang sama"** — request lama jadi
   `REJECTED` permanen, requester harus submit request **baru** yang menyimpan
   `revisedFromId`. UI requester saat ini (`NewRequestForm`) tidak punya alur ini sama sekali.

**Rekomendasi eksplisit: item 1 dan 2 butuh perubahan di `asset-system-service` (bukan cuma
`asset-system-frontend`)** — koordinasikan dengan siapa pun yang lanjut kerjakan backend
sebelum mulai Milestone 3 di bawah, supaya tidak membangun UI di atas response API yang belum
lengkap.

## Milestone

```mermaid
flowchart LR
    M1["M1\nAPI Contract\nAudit"] --> M2["M2\nKoordinasi Gap\nBackend Response"]
    M2 --> M3["M3\nHapus Mock Chain\n(CATEGORY_HIERARCHY)"]
    M3 --> M4["M4\nApproval Action UX\n(revision + comment)"]
    M4 --> M5["M5\nAlur \"Ajukan Ulang\"\n(revisedFromId)"]
    M5 --> M6["M6\nError Handling\nBaru"]
    M6 --> M7["M7 ✅\nE2E Testing &\nRollout"]
```

### Milestone 1 — API Contract Audit

**Tujuan:** dokumentasikan persis field mana dari response API yang bisa dipakai sekarang,
mana yang belum, sebelum menyentuh kode UI.

**Tasks:**
- [ ] Bandingkan `RequestDetailItem` (TypeScript, `src/features/requests/types`) field-by-field
      dengan response asli `GET /api/v1/requests`/`GET /api/v1/requests/:id` dari backend saat
      ini (bukan dari dokumentasi lama, dari response sungguhan — banyak yang sudah berubah).
- [ ] Tandai eksplisit: field mana sudah reliable (`id`, `qty`, `pri`, `date`, `step`,
      `fulfillStep`), mana yang masih placeholder/salah (`chain`, `hist`, `statusTag`, `type`
      — `type` sekarang `at.code` bukan `at.name`, sudah benar formatnya tapi perlu
      dikonfirmasi ulang).
- [ ] Tulis daftar kebutuhan konkret untuk backend (isi dari gap #1 dan #2 di atas) sebagai
      dasar diskusi Milestone 2 — jangan mulai kerja UI sebelum ini jelas.

**DoD:** dokumen singkat (bisa jadi lanjutan file ini) berisi tabel field API vs kebutuhan FE,
dengan status "siap pakai" / "butuh kerja backend dulu" per field.

### Milestone 2 — Koordinasi Gap Backend Response

**Tujuan:** pastikan backend mengisi `chain`, `hist`, dan status yang benar sebelum FE
membangun UI di atasnya — ini bukan pekerjaan FE, tapi FE tidak bisa lanjut tanpa ini.

**Tasks:**
- [ ] Ajukan ke tim/pengerjaan `asset-system-service`: `mapRequest()` perlu diisi dari
      `EngineApprovalRequest.Steps`/`Assignments` (butuh `GET {ENGINE}/requests/{id}` di-panggil
      saat detail/list diminta, atau data step di-cache lokal — ini keputusan desain backend,
      di luar scope FE).
- [ ] Ajukan `statusTag` dipetakan dari `approval_status`/`status` sungguhan
      (`APPROVED`/`REJECTED`/`FULFILLMENT`/`COMPLETED`), bukan cuma dua kondisi seperti
      sekarang.
- [ ] Selama menunggu, FE bisa mulai Milestone 4–6 (yang tidak bergantung pada `chain`/`hist`)
      secara paralel — jangan blokir semua pekerjaan pada satu gap ini.

**Dependency:** tim yang pegang `asset-system-service` (backend sudah selesai sampai M7 untuk
integrasi engine, tapi *response shape ke FE* ini di luar 7 milestone itu).

**DoD:** ada kesepakatan/ticket jelas soal siapa mengerjakan perubahan `mapRequest()`, dengan
kontrak field yang disepakati kedua sisi (FE dan backend sepakat bentuk JSON `chain`/`hist`).

### Milestone 3 — Hapus Mock Chain (`CATEGORY_HIERARCHY`)

**Tujuan:** approval chain yang ditampilkan FE bersumber dari backend (yang bersumber dari
Approval Engine), bukan dihitung ulang di FE dari hierarki hardcoded.

**Tasks:** *(baru bisa dieksekusi penuh setelah Milestone 2 selesai di sisi backend)*
- [ ] Hapus/nonaktifkan `computeChain()`, `CATEGORY_HIERARCHY`, `REQUESTER_ROLES_BY_CATEGORY`
      di `requestService.ts` — chain sekarang datang dari `response.data.chain`.
- [ ] Hapus fallback mock (`INITIAL_REQUESTS`, fallback `catch` di `requestService`/
      `approvalService`) — atau pertahankan sebagai dev-only fallback yang jelas ditandai,
      supaya tidak menyamarkan kegagalan API sungguhan di production.
- [ ] Update `buildRequestItem()`/komponen yang bergantung pada bentuk chain lama.

**DoD:** approval chain yang tampil di UI konsisten dengan workflow yang didefinisikan di
Approval Engine (verifikasi: edit workflow lewat `Approval-Engine-Client`, chain di FE ikut
berubah tanpa deploy FE baru).

### Milestone 4 — Approval Action UX (revision + comment wajib)

**Tujuan:** UI approve/reject/revision sesuai kontrak backend yang baru.

**Tasks:**
- [ ] `ApprovalDetail`/tombol aksi: field comment **wajib diisi** sebelum submit kalau aksi
      `revision` dipilih (backend menolak dengan 400 kalau kosong — validasi di FE dulu supaya
      UX tidak menunggu round-trip).
- [ ] Copy/label tombol revision diperjelas: bukan "minta revisi, request ini akan diedit",
      tapi "tolak & minta requester ajukan ulang" (sesuai keputusan Fase 0 backend: revision =
      reject + request baru, bukan edit in-place).
- [ ] Setelah aksi revision berhasil, tampilkan pesan jelas ke requester: request ini ditolak
      dengan catatan revisi, perlu diajukan ulang (bukan "menunggu revisi diproses").

**DoD:** tidak mungkin submit aksi `revision` tanpa comment dari UI; user tidak bingung soal
apa yang terjadi setelah revision.

### Milestone 5 — Alur "Ajukan Ulang" (`revisedFromId`)

**Tujuan:** requester bisa mengajukan request baru yang terhubung ke request lama yang
direvisi — backend sudah siap (`createRequestBody.revisedFromId`, diverifikasi tersimpan
benar), FE belum punya alur ini sama sekali.

**Tasks:**
- [ ] Di halaman detail request yang berstatus `REJECTED` dengan comment revisi, tampilkan
      tombol "Ajukan Ulang" yang membuka `NewRequestForm` ter-prefill dari data request lama.
- [ ] `NewRequestForm`/`CreateRequestFormInput` kirim `revisedFromId` = id request lama saat
      submit dari alur ini.
- [ ] Di halaman detail request baru, tampilkan link "Request ini adalah revisi dari
      REQ-xxxx" mengarah ke request lama (butuh field `revisedFromId` diekspos di response API
      — tambahkan ke daftar kebutuhan Milestone 2 kalau belum).

**DoD:** requester bisa menyelesaikan siklus penuh "diminta revisi → ajukan ulang → disetujui"
tanpa bantuan manual/admin.

### Milestone 6 — Error Handling Baru

**Tujuan:** backend sekarang mengembalikan error code baru yang FE belum tangani.

**Tasks:**
- [ ] `409 Conflict` ("Request has not synced with the approval engine yet") — request yang
      baru dibuat mungkin masih `PENDING_ENGINE_SYNC` sesaat; tampilkan pesan "coba lagi
      sebentar" alih-alih error generik, jangan biarkan user mengira approve gagal permanen.
- [ ] `502 Bad Gateway` / pesan bisnis dari engine (mis. "not the assigned approver") —
      tampilkan pesan asli dari `error` field response, jangan digeneralisasi jadi "terjadi
      kesalahan".
- [ ] `400` untuk `revision` tanpa comment — sudah dicegah di Milestone 4, tapi tetap
      tangani sebagai defense-in-depth kalau validasi FE terlewat.

**DoD:** setiap error code baru dari backend punya pesan yang jelas dan actionable di UI, tidak
ada yang jatuh ke pesan generik "something went wrong".

### Milestone 7 ✅ — E2E Testing & Rollout

**Tujuan:** siklus penuh (create → approve berjenjang → selesai, dan create → revision →
ajukan ulang → selesai) berfungsi end-to-end lewat UI sungguhan, bukan cuma API.

**Tasks:**
- [ ] Test manual/E2E: requester (role SA) buat request Barcode → login sebagai tiap approver
      di chain (SS→RSM→GRSM→NSM→SD) → approve satu-satu lewat UI → status akhir "Approved"
      tampil benar di FE.
- [ ] Test manual/E2E: approver reject dengan alasan revisi (comment wajib) → requester lihat
      request lama `Rejected` dengan catatan → ajukan ulang → chain baru berjalan dari awal.
- [ ] Test manual: matikan Approval Engine sementara, coba create request dari FE — pastikan
      UX tidak rusak (request tetap tersimpan, backend menangani `PENDING_ENGINE_SYNC` di sisi
      server, FE cukup menampilkan status apa adanya).
- [ ] Hapus fallback mock sepenuhnya (kalau belum dihapus di Milestone 3) setelah semua di
      atas terverifikasi stabil.

**DoD (= selesai):** demo end-to-end lewat UI sungguhan (bukan curl) untuk kedua siklus
(approve penuh, dan revision → ajukan ulang), tanpa fallback mock yang menyamarkan kegagalan
API.
