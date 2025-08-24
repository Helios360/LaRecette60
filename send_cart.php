<?php
$to   = 'commande@ton-domaine.fr';
$from = 'no-reply@ton-domaine.fr';

header('Content-Type: application/json; charset=utf-8');

// N'autoriser que POST + JSON
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Lecture du JSON brut
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Payload invalide']);
    exit;
}

// Petit honeypot champ "website" vide côté client
if (!empty($data['website'] ?? '')) {
    // Probable bot
    http_response_code(200);
    echo json_encode(['success' => true]); // faire semblant de réussir
    exit;
}

$items = $data['items'];
if (count($items) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Panier vide']);
    exit;
}

// --------- récupération et validation client ---------
$customer = $data['customer'] ?? [];
$clientEmail   = trim((string)($customer['email'] ?? ''));
$clientName    = trim((string)($customer['name'] ?? ''));
$clientAddress = trim((string)($customer['address'] ?? ''));

// Validation simple côté serveur (miroir du front)
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

// Sanitize & helpers
function e($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function strip_crlf($s) {
    // Prévention injection d’en-têtes (CRLF)
    return str_replace(["\r", "\n"], '', (string)$s);
}

// Construire le corps du mail (HTML)
$rows = '';
$idx = 1;
foreach ($items as $it) {
    $base    = e($it['base']    ?? '');
    $fourrage= e($it['fourrage']?? '');
    $nbParts = e($it['nbParts'] ?? '');
    $custom  = nl2br(e($it['custom']  ?? ''));
    $rows .= "
      <tr>
        <td style='padding:8px;border:1px solid #ddd;text-align:center;'>$idx</td>
        <td style='padding:8px;border:1px solid #ddd;'>$base</td>
        <td style='padding:8px;border:1px solid #ddd;'>$fourrage</td>
        <td style='padding:8px;border:1px solid #ddd;text-align:right;'>$nbParts</td>
        <td style='padding:8px;border:1px solid #ddd;'>$custom</td>
      </tr>";
    $idx++;
}

$webpage = e($data['webpage'] ?? '');
$sentAt  = e($data['sentAt'] ?? date('c'));

// --------- bloc informations client ---------
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

// Sujet + corps
$subject = 'Nouvelle commande – Panier site La Recette';
$body = "
  <html><body style='font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#222;'>
    <h2 style='margin:0 0 12px 0;'>Panier envoyé depuis le site</h2>
    <p style='margin:0 0 16px 0;'>
      <strong>Page :</strong> {$webpage}<br>
      <strong>Envoyé le :</strong> {$sentAt}
    </p>

    {$clientBlock}

    <table cellspacing='0' cellpadding='0' style='border-collapse:collapse;border:1px solid #ddd;'>
      <thead>
        <tr style='background:#f5f5f5;'>
          <th style='padding:8px;border:1px solid #ddd;'>#</th>
          <th style='padding:8px;border:1px solid #ddd;'>Base</th>
          <th style='padding:8px;border:1px solid #ddd;'>Fourrage</th>
          <th style='padding:8px;border:1px solid #ddd;'>Parts</th>
          <th style='padding:8px;border:1px solid #ddd;'>Personnalisation</th>
        </tr>
      </thead>
      <tbody>
        {$rows}
      </tbody>
    </table>
  </body></html>
";

// En-têtes mail
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/html; charset=UTF-8";
$headers[] = "From: La Recette <" . strip_crlf($from) . ">";

$headers[] = "Reply-To: " . strip_crlf($clientName) . " <" . strip_crlf($clientEmail) . ">";
$headers[] = "X-Mailer: PHP/" . phpversion();

// Envoi
$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Échec mail() sur l’hébergement']);
}
