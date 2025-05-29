function saveDraft() {
    alert("Verification saved in drafts!");
}

document.getElementById('verificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    Swal.fire({
            title: "Success!",
            text: "Verification submitted!",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#7e22ce",
          })
    // يمكنك هنا إضافة كود إرسال البيانات للسيرفر
}); 