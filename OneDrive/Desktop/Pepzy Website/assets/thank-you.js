(function () {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id') || '';

  const orderIdBox = document.getElementById('orderIdBox');
  const successCopy = document.getElementById('successCopy');

  if (orderId) {
    if (orderIdBox) orderIdBox.textContent = orderId;

    if (successCopy) {
      successCopy.innerHTML = `Order Request Received! 🎉 Your Order ID is <b>${orderId}</b>. Our team is currently verifying stock with our supplier. Please check your email inbox shortly for your GoTyme QR invoice once your items are secured. Thank you for your patience!`;
    }
  } else {
    if (successCopy) {
      successCopy.innerHTML = `Order Request Received! 🎉 Your Order ID is <b>[missing]</b>. Our team is currently verifying stock with our supplier. Please check your email inbox shortly for your GoTyme QR invoice once your items are secured. Thank you for your patience!`;
    }
  }
})();

