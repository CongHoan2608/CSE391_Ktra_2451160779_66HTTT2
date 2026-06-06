const FormValidator = {
  setError(fieldId, message) {
    $(`#${fieldId}Error`).text(message);
    $(`#${fieldId}`).addClass("input-invalid");
  },

  clearError(fieldId) {
    $(`#${fieldId}Error`).text("");
    $(`#${fieldId}`).removeClass("input-invalid");
  },

  validateBorrowId(borrows, editingId) {
    const value = $.trim($("#borrowId").val());
    const regex = /^PM-\d+$/; // Bắt đầu bằng PM-, theo sau là các chữ số

    if (value === "") {
      this.setError("borrowId", "Mã phiếu mượn không được để trống.");
      return false;
    }
    if (!regex.test(value)) {
      this.setError("borrowId", "Mã phiếu phải có định dạng PM-XXXX (VD: PM-2048).");
      return false;
    }
    const isDuplicate = borrows.some(b => b.borrowId === value && b.borrowId !== editingId);
    if (isDuplicate) {
      this.setError("borrowId", "Mã phiếu mượn đã tồn tại.");
      return false;
    }

    this.clearError("borrowId");
    return true;
  },

  validateFullName() {
    const value = $.trim($("#fullName").val());
    const regex = /^[A-Za-zÀ-ỹ\s]+$/u;

    if (value === "") {
      this.setError("fullName", "Họ tên không được để trống.");
      return false;
    }
    if (value.length < 2 || value.length > 40) {
      this.setError("fullName", "Họ tên phải từ 2 đến 40 ký tự.");
      return false;
    }
    if (!regex.test(value)) {
      this.setError("fullName", "Họ tên chỉ được chứa chữ cái và khoảng trắng.");
      return false;
    }

    this.clearError("fullName");
    return true;
  },

  validateBookId() {
    const value = $.trim($("#bookId").val());
    const regex = /^BK\d{5}$/; // BK + đúng 5 chữ số

    if (value === "") {
      this.setError("bookId", "Mã sách không được để trống.");
      return false;
    }
    if (!regex.test(value)) {
      this.setError("bookId", "Mã sách phải bắt đầu bằng BK và theo sau đúng 5 chữ số (VD: BK10234).");
      return false;
    }

    this.clearError("bookId");
    return true;
  },

  validateCategory() {
    if ($("#category").val() === "") {
      this.setError("category", "Vui lòng chọn thể loại sách.");
      return false;
    }
    this.clearError("category");
    return true;
  },

  validateBorrowDate() {
    const value = $("#borrowDate").val();
    
    if (value === "") {
      this.setError("borrowDate", "Ngày mượn không được để trống.");
      return false;
    }

    const borrowDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đưa về đầu ngày để so sánh

    if (borrowDate > today) {
      this.setError("borrowDate", "Ngày mượn không được lớn hơn ngày hiện tại.");
      return false;
    }

    this.clearError("borrowDate");
    return true;
  },

  validateReturnDate() {
    const borrowVal = $("#borrowDate").val();
    const returnVal = $("#returnDate").val();

    if (returnVal === "") {
      this.setError("returnDate", "Hạn trả không được để trống.");
      return false;
    }

    if (borrowVal !== "") {
      const borrowDate = new Date(borrowVal);
      const returnDate = new Date(returnVal);
      
      if (returnDate < borrowDate) {
        this.setError("returnDate", "Hạn trả phải lớn hơn hoặc bằng ngày mượn.");
        return false;
      }

      // Tính số ngày chênh lệch
      const timeDiff = returnDate.getTime() - borrowDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (daysDiff > 30) {
        this.setError("returnDate", "Hạn trả không được vượt quá 30 ngày kể từ ngày mượn.");
        return false;
      }
    }

    this.clearError("returnDate");
    return true;
  },

  validatePhone() {
    const value = $.trim($("#phone").val());
    const regex = /^(03|05|07|08|09)\d{8}$/;

    if (value === "") {
      this.setError("phone", "Số điện thoại không được để trống.");
      return false;
    }
    if (!regex.test(value)) {
      this.setError("phone", "SĐT phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08, hoặc 09.");
      return false;
    }

    this.clearError("phone");
    return true;
  },

  validateEmail() {
    const value = $.trim($("#email").val());
    const regex = /^[a-zA-Z0-9._%+-]+@library\.vn$/;

    if (value === "") {
      this.setError("email", "Email không được để trống.");
      return false;
    }
    if (!regex.test(value)) {
      this.setError("email", "Email phải đúng định dạng và kết thúc bằng @library.vn.");
      return false;
    }

    this.clearError("email");
    return true;
  },

  validateStatus() {
    if ($("#status").val() === "") {
      this.setError("status", "Vui lòng chọn trạng thái mượn.");
      return false;
    }
    this.clearError("status");
    return true;
  },

  validateNotes() {
    const value = $.trim($("#notes").val());
    
    if (value.length > 120) {
      this.setError("notes", "Ghi chú không được vượt quá 120 ký tự.");
      return false;
    }

    // Kiểm tra không chứa thẻ script, iframe, img
    const forbiddenTags = /<script>|<iframe>|<img>/i;
    if (forbiddenTags.test(value)) {
      this.setError("notes", "Ghi chú không được chứa các mã HTML nguy hiểm.");
      return false;
    }

    this.clearError("notes");
    return true;
  },

  validateAll(borrows, editingId) {
    const results = [
      this.validateBorrowId(borrows, editingId),
      this.validateFullName(),
      this.validateBookId(),
      this.validateCategory(),
      this.validateBorrowDate(),
      this.validateReturnDate(),
      this.validatePhone(),
      this.validateEmail(),
      this.validateStatus(),
      this.validateNotes()
    ];

    return results.every(result => result === true);
  }
};