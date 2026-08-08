export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_OPTIONS = [
  { label: "Bahasa Indonesia", value: "id" },
  { label: "English", value: "en" }
] as const;

const translations = {
  // ── Navigation / Sidebar ──
  "nav.menu": { id: "Menu", en: "Menu" },
  "nav.dashboard": { id: "Dashboard", en: "Dashboard" },
  "nav.chat": { id: "KalaAI Chat", en: "KalaAI Chat" },
  "nav.calendar": { id: "Kalender", en: "Calendar" },
  "nav.jobs": { id: "Pekerjaan", en: "Jobs" },
  "nav.contacts": { id: "Kontak", en: "Contacts" },
  "nav.payments": { id: "Pembayaran", en: "Payments" },
  "nav.expenses": { id: "Pengeluaran", en: "Expenses" },
  "nav.finance": { id: "Keuangan", en: "Finance" },
  "nav.feeRecap": { id: "Rekap Fee", en: "Fee Recap" },
  "nav.reminders": { id: "Pengingat", en: "Reminders" },
  "nav.settings": { id: "Pengaturan", en: "Settings" },
  "nav.signOut": { id: "Keluar", en: "Sign out" },
  "nav.freePlan": { id: "Gratis", en: "Free plan" },

  // ── Dashboard ──
  "dashboard.title": { id: "Dashboard", en: "Dashboard" },
  "dashboard.description": { id: "Ringkasan jadwal foto, pendapatan, dan hal yang perlu ditindaklanjuti.", en: "Overview of your shoots, income, and what needs attention." },
  "dashboard.newJob": { id: "Buat pekerjaan", en: "New job" },
  "dashboard.grossThisMonth": { id: "Bruto Bulan Ini", en: "Gross This Month" },
  "dashboard.totalAgreedPrice": { id: "Total harga yang disepakati", en: "Total agreed price" },
  "dashboard.netThisMonth": { id: "Neto Bulan Ini", en: "Net This Month" },
  "dashboard.afterExpenses": { id: "Setelah pengeluaran", en: "After expenses" },
  "dashboard.unpaidJobs": { id: "Belum Dibayar", en: "Unpaid Jobs" },
  "dashboard.needFollowUp": { id: "Perlu ditindaklanjuti", en: "Need follow-up" },
  "dashboard.upcomingShoots": { id: "Jadwal Terdekat", en: "Upcoming Shoots" },
  "dashboard.next7Days": { id: "7 hari ke depan", en: "Next 7 days" },
  "dashboard.noUpcoming": { id: "Belum ada jadwal", en: "No upcoming shoots" },
  "dashboard.createJobToSee": { id: "Buat pekerjaan untuk melihatnya di sini.", en: "Create a job to see it here." },
  "dashboard.createJob": { id: "Buat pekerjaan", en: "Create job" },
  "dashboard.noClient": { id: "Tanpa klien", en: "No client" },
  "dashboard.unpaidJobsTitle": { id: "Pekerjaan Belum Dibayar", en: "Unpaid Jobs" },
  "dashboard.needDpFollowUp": { id: "Perlu tindak lanjut DP atau pelunasan", en: "Need DP follow-up or final settlement" },
  "dashboard.allPaid": { id: "Semua pekerjaan sudah lunas. 🎉", en: "All jobs are fully paid. 🎉" },
  "dashboard.pendingReminders": { id: "Pengingat Tertunda", en: "Pending Reminders" },
  "dashboard.reminderWaiting": { id: "pengingat menunggu dikirim", en: "reminder(s) waiting to send" },

  // ── Jobs ──
  "jobs.title": { id: "Pekerjaan", en: "Jobs" },
  "jobs.description": { id: "Kelola jadwal foto, kontak terkait, dan visibilitas keuangan per pekerjaan.", en: "Manage shoots, linked contacts, and per-job financial visibility." },
  "jobs.createJob": { id: "Buat pekerjaan", en: "Create job" },
  "jobs.searchPlaceholder": { id: "Cari judul, klien, atau lokasi…", en: "Search title, client, or location…" },
  "jobs.allStatuses": { id: "Semua status", en: "All statuses" },
  "jobs.filter": { id: "Filter", en: "Filter" },
  "jobs.noJobsYet": { id: "Belum ada pekerjaan", en: "No jobs yet" },
  "jobs.noJobsMatch": { id: "Tidak ada pekerjaan yang cocok", en: "No jobs match this filter" },
  "jobs.createFirstJob": { id: "Buat pekerjaan pertama", en: "Create first job" },
  "jobs.createFirstDesc": { id: "Buat pekerjaan pertama untuk mulai melacak jadwal foto dan keuntungan.", en: "Create your first job to start tracking shoots and profit." },
  "jobs.tryDifferent": { id: "Coba kata kunci atau status lain.", en: "Try a different keyword or status." },
  "jobs.view": { id: "Lihat", en: "View" },
  "jobs.edit": { id: "Edit", en: "Edit" },

  // ── Job Detail ──
  "jobDetail.editJob": { id: "Edit pekerjaan", en: "Edit job" },
  "jobDetail.invoice": { id: "🧾 Invoice", en: "🧾 Invoice" },
  "jobDetail.addPayment": { id: "+ Pembayaran", en: "+ Payment" },
  "jobDetail.addExpense": { id: "+ Pengeluaran", en: "+ Expense" },
  "jobDetail.grossIncome": { id: "Pendapatan Kotor", en: "Gross Income" },
  "jobDetail.agreedPrice": { id: "Harga yang disepakati", en: "Agreed client price" },
  "jobDetail.paidSoFar": { id: "Sudah Dibayar", en: "Paid So Far" },
  "jobDetail.dpFinal": { id: "DP + pelunasan diterima", en: "DP + final received" },
  "jobDetail.expenses": { id: "Pengeluaran", en: "Expenses" },
  "jobDetail.allCosts": { id: "Semua biaya tercatat", en: "All recorded costs" },
  "jobDetail.netProfit": { id: "Laba Bersih", en: "Net Profit" },
  "jobDetail.outstanding": { id: "Sisa", en: "Outstanding" },
  "jobDetail.jobInfo": { id: "Info Pekerjaan", en: "Job Info" },
  "jobDetail.shootPlan": { id: "Rencana dan kesepakatan klien.", en: "Shoot plan and client agreement." },
  "jobDetail.shootType": { id: "Jenis foto", en: "Shoot type" },
  "jobDetail.schedule": { id: "Jadwal", en: "Schedule" },
  "jobDetail.location": { id: "Lokasi", en: "Location" },
  "jobDetail.locationPending": { id: "Menunggu", en: "Pending" },
  "jobDetail.clientPrice": { id: "Harga klien", en: "Client price" },
  "jobDetail.concept": { id: "Konsep", en: "Concept" },
  "jobDetail.noConcept": { id: "Belum ada catatan konsep.", en: "No concept notes." },
  "jobDetail.notes": { id: "Catatan", en: "Notes" },
  "jobDetail.noNotes": { id: "Belum ada catatan operasional.", en: "No operational notes." },
  "jobDetail.assignedContacts": { id: "Kontak Terkait", en: "Assigned Contacts" },
  "jobDetail.contactsDesc": { id: "Klien, FG/model, crew terkait pekerjaan ini.", en: "Client, FG/model, crew linked to this job." },
  "jobDetail.noContacts": { id: "Belum ada kontak terkait", en: "No contacts linked" },
  "jobDetail.editToAssign": { id: "Edit pekerjaan untuk menambahkan orang.", en: "Edit the job to assign people." },
  "jobDetail.payments": { id: "Pembayaran", en: "Payments" },
  "jobDetail.paymentsDesc": { id: "DP dan pelunasan yang diterima.", en: "DP and final payments received." },
  "jobDetail.noPayments": { id: "Belum ada pembayaran", en: "No payments" },
  "jobDetail.recordPayments": { id: "Catat pembayaran untuk melacak sisa tagihan.", en: "Record payments to track outstanding balance." },
  "jobDetail.addPaymentBtn": { id: "Tambah pembayaran", en: "Add payment" },
  "jobDetail.expensesTitle": { id: "Pengeluaran", en: "Expenses" },
  "jobDetail.expensesDesc": { id: "Biaya yang mempengaruhi laba bersih.", en: "Costs affecting net profit." },
  "jobDetail.noExpenses": { id: "Belum ada pengeluaran", en: "No expenses" },
  "jobDetail.trackCosts": { id: "Catat biaya di sini.", en: "Track costs here." },
  "jobDetail.addExpenseBtn": { id: "Tambah pengeluaran", en: "Add expense" },
  "jobDetail.reminders": { id: "Pengingat", en: "Reminders" },
  "jobDetail.remindersDesc": { id: "Dibuat otomatis dari jadwal.", en: "Auto-generated from job schedule." },
  "jobDetail.noReminders": { id: "Belum ada pengingat", en: "No reminders" },
  "jobDetail.remindersAutoGen": { id: "Pengingat dibuat otomatis setelah kontak dan jadwal disimpan.", en: "Reminders are auto-generated after contacts and schedule are saved." },
  "jobDetail.cancel": { id: "Batalkan", en: "Cancel" },

  // ── Contacts ──
  "contacts.title": { id: "Kontak", en: "Contacts" },
  "contacts.description": { id: "Simpan data klien, FG/model, crew, dan vendor untuk pekerjaan mendatang.", en: "Keep your clients, FG/model, crew, and vendors ready for future jobs." },
  "contacts.addContact": { id: "Tambah kontak", en: "Add contact" },
  "contacts.searchPlaceholder": { id: "Cari nama, telepon, atau email…", en: "Search name, phone, or email…" },
  "contacts.allRoles": { id: "Semua peran", en: "All roles" },
  "contacts.noContactsYet": { id: "Belum ada kontak", en: "No contacts yet" },
  "contacts.noContactsMatch": { id: "Tidak ada kontak yang cocok", en: "No contacts match this filter" },
  "contacts.createAddressBook": { id: "Buat buku alamat agar pekerjaan bisa menggunakan kontak yang sama.", en: "Create your address book so jobs can reuse the same contacts." },
  "contacts.tryAnother": { id: "Coba kata kunci atau peran lain.", en: "Try another keyword or role." },

  // ── Payments ──
  "payments.title": { id: "Pembayaran", en: "Payments" },
  "payments.description": { id: "Lacak DP, pelunasan, dan progres penerimaan.", en: "Track DP, final payments, and cash collection progress." },
  "payments.addPayment": { id: "Tambah pembayaran", en: "Add payment" },
  "payments.searchPlaceholder": { id: "Cari berdasarkan judul pekerjaan…", en: "Search by job title…" },
  "payments.allTypes": { id: "Semua tipe", en: "All types" },
  "payments.noPayments": { id: "Belum ada pembayaran", en: "No payments recorded" },
  "payments.noPaymentsMatch": { id: "Tidak ada pembayaran yang cocok", en: "No payments match this filter" },
  "payments.recordDp": { id: "Catat DP dan pelunasan untuk melacak sisa tagihan.", en: "Record DP and final payments to track what is still outstanding." },
  "payments.tryDifferent": { id: "Coba kata kunci atau tipe lain.", en: "Try a different keyword or payment type." },

  // ── Expenses ──
  "expenses.title": { id: "Pengeluaran", en: "Expenses" },
  "expenses.description": { id: "Catat setiap biaya pekerjaan yang mempengaruhi laba bersih.", en: "Capture every job cost that affects your real net profit." },
  "expenses.addExpense": { id: "Tambah pengeluaran", en: "Add expense" },
  "expenses.searchPlaceholder": { id: "Cari berdasarkan pekerjaan atau deskripsi…", en: "Search by job or description…" },
  "expenses.allCategories": { id: "Semua kategori", en: "All categories" },
  "expenses.noExpenses": { id: "Belum ada pengeluaran", en: "No expenses recorded" },
  "expenses.noExpensesMatch": { id: "Tidak ada pengeluaran yang cocok", en: "No expenses match this filter" },
  "expenses.recordCosts": { id: "Catat biaya FG, sewa peralatan, transport, dan lainnya.", en: "Record FG fees, equipment rentals, transport, and other costs." },
  "expenses.tryDifferent": { id: "Coba kata kunci atau kategori lain.", en: "Try a different keyword or category." },

  // ── Finance ──
  "finance.title": { id: "Keuangan", en: "Finance" },
  "finance.description": { id: "Pendapatan, kontrol biaya, tagihan belum dibayar, dan profitabilitas per pekerjaan.", en: "Income, cost control, unpaid jobs, and job-by-job profitability." },
  "finance.exportCsv": { id: "Ekspor CSV", en: "Export CSV" },
  "finance.grossIncome": { id: "Pendapatan Kotor", en: "Gross Income" },
  "finance.periodTotal": { id: "Total periode", en: "Period total" },
  "finance.paidIncome": { id: "Sudah Diterima", en: "Paid Income" },
  "finance.received": { id: "Diterima dari klien", en: "Received from clients" },
  "finance.expenses": { id: "Pengeluaran", en: "Expenses" },
  "finance.totalCosts": { id: "Total biaya tercatat", en: "Total costs recorded" },
  "finance.netProfit": { id: "Laba Bersih", en: "Net Profit" },
  "finance.grossMinusExp": { id: "Bruto dikurangi pengeluaran", en: "Gross minus expenses" },
  "finance.outstanding": { id: "Belum Dibayar", en: "Outstanding" },
  "finance.stillUnpaid": { id: "Masih belum dibayar", en: "Still unpaid" },
  "finance.perJobSummary": { id: "Ringkasan Per-Pekerjaan", en: "Per-Job Summary" },
  "finance.noFinancialData": { id: "Belum ada data keuangan", en: "No financial data yet" },
  "finance.addJobsToPopulate": { id: "Tambah pekerjaan, pembayaran, dan pengeluaran untuk mengisi ringkasan.", en: "Add jobs, payments, and expenses to populate this summary." },
  "finance.unpaidJobs": { id: "Pekerjaan Belum Dibayar", en: "Unpaid Jobs" },
  "finance.allPaid": { id: "Semua pekerjaan sudah lunas. 🎉", en: "All jobs are fully paid. 🎉" },
  "finance.expenseBreakdown": { id: "Rincian Pengeluaran", en: "Expense Breakdown" },
  "finance.noExpenses": { id: "Belum ada pengeluaran.", en: "No expenses recorded yet." },

  // ── Calendar ──
  "calendar.title": { id: "Kalender", en: "Calendar" },
  "calendar.description": { id: "Tampilan visual jadwal foto Anda.", en: "Visual overview of your photo shoot schedule." },

  // ── Fee Recap ──
  "feeRecap.title": { id: "Rekap Fee", en: "Fee Recap" },
  "feeRecap.description": { id: "Total fee yang dibayarkan ke FG/model, crew, editor, dan kontak lainnya.", en: "Total fee paid to FG/model, crew, editors, and other contacts across all jobs." },
  "feeRecap.totalFeePaid": { id: "Total Fee Dibayar", en: "Total Fee Paid" },
  "feeRecap.allContacts": { id: "Semua kontak digabung", en: "All contacts combined" },
  "feeRecap.totalPeople": { id: "Total Orang", en: "Total People" },
  "feeRecap.uniqueContacts": { id: "Kontak unik dengan fee", en: "Unique contacts with fee" },
  "feeRecap.avgPerson": { id: "Rata-rata Fee / Orang", en: "Avg Fee / Person" },
  "feeRecap.avgAll": { id: "Rata-rata keseluruhan", en: "Average across all" },
  "feeRecap.noFeeData": { id: "Tidak ada data fee", en: "No fee data found" },
  "feeRecap.assignFee": { id: "Tetapkan jumlah fee ke kontak saat membuat atau mengedit pekerjaan.", en: "Assign fee amounts to contacts when creating or editing jobs." },
  "feeRecap.grandTotal": { id: "Total Keseluruhan", en: "Grand Total" },

  // ── Reminders ──
  "reminders.title": { id: "Pengingat", en: "Reminders" },
  "reminders.description": { id: "Pengingat otomatis dari jadwal pekerjaan.", en: "Automatic reminders generated from job schedules." },
  "reminders.allStatuses": { id: "Semua status", en: "All statuses" },
  "reminders.noReminders": { id: "Belum ada pengingat", en: "No reminders scheduled" },
  "reminders.noRemindersMatch": { id: "Tidak ada pengingat di status ini", en: "No reminders in this status" },
  "reminders.createToGen": { id: "Buat atau perbarui pekerjaan untuk membuat pengingat otomatis.", en: "Create or update a job to auto-generate reminders." },
  "reminders.tryStatus": { id: "Coba status lain.", en: "Try another status." },

  // ── Settings ──
  "settings.title": { id: "Pengaturan", en: "Settings" },
  "settings.description": { id: "Kelola identitas bisnis dan detail pengirim pengingat.", en: "Manage your business identity and reminder sender details." },
  "settings.yourName": { id: "Nama Anda", en: "Your name" },
  "settings.businessName": { id: "Nama bisnis", en: "Business name" },
  "settings.phone": { id: "Telepon", en: "Phone" },
  "settings.timezone": { id: "Zona waktu", en: "Timezone" },
  "settings.language": { id: "Bahasa", en: "Language" },
  "settings.save": { id: "Simpan pengaturan", en: "Save settings" },
  "settings.saving": { id: "Menyimpan...", en: "Saving..." },
  "settings.back": { id: "Kembali", en: "Back" },
  "settings.updated": { id: "Pengaturan diperbarui.", en: "Settings updated." },
  "settings.saveFailed": { id: "Gagal menyimpan pengaturan.", en: "Unable to save settings." },

  // ── Payment Status Badge ──
  "paymentStatus.paid": { id: "Lunas", en: "Paid" },
  "paymentStatus.partiallyPaid": { id: "DP", en: "DP" },
  "paymentStatus.unpaid": { id: "Belum Bayar", en: "Unpaid" },

  // ── Job Status ──
  "jobStatus.draft": { id: "Draf", en: "Draft" },
  "jobStatus.confirmed": { id: "Dikonfirmasi", en: "Confirmed" },
  "jobStatus.completed": { id: "Selesai", en: "Completed" },
  "jobStatus.delivered": { id: "Terkirim", en: "Delivered" },
  "jobStatus.cancelled": { id: "Dibatalkan", en: "Cancelled" },

  // ── Table Headers ──
  "table.title": { id: "Judul", en: "Title" },
  "table.client": { id: "Klien", en: "Client" },
  "table.date": { id: "Tanggal", en: "Date" },
  "table.gross": { id: "Bruto", en: "Gross" },
  "table.net": { id: "Neto", en: "Net" },
  "table.status": { id: "Status", en: "Status" },
  "table.payment": { id: "Pembayaran", en: "Payment" },
  "table.actions": { id: "Aksi", en: "Actions" },
  "table.name": { id: "Nama", en: "Name" },
  "table.type": { id: "Tipe", en: "Type" },
  "table.phone": { id: "Telepon", en: "Phone" },
  "table.email": { id: "Email", en: "Email" },
  "table.organization": { id: "Organisasi", en: "Organization" },
  "table.job": { id: "Pekerjaan", en: "Job" },
  "table.method": { id: "Metode", en: "Method" },
  "table.amount": { id: "Jumlah", en: "Amount" },
  "table.category": { id: "Kategori", en: "Category" },
  "table.vendor": { id: "Vendor", en: "Vendor" },
  "table.recipient": { id: "Penerima", en: "Recipient" },
  "table.rule": { id: "Aturan", en: "Rule" },
  "table.scheduled": { id: "Dijadwalkan", en: "Scheduled" },
  "table.role": { id: "Peran", en: "Role" },
  "table.totalJobs": { id: "Total Pekerjaan", en: "Total Jobs" },
  "table.totalFee": { id: "Total Fee", en: "Total Fee" },
  "table.avgFee": { id: "Rata-rata Fee / Pekerjaan", en: "Avg Fee / Job" },

  // ── Date Filter ──
  "dateFilter.thisMonth": { id: "Bulan Ini", en: "This Month" },
  "dateFilter.lastMonth": { id: "Bulan Lalu", en: "Last Month" },
  "dateFilter.thisYear": { id: "Tahun Ini", en: "This Year" },
  "dateFilter.allTime": { id: "Semua", en: "All Time" },
  "dateFilter.fromDate": { id: "Dari tanggal", en: "From date" },
  "dateFilter.toDate": { id: "Sampai tanggal", en: "To date" },
  "dateFilter.apply": { id: "Terapkan", en: "Apply" },

  // ── Delete Confirmation ──
  "delete.confirm": { id: "Hapus", en: "Delete" },
  "delete.cancel": { id: "Batal", en: "Cancel" },
  "delete.deleting": { id: "Menghapus...", en: "Deleting..." },
  "delete.job": { id: "pekerjaan", en: "job" },
  "delete.payment": { id: "pembayaran", en: "payment" },
  "delete.expense": { id: "pengeluaran", en: "expense" },
  "delete.contact": { id: "kontak", en: "contact" },
  "delete.title": { id: "Hapus {entity}?", en: "Delete {entity}?" },
  "delete.description": { id: "Yakin ingin menghapus {entity} ini? Tindakan ini tidak bisa dibatalkan.", en: "Are you sure you want to delete this {entity}? This action cannot be undone." },

  // ── Chart ──
  "chart.monthlyTrend": { id: "Tren Bulanan", en: "Monthly Trend" },
  "chart.monthlyTrendDesc": { id: "Perbandingan bruto vs neto dalam 6 bulan terakhir.", en: "Gross vs net income over the last 6 months." },
  "chart.noData": { id: "Belum ada data keuangan. Selesaikan pekerjaan untuk melihat tren pendapatan.", en: "No financial data yet. Complete jobs to see your income trend." },

  // ── Misc ──
  "misc.noPhone": { id: "Tanpa telepon", en: "No phone" },
  "misc.primary": { id: "utama", en: "primary" },
  "misc.reminderOn": { id: "pengingat aktif", en: "reminder on" },
  "misc.fee": { id: "Fee", en: "Fee" },
  "misc.tbd": { id: "Belum ditentukan", en: "TBD" },

  // ── Conflict Detection ──
  "conflict.safe": { id: "Aman", en: "Safe" },
  "conflict.parallel": { id: "Parallel Job", en: "Parallel Job" },
  "conflict.warningUnassigned": { id: "Belum Ada Fotografer", en: "No Photographer" },
  "conflict.warningTight": { id: "Jadwal Mepet", en: "Tight Schedule" },
  "conflict.conflict": { id: "Bentrok!", en: "Conflict!" },
  "conflict.parallelDesc": { id: "Aman — fotografer berbeda", en: "Safe — different photographers" },
  "conflict.conflictDesc": { id: "Fotografer sama di waktu bersamaan!", en: "Same photographer at the same time!" },

  // ── Assignment Status ──
  "assignment.unassigned": { id: "Belum Ditugaskan", en: "Unassigned" },
  "assignment.assigned": { id: "Ditugaskan", en: "Assigned" },
  "assignment.waitingConfirmation": { id: "Menunggu Konfirmasi", en: "Waiting Confirmation" },
  "assignment.confirmed": { id: "Dikonfirmasi", en: "Confirmed" },
  "assignment.needReplacement": { id: "Perlu Pengganti", en: "Need Replacement" },
  "assignment.conflict": { id: "Bentrok", en: "Conflict" },
  "assignment.title": { id: "Penugasan", en: "Assignment" },
  "assignment.description": { id: "Fotografer, FG/model, crew, dan klien terkait pekerjaan ini.", en: "Photographer, FG/model, crew, and client linked to this job." },
  "assignment.addPerson": { id: "Tambah orang", en: "Add person" },
  "assignment.noPeople": { id: "Belum ada yang ditugaskan.", en: "No one assigned yet." },

  // ── Confirmation Status ──
  "confirmation.pending": { id: "Menunggu", en: "Pending" },
  "confirmation.accepted": { id: "Diterima", en: "Accepted" },
  "confirmation.declined": { id: "Ditolak", en: "Declined" },
  "confirmation.tentative": { id: "Tentatif", en: "Tentative" },

  // ── Fee Status ──
  "feeStatus.unpaid": { id: "Belum Dibayar", en: "Unpaid" },
  "feeStatus.paid": { id: "Lunas", en: "Paid" },

  // ── Workflow Status ──
  "workflow.scheduled": { id: "Dijadwalkan", en: "Scheduled" },
  "workflow.shot": { id: "Selesai Foto", en: "Shot" },
  "workflow.editing": { id: "Editing", en: "Editing" },
  "workflow.ready": { id: "Siap Kirim", en: "Ready" },
  "workflow.delivered": { id: "Terkirim", en: "Delivered" },
  "workflow.title": { id: "Workflow & Pengiriman", en: "Workflow & Delivery" },
  "workflow.description": { id: "Tracking progress produksi.", en: "Production progress tracking." },
  "workflow.progress": { id: "Progres", en: "Progress" },

  // ── Deadlines ──
  "deadline.delivery": { id: "Deadline Pengiriman", en: "Delivery Deadline" },
  "deadline.actualDelivery": { id: "Tanggal Pengiriman Aktual", en: "Actual Delivery" },

  // ── WhatsApp ──
  "whatsapp.copyMessage": { id: "Salin Pesan", en: "Copy Message" },
  "whatsapp.copied": { id: "Tersalin!", en: "Copied!" },
  "whatsapp.openWhatsapp": { id: "Buka WhatsApp", en: "Open WhatsApp" },
  "whatsapp.noPhone": { id: "Tidak ada nomor HP", en: "No phone number" },

  // ── Dashboard Extra KPIs ──
  "dashboard.unassigned": { id: "Belum Ditugaskan", en: "Unassigned" },
  "dashboard.unassignedHelper": { id: "Job belum ada fotografer", en: "Jobs without photographer" },
  "dashboard.upcomingDeadlines": { id: "Deadline Dekat", en: "Upcoming Deadlines" },
  "dashboard.deadlineHelper": { id: "Dalam 3 hari ke depan", en: "Within next 3 days" },
  "dashboard.unassignedJobs": { id: "Job Belum Ditugaskan", en: "Unassigned Jobs" },
  "dashboard.unassignedDesc": { id: "Belum ada fotografer yang ditugaskan", en: "No photographer assigned yet" },
  "dashboard.nearestDeadlines": { id: "Deadline Terdekat", en: "Upcoming Deadlines" },
  "dashboard.crewFees": { id: "Fee Crew/Freelance", en: "Crew/Freelance Fees" },
  "dashboard.crewFeesDesc": { id: "Job dengan fee yang perlu dibayarkan", en: "Jobs with outstanding crew fees" },

  // ── Dashboard v2 ──
  "dashboard.greeting.morning": { id: "Selamat pagi", en: "Good morning" },
  "dashboard.greeting.afternoon": { id: "Selamat siang", en: "Good afternoon" },
  "dashboard.greeting.evening": { id: "Selamat sore", en: "Good evening" },
  "dashboard.greeting.night": { id: "Selamat malam", en: "Good night" },
  "dashboard.quickActions": { id: "Aksi Cepat", en: "Quick Actions" },
  "dashboard.todaySummary": { id: "Ringkasan Hari Ini", en: "Today's Summary" },
  "dashboard.viewAll": { id: "Lihat semua", en: "View all" },
  "dashboard.shootsThisWeek": { id: "shoot minggu ini", en: "shoot(s) this week" },
  "dashboard.outstandingInvoices": { id: "tagihan tertunggak", en: "outstanding invoice(s)" },
  "dashboard.addPayment": { id: "Catat Pembayaran", en: "Record Payment" },
  "dashboard.addExpense": { id: "Tambah Pengeluaran", en: "Add Expense" },
  "dashboard.addContact": { id: "Tambah Kontak", en: "Add Contact" },
  "dashboard.openCalendar": { id: "Lihat Kalender", en: "View Calendar" },
  "dashboard.openFinance": { id: "Laporan", en: "Finance" },
  "dashboard.paidOf": { id: "dibayar dari", en: "paid of" },
  "dashboard.alertItems": { id: "item perlu perhatian", en: "item(s) need attention" },
  "dashboard.monthlyTrend": { id: "Tren Pendapatan", en: "Revenue Trend" },
  "dashboard.monthlyTrendDesc": { id: "Gross vs Net dalam 6 bulan terakhir", en: "Gross vs Net over the last 6 months" },
  "dashboard.noTrendData": { id: "Belum ada data. Selesaikan job untuk melihat tren.", en: "No data yet. Complete jobs to see your trend." },
  "dashboard.activeAlerts": { id: "Perlu Perhatian", en: "Needs Attention" },

  // ── Job Detail Extra ──
  "jobDetail.crewFees": { id: "Fee Crew", en: "Crew Fees" },
  "jobDetail.crewFeesHelper": { id: "Fee FG/crew/editor", en: "FG/crew/editor fees" },
  "jobDetail.netProfitHelper": { id: "Bruto - pengeluaran - fee crew", en: "Gross - expenses - crew fees" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  return entry?.[locale] ?? entry?.["en"] ?? key;
}

export function tReplace(key: TranslationKey, locale: Locale, replacements: Record<string, string>): string {
  let text = t(key, locale);
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(`{${placeholder}}`, value);
  }
  return text;
}
