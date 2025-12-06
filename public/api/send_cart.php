<?php
$to   = 'commande@email.fr';
$from = 'no-reply@domainname.com';

header('Content-Type: application/json; charset=utf-8');

// Only allow POST with JSON body
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
  exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['items']) || !is_array($data['items'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Payload invalide']);
  exit;
}

// Honeypot "website" (should be empty)
if (!empty($data['website'] ?? '')) {
  echo json_encode(['success' => true]); // pretend success for bots
  exit;
}

$items = $data['items'];
if (!count($items)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Panier vide']);
  exit;
}

// --------- customer parsing / validation ---------
$customer = $data['customer'] ?? [];
$clientEmail   = trim((string)($customer['email'] ?? ''));
$clientName    = trim((string)($customer['name'] ?? ''));
$clientAddress = trim((string)($customer['address'] ?? ''));

if ($clientName === '' || $clientAddress === '' || $clientEmail === '') {
  http_response_code(422);
  echo json_encode(['success' => false, 'error' => 'Nom, adresse et e-mail sont requis.']);
  exit;
}
if (!filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['success' => false, 'error' => 'Adresse e-mail invalide.']);
  exit;
}

// --------- helpers ---------
function e($str) {
  return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function strip_crlf($s) {
  return str_replace(["\r", "\n"], '', (string)$s);
}
function dash_if_empty($v) {
  $v = trim((string)$v);
  return $v === '' ? '–' : $v;
}

// --------- server-side business rules (mirror of front) ---------
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
  http_response_code(422);
  echo json_encode(['success' => false, 'error' => 'Veuillez commander un minimum de 100 pièces au total pour le traiteur.']);
  exit;
}
if ($totalMignardises > 0 && $totalMignardises < 60) {
  http_response_code(422);
  echo json_encode(['success' => false, 'error' => 'Veuillez commander un minimum de 60 pièces au total pour les mignardises.']);
  exit;
}

// --------- build email body ---------
$webpage = e($data['webpage'] ?? '');
$sentAt  = e($data['sentAt'] ?? date('c'));

$clientBlock = "
  <table cellspacing='0' cellpadding='0' style='border-collapse:collapse;border:1px solid #ddd;margin:0 0 16px 0;'>
    <thead>
      <tr style='background:#f5f5f5;'>
        <th colspan='2' style='padding:8px;border:1px solid #ddd;text-align:left;'>Informations client</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style='padding:8px;border:1px solid #ddd;font-weight:600;'>Nom</td>
        <td style='padding:8px;border:1px solid #ddd;'>" . e($clientName) . "</td>
      </tr>
      <tr>
        <td style='padding:8px;border:1px solid #ddd;font-weight:600;'>E-mail</td>
        <td style='padding:8px;border:1px solid #ddd;'>" . e($clientEmail) . "</td>
      </tr>
      <tr>
        <td style='padding:8px;border:1px solid #ddd;font-weight:600;'>Adresse</td>
        <td style='padding:8px;border:1px solid #ddd;white-space:pre-line;'>" . nl2br(e($clientAddress)) . "</td>
      </tr>
    </tbody>
  </table>
";

// Fixed columns to cover all cases from the new JS
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
$idx  = 1;
foreach ($items as $it) {
  $gateau   = dash_if_empty($it['gateau']   ?? '');
  $produit  = dash_if_empty($it['produit']  ?? '');
  $variete  = dash_if_empty($it['variete']  ?? '');
  $style    = dash_if_empty($it['style']    ?? '');
  $base     = dash_if_empty($it['base']     ?? '');
  $fourrage = dash_if_empty($it['fourrage'] ?? '');
  $parts    = dash_if_empty($it['nbParts']  ?? '');
  $qty      = dash_if_empty($it['quantite'] ?? '');
  $custom   = $it['custom'] ?? '';
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
    </p>
  ";
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
      <tbody>
        {$rows}
      </tbody>
    </table>
  </body></html>
";

// --------- headers & send ---------
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/html; charset=UTF-8";
$headers[] = "From: La Recette <" . strip_crlf($from) . ">";
$headers[] = "Reply-To: " . strip_crlf($clientName) . " <" . strip_crlf($clientEmail) . ">";
$headers[] = "X-Mailer: PHP/" . phpversion();

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($ok) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Échec mail() sur l’hébergement']);
}