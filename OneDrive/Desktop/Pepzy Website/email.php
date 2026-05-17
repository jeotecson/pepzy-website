<?php
// Simple confirmation email endpoint for Order Requests.
// Called from index.html after customer submits the form.
//
// POST params:
//  - orderId
//  - name
//  - email
//  - productNames
//
// Configure $toFixed, $from, and (optionally) SMTP via php.ini/mail setup.

header('Content-Type: application/json; charset=utf-8');

function respond($ok, $payload = []) {
  echo json_encode(array_merge(['ok' => $ok], $payload));
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(false, ['error' => 'Invalid method']);
}

$orderId = trim($_POST['orderId'] ?? '');
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$productNames = trim($_POST['productNames'] ?? '');

if ($orderId === '' || $name === '' || $email === '' || $productNames === '') {
  respond(false, ['error' => 'Missing required fields']);
}

$subject = 'Order Request Received! ' . $orderId;

$body = "Hi {$name},\n";
$body .= "We have received your order request for {$productNames}.\n";
$body .= "We are currently checking our warehouse inventory to secure your batch.\n";
$body .= "Once confirmed, we will send over your GoTyme QR code for payment.\n";
$body .= "Expect an update soon!\n";

// NOTE: Set these for your setup.
// If you don't need a custom sender, you can set $from to your site email.
$from = 'Pepzy <no-reply@pepzy.com>'; // change domain/email as needed

$headers = [];
$headers[] = 'From: ' . $from;
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// Safety: avoid header injection
if (preg_match("/\r|\n/", $subject) || preg_match("/\r|\n/", $from)) {
  respond(false, ['error' => 'Header injection detected']);
}

// Send email using PHP mail().
// In many hosting setups this requires proper mail configuration.
$ok = @mail($email, $subject, $body, implode("\r\n", $headers));

// Always return ok even if mail() fails, so checkout flow isn't blocked.
// But we report the status for debugging.
respond(true, ['emailTo' => $email, 'sent' => (bool)$ok]);

// NOTE: This PHP endpoint is kept for legacy/non-Vercel usage.
// The Vercel workflow uses /api/send-order-email instead.


