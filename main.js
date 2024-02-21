import Navigo from 'navigo';

const router = new Navigo('/');

const renderPage = (content) => {
  document.getElementById('app').innerHTML = content;
};
const introductionPage = async () => {
  try {
    const response = await fetch('/db.json');// đọc file db.json
    const data = await response.json();

    const danhMucVeHtml = data.danhmucve.map(item => `<li>${item.name}</li>`).join('');// tạo 1 mảng các thẻ li từ danhmucve
    const veHtml = data.ve.map(item => `<li>Flight Number: ${item.flightNumber}, Category: ${item.category}, Price: ${item.price}</li>`).join('');// tạo 1 mảng các thẻ li từ ve

    const content = `
      <h1>Giới thiệu</h1>
      <h2>Danh mục vé:</h2>
      <ul>${danhMucVeHtml}</ul>
      <h2>Vé:</h2>
      <ul>${veHtml}</ul>
    `;

    renderPage(content);
  } catch (error) {//nếu lấy db.json thất bại
    console.error('Error :', error);
  }
};



const contactPage = () => {
  renderPage('<h1>Liên hệ</h1><p>Thông tin liên hệ </p><p>Văn Phòng ABCXYZ</p><p>Email:abcxyz@gmail.com</p><p>Số điện thoại:034567890</p>');
};

const bookingPage = async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();

    const danhMucVeOptions = data.danhmucve.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
    const veOptions = data.ve.map(item => `<option value="${item.flightNumber}">${item.flightNumber}</option>`).join('');

    const content = `
      <h1>Đặt vé máy bay</h1>
      <form id="bookingForm">
        <label for="fullName">Họ và tên:</label>
        <input type="text" id="fullName" name="fullName" required>

        <label for="phoneNumber">Số điện thoại:</label>
        <input type="tel" id="phoneNumber" name="phoneNumber" required>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <label for="danhMucVe">Danh mục vé:</label>
        <select id="danhMucVe" name="danhMucVe" required>
          <option value="" disabled selected>Chọn danh mục vé</option>
          ${danhMucVeOptions}
        </select>

        <label for="ve">Vé:</label>
        <select id="ve" name="ve" required>
          <option value="" disabled selected>Chọn vé</option>
          ${veOptions}
        </select>

        <button type="submit">Đặt vé</button>
      </form>
    `;

    renderPage(content);

    // Xử lý phím submit
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', handleBookingSubmit);
  } catch (error) {
    console.error('Error:', error);

  }
};

//thêm bookings
const sendBookingDataToServer = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert('Đặt vé thành công');
    } else {
      console.error('Failed to save booking on server.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
const handleBookingSubmit = (event) => {
   event.preventDefault();//dòng này để tránh tải lại trang


  
  const formData = new FormData(event.target);
  // Lấy thông tin từ form
  const fullName = formData.get('fullName');
  const phoneNumber = formData.get('phoneNumber');
  const email = formData.get('email');
  const danhMucVe = formData.get('danhMucVe');
  const ve = formData.get('ve');
const trangThai='Thành công';
  // in thông tin form ở console
  console.log('Form data:', { fullName, phoneNumber, email, danhMucVe, ve });
  const bookingData = {
    fullName,
    phoneNumber,
    email,
    danhMucVe,
    ve,
    trangThai
  };

  sendBookingDataToServer(bookingData);
};

//thêm sửa xóa danh mục vé
const editCategory = async (categoryId) => {
  const newName = prompt('Nhập tên mới cho danh mục:');
  if (newName !== null) {
    try {
      const response = await fetch(`http://localhost:3000/danhmucve/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      if (response.ok) {
        alert('Danh mục đã được sửa thành công.');
        // Sau khi sửa thành công, cập nhật lại danh sách danh mục vé trên trang adminPage
        adminPage();
      } else {
        throw new Error('Failed to edit category.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const deleteCategory = async (categoryId) => {
  const confirmDelete = confirm('Bạn có chắc chắn muốn xóa danh mục này?');
  if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:3000/danhmucve/${categoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Danh mục đã được xóa thành công.');
        // Sau khi xóa thành công, cập nhật lại danh sách danh mục vé trên trang adminPage
        adminPage();
      } else {
        throw new Error('Failed to delete category.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const addCategory = async (categoryName) => {
  try {
    const response = await fetch('http://localhost:3000/danhmucve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: categoryName }),
    });
    if (response.ok) {
      alert('Danh mục mới đã được thêm thành công.');
      adminPage(); // Cập nhật lại trang sau khi thêm danh mục thành công.
    } else {
      throw new Error('Failed to add new category.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const adminPage = async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();

    const danhMucVeHtml = data.danhmucve.map(item => `
      <div>
        <span>${item.name}</span>
        <button  data-id="${item.id}" class="edit-btn" >Sửa</button>
        <button  data-id="${item.id}" class="delete-btn">Xóa</button>
      </div>
    `).join('');

    const content = `
      <h1>Trang quản trị</h1>
      <h2>Danh mục vé:</h2>
      ${danhMucVeHtml}
      <button id="addCategoryBtn">Thêm</button>
    `;

    renderPage(content);

    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.getAttribute('data-id');
        editCategory(categoryId);
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.getAttribute('data-id');
        deleteCategory(categoryId);
      });
    });
    const addCategoryBtn = document.getElementById('addCategoryBtn');
  addCategoryBtn.addEventListener('click', () => {
    const newCategoryName = prompt('Nhập tên danh mục mới:');
    if (newCategoryName !== null && newCategoryName.trim() !== '') {
      addCategory(newCategoryName);
    }
  });
  } catch (error) {
    console.error('Error:', error);
  }
};
const closeModal = () => {
  const modal = document.getElementById('editVeModal');
  modal.remove();
};

// thêm sửa xóa vé
const deleteVe = async (veId) => {
  const confirmDelete = confirm('Bạn có chắc chắn muốn xóa vé này?');
  if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:3000/ve/${veId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Vé đã được xóa thành công.');
        quanLyVePage(); // Cập nhật lại trang sau khi xóa vé thành công.
      } else {
        throw new Error('Failed to delete ticket.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const editVe = (veId,data) => {
  // Tìm vé cần chỉnh sửa trong danh sách vé
  const veToEdit = data.ve.find(ve => ve.id === veId);

  // Hiển thị modal hoặc phần tử popup với biểu mẫu chỉnh sửa thông tin vé
  const modalContent = `
    <div id="editVeModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Chỉnh sửa thông tin vé</h2>
        <form id="editVeForm">
          <label for="flightNumber">Số chuyến bay:</label>
          <input type="text" id="flightNumber" name="flightNumber" value="${veToEdit.flightNumber}" required>

          <label for="category">Danh mục:</label>
          <input type="text" id="category" name="category" value="${veToEdit.category}" required>

          <label for="price">Giá:</label>
          <input type="text" id="price" name="price" value="${veToEdit.price}" required>

          <button type="button" id="saveVe">Lưu</button>
        </form>
      </div>
    </div>
  `;

  // Thêm modal hoặc phần tử popup vào trang
  document.body.insertAdjacentHTML('beforeend', modalContent);
  const saveVe= document.getElementById('saveVe');
  saveVe.addEventListener('click',()=>{
    saveChanges(veId);
  })
};


const closeModal2 = () => {
  const modal = document.getElementById('addVeModal');
  modal.remove();
};
const saveChanges = async (veId) => {
  const flightNumber = document.getElementById('flightNumber').value;
  const category = document.getElementById('category').value;
  const price = document.getElementById('price').value;

  try {
    const response = await fetch(`http://localhost:3000/ve/${veId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flightNumber, category, price }),
    });
    if (response.ok) {
      alert('Thông tin vé đã được cập nhật thành công.');
      closeModal(); // Đóng modal sau khi lưu thành công
      quanLyVePage(); // Cập nhật lại trang quản lý vé
    } else {
      throw new Error('Failed to update ticket.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const openAddVeModal = () => {
  const modalContent = `
    <div id="addVeModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Thêm vé mới</h2>
        <form id="addVeForm">
          <label for="flightNumber">Số chuyến bay:</label>
          <input type="text" id="flightNumber" name="flightNumber" required>

          <label for="category">Danh mục:</label>
          <input type="text" id="category" name="category" required>

          <label for="price">Giá:</label>
          <input type="text" id="price" name="price" required>

          <button type="button" id="addVe">Thêm</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalContent);
  const saveVe= document.getElementById('addVe');
  saveVe.addEventListener('click',()=>{
    addVe();
  })
};

const addVe = async () => {
  const flightNumber = document.getElementById('flightNumber').value;
  const category = document.getElementById('category').value;
  const price = document.getElementById('price').value;

  try {
    const response = await fetch('http://localhost:3000/ve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flightNumber, category, price }),
    });
    if (response.ok) {
      alert('Vé đã được thêm thành công.');
      closeModal2();
      quanLyVePage(); // Cập nhật lại trang
    } else {
      throw new Error('Failed to add ticket.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const quanLyVePage = async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();

    const danhSachVeHtml = data.ve.map(ve => `
      <div>
        <p>Flight Number: ${ve.flightNumber}</p>
        <p>Category: ${ve.category}</p>
        <p>Price: ${ve.price}</p>
        <button class="edit-btn" data-id="${ve.id}">Sửa</button>
        <button class="delete-btn" data-id="${ve.id}">Xóa</button>
      </div>
    `).join('');

    const content = `
      <h1>Trang Quản lý Vé</h1>
      <div class="danh-sach-ve">
        ${danhSachVeHtml}
      </div>
      <br></br>
      <br></br>
      <br></br>
      <button id="addVeBtn">Thêm</button>
    `;

    renderPage(content);

    // Gán sự kiện click cho các nút "Sửa" và "Xóa"
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const veId = button.getAttribute('data-id');
        editVe(veId,data);
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const veId = button.getAttribute('data-id');
        deleteVe(veId);
      });
    });

    const addVeBtn = document.getElementById('addVeBtn');
  addVeBtn.addEventListener('click', () => {
    openAddVeModal();
  });
  } catch (error) {
    console.error('Error:', error);
  }
};
// thêm sửa xóa booking 
const quanLyBookingPage = async () => {
  try {
    const response = await fetch('http://localhost:3000/bookings');
    const bookings = await response.json();

    let bookingListHTML = '';
    bookings.forEach(booking => {
      bookingListHTML += `
        <div class="booking-item">
          <p>Họ và tên: ${booking.fullName}</p>
          <p>Số điện thoại: ${booking.phoneNumber}</p>
          <p>Email: ${booking.email}</p>
          <p>Danh mục vé: ${booking.danhMucVe}</p>
          <p>Vé: ${booking.ve}</p>
          <p>Trạng thái: ${booking.trangThai}</p>
          <button class="edit-btn" data-id="${booking.id}">Sửa</button>
          <button class="delete-btn" data-id="${booking.id}">Xóa</button>
        </div>
      `;
    });

    const content = `
      <h1>Quản lý Đặt vé</h1>
      <div id="bookingList">
        ${bookingListHTML}
      </div>
    `;

    renderPage(content);

    // Thêm sự kiện click cho các nút "Sửa" và "Xóa"
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const bookingId = button.getAttribute('data-id');
        editBooking(bookingId);
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const bookingId = button.getAttribute('data-id');
        deleteBooking(bookingId);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

const editBooking = async (bookingId) => {
  try {
    const response = await fetch(`http://localhost:3000/bookings/${bookingId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch booking details.');
    }
    const booking = await response.json();

    // Hiển thị modal để chỉnh sửa thông tin đặt vé
    const modalContent = `
      <div id="editBookingModal" class="modal">
        <div class="modal-content">
          <span class="close" onclick="closeModal()">&times;</span>
          <h2>Chỉnh sửa thông tin đặt vé</h2>
          <form id="editBookingForm">
            <label for="fullName">Họ và tên:</label>
            <input type="text" id="fullName" name="fullName" value="${booking.fullName}" required>

            <label for="phoneNumber">Số điện thoại:</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value="${booking.phoneNumber}" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${booking.email}" required>

            <label for="danhMucVe">Danh mục vé:</label>
            <input type="text" id="danhMucVe" name="danhMucVe" value="${booking.danhMucVe}" required>

            <label for="ve">Vé:</label>
            <input type="text" id="ve" name="ve" value="${booking.ve}" required>

            <label for="trangThai">Trạng thái:</label>
            <input type="text" id="trangThai" name="trangThai" value="${booking.trangThai}" required>

            <button id="saveBookings">Lưu</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const saveBookings = document.getElementById('saveBookings');
    saveBookings.addEventListener('click',()=>{
      saveChangesBooking(bookingId);
    });
  } catch (error) {
    console.error('Error:', error);
  }
};


const closeModal3 = () => {
  const modal = document.getElementById('editBookingModal');
  if (modal) {
    modal.remove();
  }
};

const saveChangesBooking = async (bookingId) => {
  const fullName = document.getElementById('fullName').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const email = document.getElementById('email').value;
  const danhMucVe = document.getElementById('danhMucVe').value;
  const ve = document.getElementById('ve').value;
  const trangThai = document.getElementById('trangThai').value;

  try {
    const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, phoneNumber, email, danhMucVe, ve, trangThai }),
    });
    if (response.ok) {
      alert('Thông tin đặt vé đã được cập nhật thành công.');
      closeModal3(); // Đóng modal sau khi lưu thành công
      quanLyBookingPage(); // Cập nhật lại trang quản lý đặt vé
    } else {
      throw new Error('Failed to update booking.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteBooking = async (bookingId) => {
  const confirmDelete = confirm('Bạn có chắc chắn muốn xóa đặt vé này?');
  if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Đặt vé đã được xóa thành công.');
        quanLyBookingPage(); // Cập nhật lại trang sau khi xóa thành công
      } else {
        throw new Error('Failed to delete booking.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};





router
  .on({
    '/': introductionPage,
    '/contact': contactPage,
    '/booking': bookingPage,
    '/admin':adminPage,
    '/quanlyVe':quanLyVePage,
    '/quanlyBooking':quanLyBookingPage
  })
  .resolve();

