<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
  exit;
}

// ---------------- helpers ----------------
function e(string $str): string {
  return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function json_error(int $status, string $msg, array $fields = []): void {
  http_response_code($status);
  echo json_encode(['success' => false, 'error' => $msg, 'fields' => $fields]);
  exit;
}
function strip_crlf(string $s): string {
  return str_replace(["\r", "\n"], '', $s);
}
function dash_if_empty($v): string {
  $v = trim((string)$v);
  return $v === '' ? '–' : $v;
}

// ---------------- read payload (multipart/FormData OR JSON) ----------------
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$data = null;

if (stripos($contentType, 'application/json') !== false) {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);
} else {
  $payload = $_POST['payload'] ?? '';
  $data = json_decode($payload, true);
}

if (!is_array($data)) json_error(400, 'Payload invalide');
if (!isset($data['items']) || !is_array($data['items'])) json_error(400, 'Payload invalide (items manquant)');

// Honeypot anti-bot
if (!empty($data['website'] ?? '')) {
  echo json_encode(['success' => true]);
  exit;
}

$items = $data['items'];
if (!count($items)) json_error(400, 'Panier vide');

// ---------------- customer validation ----------------
$customer = $data['customer'] ?? [];
$clientEmail     = trim((string)($customer['email'] ?? ''));
$clientName      = trim((string)($customer['name'] ?? ''));
$clientFname     = trim((string)($customer['fname'] ?? ''));
$clientPhone     = trim((string)($customer['phone'] ?? ''));
$clientRetrieval = trim((string)($customer['retrieval'] ?? ''));

$fieldErrors = [];
if ($clientFname === '')     $fieldErrors['fname'] = 'Prénom requis';
if ($clientName === '')      $fieldErrors['name']  = 'Nom requis';
if ($clientEmail === '')     $fieldErrors['email'] = 'E-mail requis';
if ($clientPhone === '')     $fieldErrors['phone'] = 'Téléphone requis';
if ($clientRetrieval === '') $fieldErrors['retrieval'] = 'Créneau requis';

if ($fieldErrors) json_error(422, 'Veuillez compléter vos informations.', $fieldErrors);

if (!filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
  json_error(422, 'Adresse e-mail invalide.', ['email' => 'invalide']);
}
if (!preg_match('/^[0-9+\s().-]{8,}$/', $clientPhone)) {
  json_error(422, 'Numéro de téléphone invalide.', ['phone' => 'invalide']);
}

// ---------------- business rules server-side ----------------
$totalTraiteur = 0;
$totalMignardises = 0;

foreach ($items as $it) {
  $gateau = (string)($it['gateau'] ?? '');
  $qty    = (int)($it['quantite'] ?? 0);

  if (stripos($gateau, 'Traiteur -') === 0 && !preg_match('/feuillet/i', $gateau)) {
    $totalTraiteur += max(0, $qty);
  }
  if ($gateau === 'Mignardises') {
    $totalMignardises += max(0, $qty);
  }
}

if ($totalTraiteur > 0 && $totalTraiteur < 100) {
  json_error(422, 'Veuillez commander un minimum de 100 pièces au total pour le traiteur.');
}
if ($totalMignardises > 0 && $totalMignardises < 60) {
  json_error(422, 'Veuillez commander un minimum de 60 pièces au total pour les mignardises.');
}

// ---------------- email body ----------------
$webpage = e((string)($data['webpage'] ?? ''));
$sentAt  = e((string)($data['sentAt'] ?? date('c')));

$clientBlock = "
<table cellspacing='0' cellpadding='0' style='border-collapse:collapse;border:1px solid #ddd;margin:0 0 16px 0;'>
  <thead>
    <tr style='background:#f5f5f5;'>
      <th colspan='2' style='padding:8px;border:1px solid #ddd;text-align:left;'>Informations client</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style='padding:8px;border:1px solid #ddd;font-weight:600;'>Nom</td><td style='padding:8px;border:1px solid #ddd;'>" . e($clientFname . " " . $clientName) . "</td></tr>
    <tr><td style='padding:8px;border:1px solid #ddd;font-weight:600;'>Créneau retrait</td><td style='padding:8px;border:1px solid #ddd;'>" . e($clientRetrieval) . "</td></tr>
    <tr><td style='padding:8px;border:1px solid #ddd;font-weight:600;'>E-mail</td><td style='padding:8px;border:1px solid #ddd;'>" . e($clientEmail) . "</td></tr>
    <tr><td style='padding:8px;border:1px solid #ddd;font-weight:600;'>Téléphone</td><td style='padding:8px;border:1px solid #ddd;'>" . e($clientPhone) . "</td></tr>
  </tbody>
</table>
";

$thead = "
<thead>
  <tr style='background:#f5f5f5;'>
    <th style='padding:8px;border:1px solid #ddd;'>#</th>
    <th style='padding:8px;border:1px solid #ddd;'>Catégorie</th>
    <th style='padding:8px;border:1px solid #ddd;'>Produit</th>
    <th style='padding:8px;border:1px solid #ddd;'>Variété</th>
    <th style='padding:8px;border:1px solid #ddd;'>Style</th>
    <th style='padding:8px;border:1px solid #ddd;'>Base</th>
    <th style='padding:8px;border:1px solid #ddd;'>Fourrage</th>
    <th style='padding:8px;border:1px solid #ddd;'>Parts</th>
    <th style='padding:8px;border:1px solid #ddd;'>Quantité</th>
    <th style='padding:8px;border:1px solid #ddd;'>Notes</th>
  </tr>
</thead>
";

$rows = '';
$idx = 1;
foreach ($items as $it) {
  $gateau   = dash_if_empty($it['gateau']   ?? '');
  $produit  = dash_if_empty($it['produit']  ?? '');
  $variete  = dash_if_empty($it['variete']  ?? '');
  $style    = dash_if_empty($it['style']    ?? '');
  $base     = dash_if_empty($it['base']     ?? '');
  $fourrage = dash_if_empty($it['fourrage'] ?? '');
  $parts    = dash_if_empty($it['nbParts']  ?? '');
  $qty      = dash_if_empty($it['quantite'] ?? '');
  $custom   = (string)($it['custom'] ?? '');
  $custom   = $custom === '' ? '–' : nl2br(e($custom));

  $rows .= "
  <tr>
    <td style='padding:8px;border:1px solid #ddd;text-align:center;'>" . $idx . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($gateau)   . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($produit)  . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($variete)  . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($style)    . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($base)     . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . e($fourrage) . "</td>
    <td style='padding:8px;border:1px solid #ddd;text-align:right;'>" . e($parts) . "</td>
    <td style='padding:8px;border:1px solid #ddd;text-align:right;'>" . e($qty)   . "</td>
    <td style='padding:8px;border:1px solid #ddd;'>" . $custom . "</td>
  </tr>";
  $idx++;
}

$totalsBlock = "";
if ($totalTraiteur > 0 || $totalMignardises > 0) {
  $totalsBlock = "
  <p style='margin:12px 0 16px 0;'>
    <strong>Total traiteur (hors feuilletés) :</strong> " . (int)$totalTraiteur . " pièces<br>
    <strong>Total mignardises :</strong> " . (int)$totalMignardises . " pièces
  </p>";
}

$subject = 'Nouvelle commande – Panier site La Recette';

$body = "
<html><body style='font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222;'>
  <h2 style='margin:0 0 12px 0;'>Panier envoyé depuis le site</h2>
  <p style='margin:0 0 16px 0;'>
    <strong>Page :</strong> {$webpage}<br>
    <strong>Envoyé le :</strong> {$sentAt}
  </p>
  {$clientBlock}
  {$totalsBlock}
  <table cellspacing='0' cellpadding='0' style='border-collapse:collapse;border:1px solid #ddd;'>
    {$thead}
    <tbody>{$rows}</tbody>
  </table>
</body></html>
";

// ---------------- attachments (limit + mime) ----------------
$maxFiles = 3;
$maxSizeBytes = 5 * 1024 * 1024; // 5MB par fichier

$accepted = [
  'image/jpeg' => 'jpg',
  'image/png'  => 'png',
  'image/webp' => 'webp',
  'image/gif'  => 'gif',
];

// ---------------- send via SMTP (PHPMailer) ----------------
require __DIR__ . '/../vendor/autoload.php';

$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $_ENV[$key] = $value;
    }
}

try {
$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->isSMTP();
$mail->Host       = $_ENV['SMTP_HOST'];
$mail->Port       = (int) $_ENV['SMTP_PORT'];
$mail->SMTPAuth   = true;
$mail->Username   = $_ENV['SMTP_USER'];
$mail->Password   = $_ENV['SMTP_PASS'];
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

$mail->setFrom($_ENV['SMTP_USER'], $_ENV['MAIL_FROM_NAME']);
$mail->addAddress($_ENV['MAIL_TO']);

  // reply-to = client
  $mail->addReplyTo(strip_crlf($clientEmail), strip_crlf($clientFname . ' ' . $clientName));

  $mail->Subject = $subject;
  $mail->isHTML(true);
  $mail->Body    = $body;

  // PJ
  $added = 0;
  foreach ($_FILES as $f) {
    if ($added >= $maxFiles) break;
    if (!isset($f['tmp_name']) || $f['error'] !== UPLOAD_ERR_OK) continue;
    if (($f['size'] ?? 0) > $maxSizeBytes) continue;

    $tmp = (string)$f['tmp_name'];
    $mime = @mime_content_type($tmp) ?: '';
    if (!isset($accepted[$mime])) continue;

    $safeName = preg_replace('/[^a-zA-Z0-9._-]+/', '_', (string)$f['name']);
    $mail->addAttachment($tmp, $safeName);
    $added++;
  }
$mail->SMTPDebug = 2;
$mail->Debugoutput = function($str) { error_log("SMTP: ".$str); };

  $mail->send();
  echo json_encode(['success' => true]);
} catch (Exception $ex) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Erreur SMTP : ' . ($ex->getMessage() ?: 'inconnue')
  ]);
}