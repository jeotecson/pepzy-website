<?php
// Minimal backend to create an order + return a dynamic payment URL/QR.
// Replace the GoTyme API call below with your real GoTyme payment creation endpoint.
//
// Endpoints:
//  - POST /payment.php?action=create
//  - POST /payment.php?action=webhook   (optional)

header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

function respond($statusCode, $payload) {
  http_response_code($statusCode);
  echo json_encode($payload);
  exit;
}

if ($action === 'create') {
  $amount = isset($_POST['amount']) ? (float)$_POST['amount'] : 0;
  $orderId = trim($_POST['orderId'] ?? '');

  if ($amount <= 0 || $orderId === '') {
    respond(400, ['ok' => false, 'error' => 'Missing or invalid amount/orderId']);
  }

  // TODO: Call GoTyme Payment API using your merchant credentials.
  // Expected return from GoTyme: a payment reference, a redirect URL, and/or a dynamic QR payload/image.
  // For now we return a placeholder payment URL that you will replace.

  // Example placeholders:
  $paymentUrl = 'https://example.com/gotyme/pay?order=' . urlencode($orderId);

  respond(200, [
    'ok' => true,
    'orderId' => $orderId,
    'amount' => $amount,
    'paymentUrl' => $paymentUrl,
  ]);
}

if ($action === 'webhook') {
  // TODO: Verify webhook signature and mark order as paid.
  respond(200, ['ok' => true]);
}

respond(400, ['ok' => false, 'error' => 'Unknown action']);

