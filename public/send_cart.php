<?php
// send_cart.php
// -----------------------
// CONFIG
$to = 'commande@ton-domaine.fr'; // <-- Mets ici l'adresse de réception
$from = 'no-reply@ton-domaine.fr'; // Un expéditeur du même domaine (SPF/DMARC)

// Sécurité basique CORS (même origine par défaut). Si tu appelles depuis un sous-domaine, adapte.
// header('Access-Control-Allow-Origin: https://www.larecette60.com');
header('Content-Type: application/json; charset=utf-8');

// N'autoriser que POST + JSON
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Lecture du JSON brut
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Payload invalide']);
    exit;
}

// Petit honeypot possible si tu ajoutes un champ "website" vide côté client
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

// Sanitize & formatage
function e($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Construire le corps du mail (HTML)
$rows = '';
$idx = 1;
foreach ($items as $it) {
    $base = e($it['base'] ?? '');
    $fourrage = e($it['fourrage'] ?? '');
    $nbParts = e($it['nbParts'] ?? '');
    $custom = nl2br(e($it['custom'] ?? ''));
    $rows .= "
      <tr>
        <td style='padding:8px;border:1px solid #ddd;'>$idx</td>
        <td style='padding:8px;border:1px solid #ddd;'>$base</td>
        <td style='padding:8px;border:1px solid #ddd;'>$fourrage</td>
        <td style='padding:8px;border:1px solid #ddd;'>$nbParts</td>
        <td style='padding:8px;border:1px solid #ddd;'>$custom</td>
      </tr>";
    $idx++;
}

$webpage = e($data['webpage'] ?? '');
$sentAt  = e($data['sentAt'] ?? date('c'));

$subject = 'Nouvelle commande – Panier site La Recette';
$body = "
  <html><body>
    <h2>Panier envoyé depuis le site</h2>
    <p><strong>Page :</strong> {$webpage}<br>
       <strong>Envoyé le :</strong> {$sentAt}</p>
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
$headers[] = "Content-type: text/html; charset=UTF-8";
$headers[] = "From: La Recette <{$from}>";
$headers[] = "Reply-To: {$from}";
$headers[] = "X-Mailer: PHP/" . phpversion();

// Envoi
$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Échec mail() sur l’hébergement']);
}
