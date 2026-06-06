const StorageManager = {
  STORAGE_KEY: "borrowsData",

  init() {
    const oldData = localStorage.getItem(this.STORAGE_KEY);
    if (!oldData) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialBorrowsData));
    }
  },

  getBorrows() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
  },

  saveBorrows(borrows) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(borrows));
  },

  formatDate(dateValue) {
    if (!dateValue) return "";
    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  }
};

const LibraryApp = {
  editingId: null,

  renderTable() {
    const borrows = StorageManager.getBorrows();
    const tbody = document.getElementById("borrowTableBody");
    const emptyMessage = document.getElementById("emptyMessage");
    
    tbody.innerHTML = "";
    emptyMessage.style.display = borrows.length === 0 ? "block" : "none";

    let borrowingCount = 0;
    let returnedCount = 0;

    borrows.forEach((b, index) => {
      // Đếm thống kê
      if (b.status === "Đang mượn") borrowingCount++;
      if (b.status === "Đã trả") returnedCount++;

      const statusBadge = b.status === "Đã trả" ? '<span class="badge badge-green">Đã trả</span>' : '<span class="badge badge-yellow">Đang mượn</span>';

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${b.borrowId}</td>
        <td>${b.fullName}</td>
        <td>${b.bookId}</td>
        <td>${StorageManager.formatDate(b.borrowDate)}</td>
        <td>${StorageManager.formatDate(b.returnDate)}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-edit" type="button" data-edit="${b.borrowId}">Sửa</button>
          <button class="btn btn-delete" type="button" data-delete="${b.borrowId}">Xóa</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Cập nhật text thống kê
    document.getElementById("totalBorrows").textContent = borrows.length;
    document.getElementById("borrowingCount").textContent = borrowingCount;
    document.getElementById("returnedCount").textContent = returnedCount;
  },

  openModal() {
    const modal = document.getElementById("borrowModal");
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  },

  closeModal() {
    const modal = document.getElementById("borrowModal");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  },

  resetForm() {
    this.editingId = null;
    document.getElementById("borrowForm").reset();
    document.getElementById("editingId").value = "";
    document.getElementById("borrowId").readOnly = false;
    document.getElementById("formTitle").textContent = "Thêm Phiếu Mượn";

    document.querySelectorAll(".error").forEach(error => error.textContent = "");
    document.querySelectorAll(".input-invalid").forEach(input => input.classList.remove("input-invalid"));
  },

  getFormData() {
    return {
      borrowId: $.trim($("#borrowId").val()),
      fullName: $.trim($("#fullName").val()),
      bookId: $.trim($("#bookId").val()),
      category: $("#category").val(),
      borrowDate: $("#borrowDate").val(),
      returnDate: $("#returnDate").val(),
      phone: $.trim($("#phone").val()),
      email: $.trim($("#email").val()),
      status: $("#status").val(),
      notes: $.trim($("#notes").val())
    };
  },

  addBorrow() {
    this.resetForm();
    this.openModal();
  },

  editBorrow(borrowId) {
    const borrows = StorageManager.getBorrows();
    const borrow = borrows.find(item => item.borrowId === borrowId);

    if (!borrow) return;

    this.resetForm();
    this.editingId = borrow.borrowId;

    document.getElementById("formTitle").textContent = "Sửa Phiếu Mượn";
    document.getElementById("editingId").value = borrow.borrowId;

    $("#borrowId").val(borrow.borrowId).prop("readonly", true);
    $("#fullName").val(borrow.fullName);
    $("#bookId").val(borrow.bookId);
    $("#category").val(borrow.category);
    $("#borrowDate").val(borrow.borrowDate);
    $("#returnDate").val(borrow.returnDate);
    $("#phone").val(borrow.phone);
    $("#email").val(borrow.email);
    $("#status").val(borrow.status);
    $("#notes").val(borrow.notes);

    this.openModal();
  },

  deleteBorrow(borrowId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiếu mượn ${borrowId} không?`)) return;

    const borrows = StorageManager.getBorrows();
    const updated = borrows.filter(b => b.borrowId !== borrowId);

    StorageManager.saveBorrows(updated);
    this.renderTable();
  },

  saveBorrow(event) {
    event.preventDefault();

    let borrows = StorageManager.getBorrows();
    const isValid = FormValidator.validateAll(borrows, this.editingId);

    if (!isValid) return;

    const data = this.getFormData();

    if (this.editingId) {
      borrows = borrows.map(b => b.borrowId === this.editingId ? data : b);
    } else {
      borrows.push(data);
    }

    StorageManager.saveBorrows(borrows);
    this.closeModal();
    this.renderTable();
  },

  bindEvents() {
    document.getElementById("btnAddBorrow").addEventListener("click", () => this.addBorrow());
    document.getElementById("borrowForm").addEventListener("submit", event => this.saveBorrow(event));
    document.getElementById("btnCancel").addEventListener("click", () => this.closeModal());
    
    document.querySelectorAll("[data-close-modal]").forEach(el => {
      el.addEventListener("click", () => this.closeModal());
    });

    document.getElementById("borrowTableBody").addEventListener("click", event => {
      const editId = event.target.dataset.edit;
      const deleteId = event.target.dataset.delete;
      if (editId) this.editBorrow(editId);
      if (deleteId) this.deleteBorrow(deleteId);
    });

    // Validate realtime
    $("#borrowForm input, #borrowForm select, #borrowForm textarea").on("input change", () => {
      FormValidator.validateAll(StorageManager.getBorrows(), this.editingId);
    });
  },

  init() {
    StorageManager.init();
    this.renderTable();
    this.bindEvents();
  }
};

$(document).ready(() => LibraryApp.init());